import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// 登录
router.post('/login', [
  body('username').trim().isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      })
    }

    const { username, password } = req.body

    console.log('Login attempt:', { username, passwordLength: password?.length })

    // 查找用户
    let user
    try {
      user = await User.findByUsernameOrEmail(username)
      console.log('User lookup result:', user ? `Found user: ${user.username}` : 'User not found')
    } catch (error) {
      console.error('User lookup error:', error.message)
      console.error('Error details:', error)
      return res.status(500).json({
        success: false,
        message: '服务器错误：查找用户失败',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    if (!user) {
      console.log('Login failed: User not found')
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    let isPasswordValid
    try {
      isPasswordValid = await user.comparePassword(password)
      console.log('Password validation result:', isPasswordValid)
    } catch (error) {
      console.error('Password validation error:', error.message)
      return res.status(500).json({
        success: false,
        message: '服务器错误：密码验证失败',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }

    if (!isPasswordValid) {
      console.log('Login failed: Invalid password')
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      })
    }

    // 更新最后登录时间
    await user.updateLastLogin()

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 刷新令牌
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      data: { token }
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 登出
router.post('/logout', auth, async (req, res) => {
  try {
    // 在Serverless环境中，我们只需要返回成功响应
    // 客户端需要删除本地存储的令牌
    res.json({
      success: true,
      message: '登出成功'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

export default router
