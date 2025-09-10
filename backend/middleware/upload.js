import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型创建子目录
    let subDir = 'general'
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images'
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos'
    } else if (file.mimetype.startsWith('application/')) {
      subDir = 'documents'
    }
    
    const targetDir = path.join(uploadDir, subDir)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    
    cb(null, targetDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳-随机数-原文件名
    const timestamp = Date.now()
    const random = Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    const filename = `${timestamp}-${random}-${name}${ext}`
    cb(null, filename)
  }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'image/svg+xml': true,
    'video/mp4': true,
    'video/webm': true,
    'video/ogg': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
  }
  
  if (allowedTypes[file.mimetype]) {
    cb(null, true)
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false)
  }
}

// 创建multer实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5 // 最多5个文件
  }
})

// 错误处理中间件
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制（最大50MB）'
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: '文件数量超过限制（最多5个）'
      })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '意外的文件字段'
      })
    }
  }
  
  if (error.message.includes('不支持的文件类型')) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
  
  next(error)
}

// 生成文件URL
export const generateFileUrl = (req, filename) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://joinya-api.vercel.app'
    : `http://localhost:${process.env.PORT || 3002}`
  
  // 从文件路径中提取子目录
  const relativePath = filename.replace(uploadDir, '').replace(/\\/g, '/')
  return `${baseUrl}/uploads${relativePath}`
}
