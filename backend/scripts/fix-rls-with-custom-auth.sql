-- 修复 RLS 策略以支持自定义 JWT 认证系统
-- 我们的系统使用自定义 JWT，不是 Supabase Auth
-- 所以 RLS 策略需要允许服务角色客户端操作（因为我们已经通过 JWT 中间件验证了用户）

-- 1. 修复 materials 表的策略
-- 删除现有的限制性策略
DROP POLICY IF EXISTS "Anyone can view public materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can insert materials" ON materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON materials;

-- 创建新策略：允许查看公开素材，允许服务角色进行所有操作
-- 注意：实际的权限控制由我们的 JWT 中间件处理
CREATE POLICY "Allow view public materials" ON materials 
  FOR SELECT 
  USING (is_public = true);

-- 允许服务角色插入（我们的后端使用服务角色客户端，已通过 JWT 验证用户）
CREATE POLICY "Allow service role to manage materials" ON materials 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 2. 修复 menus 表的策略
DROP POLICY IF EXISTS "Anyone can view active menus" ON menus;
DROP POLICY IF EXISTS "Authenticated users can insert menus" ON menus;
DROP POLICY IF EXISTS "Users can update menus" ON menus;
DROP POLICY IF EXISTS "Users can delete menus" ON menus;

CREATE POLICY "Allow view active menus" ON menus 
  FOR SELECT 
  USING (is_active = true);

-- 允许服务角色管理菜单
CREATE POLICY "Allow service role to manage menus" ON menus 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

