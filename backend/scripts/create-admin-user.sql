-- 创建新的管理员用户
-- 用户名: admin
-- 密码: admin456

-- 如果用户已存在，先删除（可选）
-- DELETE FROM users WHERE username = 'admin';

-- 插入新用户
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES (
  'admin',
  'admin@joinya.com',
  '$2a$10$YOUR_PASSWORD_HASH_HERE',  -- 这里需要替换为实际的密码哈希
  'admin',
  true
)
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

