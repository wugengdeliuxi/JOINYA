import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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

// 上传到 Cloudinary
export const uploadToCloudinary = async (file, folder = 'joinya-uploads') => {
  try {
    if (!file) {
      throw new Error('没有文件上传')
    }

    // 生成唯一文件名
    const fileExtension = file.originalname.split('.').pop()
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`
    
    // 上传到 Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: fileName,
          folder: folder,
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(file.buffer)
    })

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      filename: fileName,
      size: file.size,
      mimetype: file.mimetype,
      width: result.width,
      height: result.height
    }
  } catch (error) {
    console.error('上传到 Cloudinary 失败:', error)
    throw new Error('文件上传失败: ' + error.message)
  }
}

// 批量上传
export const uploadMultipleToCloudinary = async (files, folder = 'joinya-uploads') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('没有文件上传')
    }

    const uploadPromises = files.map(file => uploadToCloudinary(file, folder))
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
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      message: result.result === 'ok' ? '文件删除成功' : '文件删除失败'
    }
  } catch (error) {
    console.error('删除文件失败:', error)
    throw new Error('删除文件失败: ' + error.message)
  }
}

export { upload }
export default upload
