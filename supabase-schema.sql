-- Supabase 数据库表结构
-- 在 Supabase Dashboard 的 SQL Editor 中执行这些语句

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 素材表
CREATE TABLE materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'document')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('product', 'background', 'logo', 'hero', 'other')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  cloudinary_public_id VARCHAR(255),
  cloudinary_version VARCHAR(50),
  cloudinary_signature VARCHAR(255),
  size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 菜单表
CREATE TABLE menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('road-bikes', 'gravel-bikes', 'mountain-bikes', 'e-bikes', 'gear', 'service', 'custom')),
  content JSONB NOT NULL, -- 存储中英文内容
  cover_image TEXT,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_materials_category_type ON materials(category, type);
CREATE INDEX idx_materials_uploaded_by ON materials(uploaded_by);
CREATE INDEX idx_materials_created_at ON materials(created_at DESC);
CREATE INDEX idx_menus_slug ON menus(slug);
CREATE INDEX idx_menus_type_sort ON menus(type, sort_order);
CREATE INDEX idx_menus_created_at ON menus(created_at DESC);

-- 创建全文搜索索引
CREATE INDEX idx_materials_search ON materials USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_menus_search ON menus USING gin(to_tsvector('english', name || ' ' || content::text));

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@joinya.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
-- 用户表策略
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- 素材表策略
CREATE POLICY "Anyone can view public materials" ON materials FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can insert materials" ON materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own materials" ON materials FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Users can delete their own materials" ON materials FOR DELETE USING (auth.uid() = uploaded_by);

-- 菜单表策略
CREATE POLICY "Anyone can view active menus" ON menus FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can insert menus" ON menus FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update menus" ON menus FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete menus" ON menus FOR DELETE USING (auth.role() = 'authenticated');

