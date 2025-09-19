import mongoose from 'mongoose'

const menuSchema = new mongoose.Schema({
  // 菜单基本信息
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  type: {
    type: String,
    required: true,
    enum: ['road-bikes', 'gravel-bikes', 'mountain-bikes', 'e-bikes', 'gear', 'service', 'custom']
  },
  
  // 多语言内容
  content: {
    zh: {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },
      description: {
        type: String,
        trim: true,
        maxlength: 500
      },
      body: {
        type: String,
        required: true
      },
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 200
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 300
      }
    },
    en: {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },
      description: {
        type: String,
        trim: true,
        maxlength: 500
      },
      body: {
        type: String,
        required: true
      },
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 200
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 300
      }
    }
  },
  
  // 菜单配置
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // 封面图片
  coverImage: {
    type: String,
    default: null
  },
  
  // 标签和分类
  tags: [{
    type: String,
    trim: true
  }],
  
  // 创建和更新信息
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 统计信息
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// 索引
menuSchema.index({ slug: 1 })
menuSchema.index({ type: 1, isActive: 1 })
menuSchema.index({ sortOrder: 1 })
menuSchema.index({ 'content.zh.title': 'text', 'content.en.title': 'text' })
menuSchema.index({ createdAt: -1 })

// 虚拟字段：获取当前语言的标题
menuSchema.virtual('currentTitle').get(function() {
  return this.content.zh?.title || this.content.en?.title || this.name
})

// 虚拟字段：获取当前语言的描述
menuSchema.virtual('currentDescription').get(function() {
  return this.content.zh?.description || this.content.en?.description || ''
})

// 确保虚拟字段在JSON序列化时包含
menuSchema.set('toJSON', { virtuals: true })

// 静态方法：根据slug获取菜单
menuSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true })
}

// 静态方法：获取指定类型的所有菜单
menuSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true }).sort({ sortOrder: 1, createdAt: -1 })
}

// 实例方法：增加查看次数
menuSchema.methods.incrementViewCount = function() {
  this.viewCount += 1
  return this.save()
}

export default mongoose.models.Menu || mongoose.model('Menu', menuSchema)
