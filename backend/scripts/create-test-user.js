import { supabase } from '../lib/supabase.js'
import bcrypt from 'bcryptjs'

async function checkUsers() {
  try {
    console.log('检查数据库中的用户...')
    
    // 查询所有用户
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) {
      console.error('查询用户失败:', error)
      return
    }
    
    console.log('数据库中的用户:')
    if (data && data.length > 0) {
      data.forEach(user => {
        console.log(`- 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}, 状态: ${user.is_active ? '激活' : '禁用'}`)
      })
    } else {
      console.log('数据库中没有用户')
    }
    
    // 尝试查找默认管理员
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single()
    
    if (adminError && adminError.code !== 'PGRST116') {
      console.error('查询管理员用户失败:', adminError)
    } else if (adminData) {
      console.log('✅ 找到默认管理员用户:', {
        username: adminData.username,
        email: adminData.email,
        role: adminData.role,
        is_active: adminData.is_active
      })
    } else {
      console.log('❌ 没有找到默认管理员用户')
      
      // 创建默认管理员用户
      console.log('创建默认管理员用户...')
      const password = 'admin123'
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)
      
      const adminData = {
        username: 'admin',
        email: 'admin@joinya.com',
        password_hash: passwordHash,
        role: 'admin',
        is_active: true
      }
      
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert([adminData])
        .select()
        .single()
      
      if (createError) {
        console.error('创建管理员用户失败:', createError)
      } else {
        console.log('✅ 默认管理员用户创建成功!')
        console.log('登录凭据:')
        console.log('  用户名: admin')
        console.log('  密码: admin123')
        console.log('  邮箱: admin@joinya.com')
      }
    }
    
  } catch (error) {
    console.error('检查用户时出错:', error)
  }
}

// 运行脚本
checkUsers()
