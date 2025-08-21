import express from 'express'
import connectDB from '../lib/db.js'

const router = express.Router()

// 获取用户列表
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: '用户管理功能开发中...',
      data: []
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

export default router
