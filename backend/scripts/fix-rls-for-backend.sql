-- 修复后端 API 的 RLS 策略问题
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 1. 修复 materials 表的 INSERT 策略
-- 删除现有的限制性策略
DROP POLICY IF EXISTS "Authenticated users can insert materials" ON materials;

-- 创建允许服务角色插入的策略（后端使用服务角色客户端）
CREATE POLICY "Allow service role to insert materials" ON materials 
  FOR INSERT 
  WITH CHECK (true);

-- 2. 修复 menus 表的 INSERT 策略
DROP POLICY IF EXISTS "Authenticated users can insert menus" ON menus;

CREATE POLICY "Allow service role to insert menus" ON menus 
  FOR INSERT 
  WITH CHECK (true);

-- 3. 修复 menus 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can update menus" ON menus;

CREATE POLICY "Allow service role to update menus" ON menus 
  FOR UPDATE 
  USING (true);

-- 4. 修复 menus 表的 DELETE 策略
DROP POLICY IF EXISTS "Users can delete menus" ON menus;

CREATE POLICY "Allow service role to delete menus" ON menus 
  FOR DELETE 
  USING (true);

-- 5. 修复 materials 表的 UPDATE 策略
DROP POLICY IF EXISTS "Users can update their own materials" ON materials;

CREATE POLICY "Allow service role to update materials" ON materials 
  FOR UPDATE 
  USING (true);

-- 6. 修复 materials 表的 DELETE 策略
DROP POLICY IF EXISTS "Users can delete their own materials" ON materials;

CREATE POLICY "Allow service role to delete materials" ON materials 
  FOR DELETE 
  USING (true);

