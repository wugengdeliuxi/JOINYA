import { supabase, supabaseAdmin } from '../lib/supabase.js'
import { User } from '../models/User.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
dotenv.config({ path: join(__dirname, '..', '.env') })

async function testLogin() {
  try {
    console.log('🔍 测试登录流程...\n')

    // 1. 测试使用匿名客户端查询用户
    console.log('1. 测试使用匿名客户端查询用户...')
    const { data: userData1, error: error1 } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('is_active', true)
      .single()

    if (error1) {
      console.log('❌ 匿名客户端查询失败:', error1.message)
      console.log('   错误代码:', error1.code)
      console.log('   提示:', error1.hint || '无')
    } else {
      console.log('✅ 匿名客户端查询成功')
      console.log('   用户:', userData1.username, userData1.email)
    }

    // 2. 测试使用服务角色客户端查询用户
    console.log('\n2. 测试使用服务角色客户端查询用户...')
    const { data: userData2, error: error2 } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('is_active', true)
      .single()

    if (error2) {
      console.log('❌ 服务角色客户端查询失败:', error2.message)
    } else {
      console.log('✅ 服务角色客户端查询成功')
      console.log('   用户:', userData2.username, userData2.email)
      console.log('   密码哈希:', userData2.password_hash.substring(0, 30) + '...')
    }

    // 3. 测试使用 User 模型查找
    console.log('\n3. 测试使用 User 模型查找...')
    try {
      const user = await User.findByUsernameOrEmail('admin')
      if (user) {
        console.log('✅ User 模型查找成功')
        console.log('   用户:', user.username, user.email)
      } else {
        console.log('❌ User 模型查找失败: 用户不存在')
      }
    } catch (error) {
      console.log('❌ User 模型查找失败:', error.message)
    }

    // 4. 测试密码验证
    console.log('\n4. 测试密码验证...')
    if (userData2) {
      const testPassword = 'admin123'
      const isValid = await bcrypt.compare(testPassword, userData2.password_hash)
      console.log(`   密码 "admin123" 验证结果: ${isValid ? '✅ 正确' : '❌ 错误'}`)
      
      if (!isValid) {
        console.log('   当前密码哈希:', userData2.password_hash)
        console.log('   尝试生成新的哈希...')
        const newHash = await bcrypt.hash(testPassword, 10)
        console.log('   新密码哈希:', newHash)
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
  }
}

testLogin()

