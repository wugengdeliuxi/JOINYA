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

// 连接数据库
async function connectDB() {
  try {
    if (1) {
      await mongoose.connect('mongodb+srv://joinya-admin:3AWc8DFZf7Papo5u@joinya-cluster.qpogy8c.mongodb.net/?retryWrites=true&w=majority&appName=joinya-cluster')
      console.log('✅ MongoDB 连接成功')
    } else {
      console.log('⚠️  警告: 未找到 MONGODB_URI 环境变量')
    }
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message)
    console.log('💡 请检查 .env 文件中的 MONGODB_URI 配置')
  }
}

// 异步初始化函数
async function initializeApp() {
  // 动态导入路由 - 在环境变量加载后导入
  const { default: authRoutes } = await import('./auth.js')
  const { default: materialsRoutes } = await import('./materials.js')
  const { default: productsRoutes } = await import('./products.js')
  const { default: usersRoutes } = await import('./users.js')

  // 设置健康检查路由
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

  return { authRoutes, materialsRoutes, productsRoutes, usersRoutes }
}

// 数据库连接将在 startApp() 中初始化

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
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
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
    
    // 初始化路由
    const routes = await initializeApp()
    
    // 设置API路由
    app.use('/api/auth', routes.authRoutes)
    app.use('/api/materials', routes.materialsRoutes)
    app.use('/api/products', routes.productsRoutes)
    app.use('/api/users', routes.usersRoutes)
    
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
  // Vercel 环境下的同步初始化
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
  
  // 临时测试路由 - 检查异步路由加载状态
  app.get('/api/status', (req, res) => {
    res.json({
      message: 'API状态检查',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      note: '其他API路由正在异步加载中...'
    })
  })
  
  // 测试路由 - 检查auth路由是否正常
  app.get('/api/test-auth', (req, res) => {
    try {
      res.json({
        message: 'Auth路由测试',
        timestamp: new Date().toISOString(),
        status: 'success'
      })
    } catch (error) {
      console.error('测试路由错误:', error)
      res.status(500).json({
        message: '测试路由错误',
        error: error.message
      })
    }
  })
  
  // 测试路由 - 检查上传功能
  app.get('/api/test-upload', (req, res) => {
    try {
      res.json({
        message: '上传功能测试',
        timestamp: new Date().toISOString(),
        status: 'success',
        note: '使用 /api/materials/upload 进行文件上传测试'
      })
    } catch (error) {
      console.error('上传测试路由错误:', error)
      res.status(500).json({
        message: '上传测试路由错误',
        error: error.message
      })
    }
  })
  
  // 异步设置所有路由
  (async () => {
    try {
      // 直接导入路由模块
      const authRoutes = (await import('./auth.js')).default
      const materialsRoutes = (await import('./materials.js')).default
      const productsRoutes = (await import('./products.js')).default
      const usersRoutes = (await import('./users.js')).default
      
      // 设置API路由
      app.use('/api/auth', authRoutes)
      app.use('/api/materials', materialsRoutes)
      app.use('/api/products', productsRoutes)
      app.use('/api/users', usersRoutes)
      
      console.log('✅ Vercel环境：API路由设置完成（同步方式）')
      console.log('   - /api/auth')
      console.log('   - /api/materials')
      console.log('   - /api/products')
      console.log('   - /api/users')
      
    } catch (error) {
      console.error('❌ Vercel环境：路由设置失败:', error)
    }
  })()
  
  // 404处理 - 放在最后，确保所有路由都设置完成后再处理
  app.use('/api/*', (req, res) => {
    res.status(404).json({ 
      success: false, 
      message: 'API端点不存在' 
    })
  })
} else {
  // 本地开发环境
  startApp()
}

// Vercel Serverless Function 导出
export default app
