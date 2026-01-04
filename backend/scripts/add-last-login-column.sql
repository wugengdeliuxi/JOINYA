-- 添加 last_login 字段到 users 表
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 检查字段是否存在，如果不存在则添加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_login'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    
    COMMENT ON COLUMN users.last_login IS '用户最后登录时间';
  END IF;
END $$;

