import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['image', 'video', 'document'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['product', 'background', 'logo', 'other']
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  // Cloudinary相关字段
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  cloudinaryVersion: {
    type: String,
    default: null
  },
  cloudinarySignature: {
    type: String,
    default: null
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// 索引
materialSchema.index({ name: 'text', description: 'text', tags: 'text' })
materialSchema.index({ category: 1, type: 1 })
materialSchema.index({ uploadedBy: 1 })
materialSchema.index({ createdAt: -1 })

// 虚拟字段：文件大小格式化
materialSchema.virtual('formattedSize').get(function() {
  const bytes = this.size
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
})

// 确保虚拟字段在JSON序列化时包含
materialSchema.set('toJSON', { virtuals: true })

export default mongoose.models.Material || mongoose.model('Material', materialSchema)
