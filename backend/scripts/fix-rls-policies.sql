-- 修复 RLS 策略以允许用户注册和登录
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 删除现有的用户策略
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- 创建新的策略
-- 允许任何人查看用户数据（用于登录验证）
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);

-- 允许插入用户数据（用于注册）
CREATE POLICY "Allow public insert to users" ON users FOR INSERT WITH CHECK (true);

-- 允许更新用户数据（用于更新最后登录时间等）
CREATE POLICY "Allow public update to users" ON users FOR UPDATE USING (true);

-- 允许删除用户数据（用于用户管理）
CREATE POLICY "Allow public delete to users" ON users FOR DELETE USING (true);

-- 对于 materials 表，保持现有的策略
-- 对于 menus 表，保持现有的策略

-- 现在您可以运行创建用户的脚本了
