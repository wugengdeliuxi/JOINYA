import express from 'express'
// connectDB 已在主应用中处理

const router = express.Router()

// 获取产品列表
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: '产品管理功能开发中...',
      data: []
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

export default router
