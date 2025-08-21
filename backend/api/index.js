import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

// 导入路由
import authRoutes from './auth.js'
import materialsRoutes from './materials.js'
import productsRoutes from './products.js'
import usersRoutes from './users.js'

const app = express()

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'https://your-admin-domain.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5174'],
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
    environment: process.env.NODE_ENV 
  })
})

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/materials', materialsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/users', usersRoutes)

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

// Vercel Serverless Function 导出
export default app
