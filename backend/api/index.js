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
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
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

  return { authRoutes, materialsRoutes, productsRoutes, usersRoutes }
}

// 数据库连接将在 startApp() 中初始化

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'https://your-admin-domain.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3001'],
  credentials: true
}))
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
})
app.use('/api/', limiter)

// 健康检查
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

// API路由将在异步初始化中设置

// 404处理
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API端点不存在' 
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
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
      : err.message
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
  // Vercel 环境下的初始化
  connectDB().catch(console.error)
  initializeApp().then(routes => {
    app.use('/api/auth', routes.authRoutes)
    app.use('/api/materials', routes.materialsRoutes)
    app.use('/api/products', routes.productsRoutes)
    app.use('/api/users', routes.usersRoutes)
  }).catch(console.error)
} else {
  // 本地开发环境
  startApp()
}

// Vercel Serverless Function 导出
export default app
