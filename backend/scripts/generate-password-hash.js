import bcrypt from 'bcryptjs'

// 生成密码哈希
async function generatePasswordHash() {
  const password = process.argv[2] || 'admin123'
  const saltRounds = 10
  
  console.log(`正在为密码 "${password}" 生成哈希...\n`)
  
  const passwordHash = await bcrypt.hash(password, saltRounds)
  
  console.log('✅ 密码哈希生成成功！\n')
  console.log('密码:', password)
  console.log('哈希值:', passwordHash)
  console.log('\n📋 使用说明：')
  console.log('1. 在 Supabase Dashboard 中打开 Table Editor')
  console.log('2. 选择 users 表')
  console.log('3. 找到 username = "admin" 的记录')
  console.log('4. 点击编辑，将 password_hash 字段更新为上面的哈希值')
  console.log('5. 保存更改')
}

generatePasswordHash()

