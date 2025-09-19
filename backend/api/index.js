import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// 同步导入路由模块
import authRoutes from './auth.js'
import materialsRoutes from './materials.js'
import productsRoutes from './products.js'
import usersRoutes from './users.js'
import menusRoutes from './menus.js'

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量 - 指定.env文件路径
const envPath = join(__dirname, '..', '.env')
const result = dotenv.config({ path: envPath })

// 调试输出 (仅在非生产环境)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 环境变量加载状态:')
  console.log(`   .env 文件路径: ${envPath}`)
  console.log(`   加载结果: ${result.error ? '失败 - ' + result.error.message : '成功'}`)
  console.log(`   MONGODB_URI 存在: ${process.env.MONGODB_URI ? '是' : '否'}`)
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || '未设置'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// 创建应用实例
const app = express()

// 在Vercel环境中信任代理
if (process.env.VERCEL) {
  app.set('trust proxy', true)
}

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://joinya-admin:3AWc8DFZf7Papo5u@joinya-cluster.qpogy8c.mongodb.net/?retryWrites=true&w=majority&appName=joinya-cluster')
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message)
    console.log('💡 请检查 .env 文件中的 MONGODB_URI 配置')
  }
}

// 设置基础路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'JOINYA Backend API Server',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health'
  })
})


// 中间件
app.use(helmet())

// 全局CORS配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://joinya-admin2.vercel.app',
        'https://joinya-admin.vercel.app',
        'https://joinya-web.vercel.app', // 如果您的web应用也部署在Vercel
        'https://joinya.vercel.app' // 如果您的web应用部署在这个域名
      ]
    : true, // 开发环境允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}

app.use(cors(corsOptions))
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务 - 提供上传文件的访问
if (!process.env.VERCEL) {
  // 只在非Vercel环境（本地开发）中提供静态文件服务
  const uploadsPath = join(__dirname, '..', 'uploads')
  console.log('📁 静态文件服务路径:', uploadsPath)
  console.log('📁 __dirname:', __dirname)

  // 静态文件服务 - 添加跨域资源策略支持
  app.use('/uploads', (req, res, next) => {
    // 设置跨域资源策略为 cross-origin，允许跨域访问
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  }, express.static(uploadsPath))
} else {
  // Vercel环境下的静态文件处理
  app.use('/uploads', (req, res) => {
    res.status(404).json({
      success: false,
      message: '静态文件服务在Vercel环境中不可用，请使用其他文件存储服务'
    })
  })
}

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  // 在Vercel环境中正确识别IP
  standardHeaders: true,
  legacyHeaders: false,
  // 信任代理设置
  trustProxy: process.env.VERCEL ? true : false
})
app.use('/api/', limiter)

// API路由将在异步初始化中设置

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  console.error('Error stack:', err.stack)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    })
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  })
})

// 应用启动函数
async function startApp() {
  try {
    // 连接数据库
    await connectDB()
    
    // 设置API路由（使用同步导入）
    app.use('/api/auth', authRoutes)
    app.use('/api/materials', materialsRoutes)
    app.use('/api/products', productsRoutes)
    app.use('/api/users', usersRoutes)
    app.use('/api/menus', menusRoutes)
    
    console.log('✅ API路由已设置:')
    console.log('   - /api/auth')
    console.log('   - /api/materials') 
    console.log('   - /api/products')
    console.log('   - /api/users')
    
    // 404处理 - 在所有路由之后
    app.use('/api/*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        message: 'API端点不存在' 
      })
    })
    
    // 本地开发服务器启动
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const PORT = process.env.PORT || 3002
      app.listen(PORT, () => {
        console.log('🚀 JOINYA Backend API Server 启动成功')
        console.log(`📍 服务地址: http://localhost:${PORT}`)
        console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`)
        console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
        console.log('📊 API 端点:')
        console.log('   - POST /api/auth/login')
        console.log('   - POST /api/auth/register') 
        console.log('   - GET  /api/materials')
        console.log('   - GET  /api/products')
        console.log('   - GET  /api/users')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      })
    }
    
  } catch (error) {
    console.error('❌ 应用启动失败:', error.message)
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1)
    }
  }
}

// 如果是 Vercel 环境，需要立即初始化
if (process.env.VERCEL) {
  // Vercel 环境下的简化初始化
  connectDB().catch(console.error)
  
  // 立即设置基础路由（同步）
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      vercel: process.env.VERCEL ? 'true' : 'false'
    })
  })
  
  app.get('/', (req, res) => {
    res.json({
      message: 'JOINYA Backend API Server',
      version: '1.0.0',
      status: 'running',
      docs: '/api/health'
    })
  })
  
  // 简化的测试路由
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'Vercel环境测试',
      timestamp: new Date().toISOString(),
      status: 'success'
    })
  })
  
  // 测试materials路由是否已加载
  app.get('/api/test-materials', (req, res) => {
    res.json({
      message: 'Materials路由测试',
      timestamp: new Date().toISOString(),
      status: 'success',
      note: '如果这个能访问，说明基础路由正常'
    })
  })
  
  // 直接测试materials路径
  app.get('/api/materials-direct', (req, res) => {
    res.json({
      success: true,
      message: 'Materials 直接测试路由',
      timestamp: new Date().toISOString(),
      query: req.query,
      note: '这是直接在主文件中定义的路由'
    })
  })
  
  // 直接测试auth路径
  app.get('/api/auth-direct', (req, res) => {
    res.json({
      success: true,
      message: 'Auth 直接测试路由',
      timestamp: new Date().toISOString(),
      note: '这是直接在主文件中定义的auth路由'
    })
  })
  
  // 简单的login测试路由
  app.post('/api/auth-direct/login', (req, res) => {
    res.json({
      success: true,
      message: 'Auth Login 直接测试路由',
      timestamp: new Date().toISOString(),
      body: req.body,
      note: '这是直接在主文件中定义的login路由'
    })
  })
  
  // 直接设置路由（同步）
  try {
    // 设置所有路由
    app.use('/api/auth', authRoutes)
    app.use('/api/materials', materialsRoutes)
    app.use('/api/products', productsRoutes)
    app.use('/api/users', usersRoutes)
    app.use('/api/menus', menusRoutes)
    
    console.log('✅ 所有API路由已设置完成')
    console.log('   - /api/auth')
    console.log('   - /api/materials (完整版本，包含upload)')
    console.log('   - /api/products')
    console.log('   - /api/users')
  } catch (error) {
    console.error('❌ Vercel环境：路由设置失败:', error)
  }
  
} else {
  // 本地开发环境
  startApp()
}

// Vercel Serverless Function 导出
export default app
