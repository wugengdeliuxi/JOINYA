// 简化的测试服务器
import express from 'express'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = 3003

console.log('🔧 环境变量测试:')
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '存在' : '不存在'}`)
console.log(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`)

app.get('/', (req, res) => {
  res.json({
    message: '测试服务器运行中',
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? '已配置' : '未配置',
      NODE_ENV: process.env.NODE_ENV || '未设置'
    }
  })
})

app.listen(PORT, () => {
  console.log(`✅ 测试服务器启动在端口 ${PORT}`)
  console.log(`🔗 访问: http://localhost:${PORT}`)
}) 