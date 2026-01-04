import express from 'express'
import { body, query, param, validationResult } from 'express-validator'
import { Menu } from '../models/Menu.js'
import { auth, requireEditor } from '../middleware/auth.js'

const router = express.Router()

// 获取菜单列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('type').optional().custom((value) => {
    if (value === '' || value === undefined) return true
    return ['road-bikes', 'gravel-bikes', 'mountain-bikes', 'e-bikes', 'gear', 'service', 'custom'].includes(value)
  }).withMessage('无效的菜单类型'),
  query('keyword').optional().trim(),
  query('isActive').optional().isBoolean().withMessage('isActive必须是布尔值')
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

    // 构建查询选项
    const options = {
      page,
      limit,
      type: req.query.type && req.query.type.trim() ? req.query.type.trim() : undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      keyword: req.query.keyword && req.query.keyword.trim() ? req.query.keyword.trim() : undefined
    }

    // 执行查询
    const result = await Menu.findMany(options)

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    console.error('Get menus error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取单个菜单
router.get('/:slug', [
  param('slug').isSlug().withMessage('无效的slug格式')
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

    const menu = await Menu.findBySlug(req.params.slug)

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: '菜单不存在'
      })
    }

    // 增加查看次数
    await menu.incrementViewCount()

    res.json({
      success: true,
      data: menu
    })
  } catch (error) {
    console.error('Get menu error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 创建菜单
router.post('/', auth, requireEditor, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('菜单名称长度必须在1-100字符之间'),
  body('slug').isSlug().withMessage('无效的slug格式'),
  body('type').isIn(['road-bikes', 'gravel-bikes', 'mountain-bikes', 'e-bikes', 'gear', 'service', 'custom']).withMessage('无效的菜单类型'),
  body('content.zh.title').trim().isLength({ min: 1, max: 200 }).withMessage('中文标题长度必须在1-200字符之间'),
  body('content.zh.body').trim().isLength({ min: 1 }).withMessage('中文内容不能为空'),
  body('content.en.title').trim().isLength({ min: 1, max: 200 }).withMessage('英文标题长度必须在1-200字符之间'),
  body('content.en.body').trim().isLength({ min: 1 }).withMessage('英文内容不能为空'),
  body('content.zh.description').optional().trim().isLength({ max: 500 }).withMessage('中文描述不能超过500字符'),
  body('content.en.description').optional().trim().isLength({ max: 500 }).withMessage('英文描述不能超过500字符'),
  body('content.zh.metaTitle').optional().trim().isLength({ max: 200 }).withMessage('中文SEO标题不能超过200字符'),
  body('content.en.metaTitle').optional().trim().isLength({ max: 200 }).withMessage('英文SEO标题不能超过200字符'),
  body('content.zh.metaDescription').optional().trim().isLength({ max: 300 }).withMessage('中文SEO描述不能超过300字符'),
  body('content.en.metaDescription').optional().trim().isLength({ max: 300 }).withMessage('英文SEO描述不能超过300字符'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序值必须是非负整数'),
  body('isActive').optional().isBoolean().withMessage('isActive必须是布尔值'),
  body('coverImage').optional().isURL().withMessage('封面图片必须是有效的URL'),
  body('tags').optional().isArray().withMessage('标签必须是数组格式')
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

    const {
      name,
      slug,
      type,
      content,
      sortOrder = 0,
      isActive = true,
      coverImage,
      tags = []
    } = req.body

    // 检查slug是否已存在
    const existingMenu = await Menu.findBySlug(slug)
    if (existingMenu) {
      return res.status(400).json({
        success: false,
        message: '该slug已存在，请使用其他slug'
      })
    }

    // 创建菜单
    const menuData = {
      name,
      slug,
      type,
      content,
      sort_order: sortOrder,
      is_active: isActive,
      cover_image: coverImage,
      tags,
      created_by: req.user.id,
      updated_by: req.user.id
    }

    const menu = await Menu.create(menuData)

    res.status(201).json({
      success: true,
      message: '菜单创建成功',
      data: menu
    })
  } catch (error) {
    console.error('Create menu error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 更新菜单
router.put('/:id', auth, requireEditor, [
  param('id').isMongoId().withMessage('无效的菜单ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('菜单名称长度必须在1-100字符之间'),
  body('slug').optional().isSlug().withMessage('无效的slug格式'),
  body('type').optional().isIn(['road-bikes', 'gravel-bikes', 'mountain-bikes', 'e-bikes', 'gear', 'service', 'custom']).withMessage('无效的菜单类型'),
  body('content.zh.title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('中文标题长度必须在1-200字符之间'),
  body('content.zh.body').optional().trim().isLength({ min: 1 }).withMessage('中文内容不能为空'),
  body('content.en.title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('英文标题长度必须在1-200字符之间'),
  body('content.en.body').optional().trim().isLength({ min: 1 }).withMessage('英文内容不能为空'),
  body('content.zh.description').optional().trim().isLength({ max: 500 }).withMessage('中文描述不能超过500字符'),
  body('content.en.description').optional().trim().isLength({ max: 500 }).withMessage('英文描述不能超过500字符'),
  body('content.zh.metaTitle').optional().trim().isLength({ max: 200 }).withMessage('中文SEO标题不能超过200字符'),
  body('content.en.metaTitle').optional().trim().isLength({ max: 200 }).withMessage('英文SEO标题不能超过200字符'),
  body('content.zh.metaDescription').optional().trim().isLength({ max: 300 }).withMessage('中文SEO描述不能超过300字符'),
  body('content.en.metaDescription').optional().trim().isLength({ max: 300 }).withMessage('英文SEO描述不能超过300字符'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序值必须是非负整数'),
  body('isActive').optional().isBoolean().withMessage('isActive必须是布尔值'),
  body('coverImage').optional().isURL().withMessage('封面图片必须是有效的URL'),
  body('tags').optional().isArray().withMessage('标签必须是数组格式')
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

    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: '菜单不存在'
      })
    }

    // 如果更新slug，检查是否与其他菜单冲突
    if (req.body.slug && req.body.slug !== menu.slug) {
      const existingMenu = await Menu.findBySlug(req.body.slug)
      if (existingMenu && existingMenu.id !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: '该slug已存在，请使用其他slug'
        })
      }
    }

    // 构建更新数据
    const updateData = {}
    const updateFields = ['name', 'slug', 'type', 'content', 'sortOrder', 'isActive', 'coverImage', 'tags']
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'content') {
          // 合并内容对象
          updateData.content = { ...menu.content, ...req.body.content }
        } else if (field === 'sortOrder') {
          updateData.sort_order = req.body[field]
        } else if (field === 'isActive') {
          updateData.is_active = req.body[field]
        } else if (field === 'coverImage') {
          updateData.cover_image = req.body[field]
        } else {
          updateData[field] = req.body[field]
        }
      }
    })

    updateData.updated_by = req.user.id

    await menu.update(updateData)

    res.json({
      success: true,
      message: '菜单更新成功',
      data: menu
    })
  } catch (error) {
    console.error('Update menu error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 删除菜单
router.delete('/:id', auth, requireEditor, [
  param('id').isMongoId().withMessage('无效的菜单ID')
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

    const menu = await Menu.findById(req.params.id)

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: '菜单不存在'
      })
    }

    await menu.delete()

    res.json({
      success: true,
      message: '菜单删除成功'
    })
  } catch (error) {
    console.error('Delete menu error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取指定类型的所有菜单（用于导航）
router.get('/type/:type', [
  param('type').isIn(['road-bikes', 'gravel-bikes', 'mountain-bikes', 'e-bikes', 'gear', 'service', 'custom']).withMessage('无效的菜单类型')
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

    const menus = await Menu.findByType(req.params.type)

    res.json({
      success: true,
      data: menus
    })
  } catch (error) {
    console.error('Get menus by type error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 批量更新菜单排序
router.put('/batch/sort', auth, requireEditor, [
  body('menus').isArray().withMessage('menus必须是数组'),
  body('menus.*.id').isMongoId().withMessage('菜单ID格式错误'),
  body('menus.*.sortOrder').isInt({ min: 0 }).withMessage('排序值必须是非负整数')
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

    const { menus } = req.body

    // 批量更新排序
    const updatePromises = menus.map(async menu => {
      const menuObj = await Menu.findById(menu.id)
      if (menuObj) {
        return menuObj.update({
          sort_order: menu.sortOrder,
          updated_by: req.user.id
        })
      }
    })

    await Promise.all(updatePromises)

    res.json({
      success: true,
      message: '菜单排序更新成功'
    })
  } catch (error) {
    console.error('Batch update sort error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

export default router
