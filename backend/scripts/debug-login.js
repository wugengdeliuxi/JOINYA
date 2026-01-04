import { supabaseAdmin } from '../lib/supabase.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
dotenv.config({ path: join(__dirname, '..', '.env') })

async function debugLogin() {
  try {
    console.log('🔍 调试登录问题...\n')
    console.log('环境变量检查:')
    console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '已设置' : '❌ 未设置')
    console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '已设置' : '❌ 未设置')
    console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '❌ 未设置')
    console.log('')

    // 1. 测试使用服务角色客户端查询用户
    console.log('1. 测试查询 admin 用户...')
    const { data: userData, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('is_active', true)
      .single()

    if (queryError) {
      console.log('❌ 查询失败:', queryError.message)
      console.log('   错误代码:', queryError.code)
      console.log('   详细信息:', queryError)
      return
    }

    if (!userData) {
      console.log('❌ 用户不存在')
      return
    }

    console.log('✅ 用户查询成功')
    console.log('   用户名:', userData.username)
    console.log('   邮箱:', userData.email)
    console.log('   角色:', userData.role)
    console.log('   状态:', userData.is_active ? '激活' : '禁用')
    console.log('   密码哈希:', userData.password_hash.substring(0, 30) + '...')

    // 2. 测试密码验证
    console.log('\n2. 测试密码验证...')
    const testPasswords = ['admin123', 'password', 'admin']
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, userData.password_hash)
      console.log(`   密码 "${pwd}": ${isValid ? '✅ 正确' : '❌ 错误'}`)
      if (isValid) {
        console.log(`\n✅ 找到正确密码: "${pwd}"`)
        return
      }
    }

    console.log('\n❌ 所有测试密码都不匹配')
    console.log('\n3. 生成新的密码哈希...')
    const newPassword = 'admin123'
    const newHash = await bcrypt.hash(newPassword, 10)
    console.log('   新密码:', newPassword)
    console.log('   新哈希:', newHash)
    console.log('\n请使用这个新哈希更新数据库中的 password_hash 字段')

  } catch (error) {
    console.error('❌ 调试过程中出错:', error)
    console.error('   堆栈:', error.stack)
  }
}

debugLogin()

