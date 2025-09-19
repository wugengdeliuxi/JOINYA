import express from 'express'
import { body, query, validationResult } from 'express-validator'
import Material from '../models/Material.js'
import { auth, requireEditor } from '../middleware/auth.js'
import { upload, uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../lib/upload-cloudinary.js'
import { handleUploadError } from '../middleware/upload.js'

const router = express.Router()

// 获取素材列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('keyword').optional().trim(),
  query('type').optional().custom((value) => {
    if (value === '' || value === undefined) return true
    return ['image', 'video', 'document'].includes(value)
  }).withMessage('无效的素材类型'),
  query('category').optional().custom((value) => {
    if (value === '' || value === undefined) return true
    return ['product', 'background', 'logo', 'hero', 'other'].includes(value)
  }).withMessage('无效的分类')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    // 构建查询条件
    const query = { isPublic: true }
    
    if (req.query.keyword && req.query.keyword.trim()) {
      query.$text = { $search: req.query.keyword }
    }
    
    if (req.query.type && req.query.type.trim()) {
      query.type = req.query.type
    }
    
    if (req.query.category && req.query.category.trim()) {
      query.category = req.query.category
    }

    // 执行查询
    const [materials, total] = await Promise.all([
      Material.find(query)
        .populate('uploadedBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Material.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / limit)

    res.json({
      success: true,
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Get materials error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 上传素材
router.post('/upload', auth, requireEditor, upload.single('file'), [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('素材名称长度必须在1-100字符之间'),
  body('category').isIn(['product', 'background', 'logo', 'hero', 'other']).withMessage('无效的分类'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('描述不能超过500字符'),
  body('tags').optional().isString().withMessage('标签格式错误')
], async (req, res) => {
  try {
    // 调试信息
    console.log('上传请求信息:')
    console.log('  req.file:', req.file)
    console.log('  req.body:', req.body)
    console.log('  req.headers:', req.headers['content-type'])

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      })
    }

    if (!req.file) {
      console.log('❌ 没有检测到文件')
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      })
    }

    const { name, category, description, tags } = req.body
    const file = req.file

    // 确定素材类型
    let type = 'document'
    if (file.mimetype.startsWith('image/')) {
      type = 'image'
    } else if (file.mimetype.startsWith('video/')) {
      type = 'video'
    }

    // 处理标签
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    // 上传到Cloudinary
    console.log('文件信息:')
    console.log('  file.originalname:', file.originalname)
    console.log('  file.mimetype:', file.mimetype)
    console.log('  file.size:', file.size)
    
    const uploadResult = await uploadToCloudinary(file, 'joinya-materials')
    console.log('  上传结果:', uploadResult)
    
    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: '文件上传失败'
      })
    }
    
    const fileUrl = uploadResult.url

    // 创建素材记录
    const material = new Material({
      name,
      type,
      category,
      url: fileUrl,
      size: file.size,
      mimeType: file.mimetype,
      description: description || '',
      tags: tagArray,
      uploadedBy: req.user._id,
      // 保存Cloudinary信息
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryVersion: uploadResult.version,
      cloudinarySignature: uploadResult.signature
    })

    await material.save()

    // 填充上传者信息
    await material.populate('uploadedBy', 'username')

    res.status(201).json({
      success: true,
      message: '素材上传成功',
      data: material
    })
  } catch (error) {
    console.error('Upload material error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取单个素材
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'username')
      .lean()

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '素材不存在'
      })
    }

    // 增加查看次数
    await Material.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } })

    res.json({
      success: true,
      data: material
    })
  } catch (error) {
    console.error('Get material error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 删除素材
router.delete('/:id', auth, requireEditor, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '素材不存在'
      })
    }

    // 检查权限：只有上传者或管理员可以删除
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }

    // 如果有Cloudinary public_id，先删除Cloudinary中的文件
    if (material.cloudinaryPublicId) {
      try {
        const deleteResult = await deleteFromCloudinary(material.cloudinaryPublicId)
        console.log('Cloudinary删除结果:', deleteResult)
      } catch (error) {
        console.error('删除Cloudinary文件失败:', error)
        // 即使Cloudinary删除失败，也继续删除数据库记录
      }
    }

    await Material.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: '素材删除成功'
    })
  } catch (error) {
    console.error('Delete material error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 更新素材信息
router.put('/:id', auth, requireEditor, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('素材名称长度必须在1-100字符之间'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('描述不能超过500字符'),
  body('tags').optional().isString().withMessage('标签格式错误')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      })
    }

    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '素材不存在'
      })
    }

    // 检查权限
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }

    const { name, description, tags } = req.body

    // 更新字段
    if (name) material.name = name
    if (description !== undefined) material.description = description
    if (tags !== undefined) {
      material.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    }

    await material.save()
    await material.populate('uploadedBy', 'username')

    res.json({
      success: true,
      message: '素材更新成功',
      data: material
    })
  } catch (error) {
    console.error('Update material error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取文件下载链接
router.get('/:id/download', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'username')
      .lean()

    if (!material) {
      return res.status(404).json({
        success: false,
        message: '素材不存在'
      })
    }

    // 返回文件信息和下载链接
    res.json({
      success: true,
      data: {
        id: material._id,
        name: material.name,
        type: material.type,
        category: material.category,
        url: material.url,
        size: material.size,
        mimeType: material.mimeType,
        description: material.description,
        tags: material.tags,
        uploadedBy: material.uploadedBy,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
        // 下载链接（直接使用Cloudinary URL）
        downloadUrl: material.url,
        // 如果需要缩略图
        thumbnailUrl: material.thumbnail || material.url
      }
    })
  } catch (error) {
    console.error('Get download link error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取Hero素材
router.get('/heroes', async (req, res) => {
  try {
    const heroes = await Material.find({ 
      category: 'hero', 
      isPublic: true 
    }).sort({ createdAt: -1 }).lean()
    
    res.json({
      success: true,
      data: heroes
    })
  } catch (error) {
    console.error('获取Hero失败:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 添加文件上传错误处理
router.use(handleUploadError)

export default router
