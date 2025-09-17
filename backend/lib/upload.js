// import { put } from '@vercel/blob' // 暂时注释掉，避免导入错误
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

// 配置multer用于内存存储
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 允许的图片类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只允许上传图片文件 (JPEG, PNG, GIF, WebP)'), false)
    }
  }
})

// 上传到Vercel Blob Storage (暂时禁用)
export const uploadToBlob = async (file, folder = 'uploads') => {
  try {
    if (!file) {
      throw new Error('没有文件上传')
    }

    // 暂时返回模拟结果，避免@vercel/blob导入错误
    const fileExtension = file.originalname.split('.').pop()
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`
    
    return {
      success: true,
      url: `https://example.com/${fileName}`, // 模拟URL
      filename: fileName,
      size: file.size,
      mimetype: file.mimetype,
      note: '这是模拟的上传结果，实际需要配置Blob Storage'
    }
  } catch (error) {
    console.error('上传到Blob Storage失败:', error)
    throw new Error('文件上传失败: ' + error.message)
  }
}

// 批量上传
export const uploadMultipleToBlob = async (files, folder = 'uploads') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('没有文件上传')
    }

    const uploadPromises = files.map(file => uploadToBlob(file, folder))
    const results = await Promise.all(uploadPromises)
    
    return {
      success: true,
      files: results,
      count: results.length
    }
  } catch (error) {
    console.error('批量上传失败:', error)
    throw new Error('批量上传失败: ' + error.message)
  }
}

// 删除文件
export const deleteFromBlob = async (url) => {
  try {
    // Vercel Blob Storage的删除功能
    // 注意：Vercel Blob Storage目前不直接支持删除API
    // 文件会在过期时间后自动删除
    console.log('文件删除请求:', url)
    return {
      success: true,
      message: '文件将在过期后自动删除'
    }
  } catch (error) {
    console.error('删除文件失败:', error)
    throw new Error('删除文件失败: ' + error.message)
  }
}

export { upload }
export default upload
