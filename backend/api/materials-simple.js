import express from 'express'

const router = express.Router()

// 简单的测试路由
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Materials API 工作正常',
    timestamp: new Date().toISOString(),
    query: req.query
  })
})

// 测试路由
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Materials 测试路由',
    timestamp: new Date().toISOString()
  })
})

export default router
