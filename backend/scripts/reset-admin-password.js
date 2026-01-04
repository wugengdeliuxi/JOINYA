import { supabaseAdmin } from '../lib/supabase.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
dotenv.config({ path: join(__dirname, '..', '.env') })

async function resetAdminPassword() {
  try {
    console.log('🔐 重置管理员密码...\n')

    // 新密码（可以修改这里）
    const newPassword = process.env.ADMIN_PASSWORD || 'admin123'
    console.log(`新密码: ${newPassword}\n`)

    // 生成密码哈希
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)
    console.log('✅ 密码哈希生成成功\n')

    // 查找管理员用户
    console.log('查找管理员用户...')
    const { data: adminUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ 查找管理员用户失败:', findError)
      return
    }

    if (!adminUser) {
      console.log('❌ 未找到管理员用户，正在创建...')
      
      // 创建管理员用户
      const { data: newAdmin, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          username: 'admin',
          email: 'admin@joinya.com',
          password_hash: passwordHash,
          role: 'admin',
          is_active: true
        }])
        .select()
        .single()

      if (createError) {
        console.error('❌ 创建管理员用户失败:', createError)
        return
      }

      console.log('✅ 管理员用户创建成功!')
      console.log('\n📋 登录凭据:')
      console.log('  用户名: admin')
      console.log('  邮箱: admin@joinya.com')
      console.log(`  密码: ${newPassword}`)
      return
    }

    // 更新密码
    console.log('✅ 找到管理员用户，正在更新密码...')
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminUser.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 更新密码失败:', updateError)
      return
    }

    console.log('✅ 密码重置成功!')
    console.log('\n📋 登录凭据:')
    console.log('  用户名: admin')
    console.log('  邮箱: admin@joinya.com')
    console.log(`  密码: ${newPassword}`)
    console.log('\n⚠️  请妥善保管密码，不要泄露给他人！')

  } catch (error) {
    console.error('❌ 重置密码时出错:', error)
  }
}

// 运行脚本
resetAdminPassword()

