import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://injsfjiuhfsszvpkmxza.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluanNmaml1aGZzc3p2cGtteHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTI4MzgsImV4cCI6MjA3NTc2ODgzOH0.c2VkFACLiN0w8cKuwqT6Gw-4YMNb5_Mkmj-AY2lwQFY'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluanNmaml1aGZzc3p2cGtteHphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE5MjgzOCwiZXhwIjoyMDc1NzY4ODM4fQ.8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K'

// 创建 Supabase 客户端（匿名用户）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 创建 Supabase 客户端（服务角色，绕过 RLS）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 数据库连接检查
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase 连接失败:', error.message)
      return false
    }
    
    console.log('✅ Supabase 连接成功')
    return true
  } catch (error) {
    console.error('❌ Supabase 连接错误:', error.message)
    return false
  }
}

// 导出默认客户端
export default supabase

