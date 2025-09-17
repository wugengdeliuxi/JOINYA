import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
})

// 检查Cloudinary配置
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary配置不完整，请设置以下环境变量：')
  console.warn('   CLOUDINARY_CLOUD_NAME')
  console.warn('   CLOUDINARY_API_KEY')
  console.warn('   CLOUDINARY_API_SECRET')
  console.warn('   当前使用默认值，上传功能可能无法正常工作')
}

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

    // 检查Cloudinary配置是否完整
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary配置不完整，返回模拟上传结果')
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`
      
      return {
        success: true,
        url: `https://via.placeholder.com/400x300/cccccc/666666?text=${encodeURIComponent(file.originalname)}`,
        filename: fileName,
        size: file.size,
        mimetype: file.mimetype,
        public_id: fileName,
        version: '1',
        signature: 'demo_signature',
        width: 400,
        height: 300,
        note: '这是模拟的上传结果，请配置Cloudinary环境变量'
      }
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
      height: result.height,
      version: result.version,
      signature: result.signature
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
    // 检查Cloudinary配置是否完整
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary配置不完整，跳过删除操作')
      return {
        success: true,
        message: '模拟删除成功（Cloudinary配置不完整）'
      }
    }

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
