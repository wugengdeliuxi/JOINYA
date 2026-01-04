-- 修复登录时的 RLS 策略问题
-- 允许匿名用户查询 users 表（用于登录验证）

-- 删除现有的限制性策略
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- 创建允许登录查询的策略
-- 允许查询活跃用户的基本信息（用于登录验证）
CREATE POLICY "Allow login queries" ON users 
  FOR SELECT 
  USING (is_active = true);

-- 保留更新策略（用户只能更新自己的数据）
-- 如果不存在则创建
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data" ON users 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END $$;

