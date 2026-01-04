# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账户
3. 点击 "New Project"
4. 填写项目信息：
   - Project Name: `joinya-db`
   - Database Password: 设置一个强密码
   - Region: 选择离您最近的区域
5. 点击 "Create new project"

## 2. 获取项目配置

1. 在项目 Dashboard 中，点击左侧菜单的 "Settings"
2. 点击 "API"
3. 复制以下信息：
   - Project URL
   - anon public key

## 3. 设置环境变量

在 `backend/.env` 文件中添加：

```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# 其他配置保持不变
NODE_ENV=development
PORT=3002
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=7d
```

## 4. 创建数据库表

1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase-schema.sql` 文件中的内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行

## 5. 配置认证

1. 在 Supabase Dashboard 中，点击左侧菜单的 "Authentication"
2. 点击 "Settings"
3. 在 "Site URL" 中添加您的应用 URL：
   - 开发环境: `http://localhost:3000`
   - 生产环境: `https://your-domain.com`
4. 在 "Redirect URLs" 中添加重定向 URL

## 6. 测试连接

运行以下命令测试连接：

```bash
cd backend
npm run dev
```

访问 `http://localhost:3002/api/health` 检查连接状态。

## 7. 默认管理员账户

数据库初始化后会创建一个默认管理员账户：

- 用户名: `admin`
- 邮箱: `admin@joinya.com`
- 密码: `admin123`

## 8. 数据迁移

如果您有现有的 MongoDB 数据，需要手动迁移到 Supabase：

1. 导出 MongoDB 数据
2. 转换数据格式
3. 使用 Supabase Dashboard 或 API 导入数据

## 9. 监控和维护

- 在 Supabase Dashboard 中监控数据库使用情况
- 定期备份重要数据
- 监控 API 使用量和性能

## 10. 故障排除

### 连接问题

- 检查环境变量是否正确
- 确认 Supabase 项目状态正常
- 检查网络连接

### 权限问题

- 确认 RLS 策略配置正确
- 检查用户角色和权限
- 验证 JWT token 是否有效

### 性能问题

- 检查数据库索引
- 优化查询语句
- 监控慢查询日志

