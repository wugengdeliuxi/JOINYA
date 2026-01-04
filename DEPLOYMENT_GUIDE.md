# JOINYA 海外部署指南

本指南将帮助您将 JOINYA 项目部署到海外服务器。

## ⚡ 快速开始

如果您已经熟悉部署流程，可以按照以下步骤快速部署：

1. **创建 Supabase 项目**（选择海外区域）
2. **配置 Cloudinary 账户**
3. **部署后端**：`cd backend && vercel --prod`
4. **在 Vercel Dashboard 配置后端环境变量**
5. **部署前端**：`cd ../web && vercel --prod`
6. **更新 `web/vercel.json` 中的 API 地址**
7. **部署管理后台**：`cd ../admin-panel && vercel --prod`
8. **更新 `admin-panel/vercel.json` 中的 API 地址**
9. **更新 Supabase 认证配置**

详细步骤请参考下方完整指南。

## 📋 部署架构

```
┌─────────────────┐
│   Vercel CDN    │  ← 前端静态资源 (web + admin-panel)
└─────────────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌─────▼──────┐
│ Vercel Functions│  │  Supabase  │  ← 数据库 (PostgreSQL)
│   (Backend API) │  │  (海外区域) │
└─────────────────┘  └────────────┘
         │
         │
┌────────▼────────┐
│   Cloudinary    │  ← 文件存储 (CDN)
└─────────────────┘
```

## 🚀 部署步骤

### 第一步：准备 Supabase 数据库（海外区域）

1. **创建 Supabase 项目**

   - 访问 [Supabase](https://supabase.com)
   - 注册/登录账户
   - 点击 "New Project"
   - **重要：选择海外区域**（推荐选择离目标用户最近的区域）：
     - `US East (North Virginia)` - 美国东部
     - `US West (Oregon)` - 美国西部
     - `EU West (Ireland)` - 欧洲西部
     - `EU Central (Frankfurt)` - 欧洲中部
     - `Asia Pacific (Singapore)` - 亚洲（新加坡）
     - `Asia Pacific (Tokyo)` - 亚洲（东京）
   - 填写项目信息：
     - Project Name: `joinya-db`
     - Database Password: 设置一个强密码（请妥善保存）
   - 点击 "Create new project"

2. **获取 Supabase 配置信息**

   - 在项目 Dashboard 中，点击左侧菜单的 "Project Settings" 或 "Settings"（通常在导航栏底部）
   - 点击 "API" 子菜单
   - 复制以下信息：
     - **Project URL** (例如: `https://xxxxx.supabase.co`)
     - **anon public key** (anon key)
     - **service_role key** (在 "Project API keys" 部分，需要展开查看)
   - **提示**：如果找不到 Settings 菜单，请参考 `SUPABASE_DASHBOARD_GUIDE.md` 获取详细的导航说明

3. **创建数据库表**

   - 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
   - 点击 "New query" 按钮
   - 复制 `supabase-schema.sql` 文件中的内容
   - 粘贴到编辑器中
   - 点击 "Run" 按钮执行
   - **提示**：如果找不到 SQL Editor，请参考 `SUPABASE_DASHBOARD_GUIDE.md` 获取详细的导航说明

4. **配置认证设置**
   - 在 Supabase Dashboard 中，点击左侧菜单的 "Authentication"
   - 在 Authentication 页面的左侧导航栏中，找到 "CONFIGURATION" 部分
   - 点击 "URL Configuration"（**不是 Settings 标签**）
   - 在 "Site URL" 中输入您的前端网站地址（稍后部署完成后更新，例如：`https://your-app.vercel.app`）
   - 在 "Redirect URLs" 中添加重定向 URL（点击 "Add URL" 添加，例如：`https://your-app.vercel.app/**`）
   - **提示**：如果找不到 URL Configuration，请参考 `SUPABASE_DASHBOARD_GUIDE.md` 获取详细的导航说明

### 第二步：配置 Cloudinary（文件存储）

1. **创建 Cloudinary 账户**

   - 访问 [Cloudinary](https://cloudinary.com)
   - 注册/登录账户（免费套餐即可）
   - 进入 Dashboard

2. **获取 Cloudinary 配置信息**
   - 在 Dashboard 中，您可以看到：
     - **Cloud name**
     - **API Key**
     - **API Secret**
   - 请妥善保存这些信息

### 第三步：部署到 Vercel

#### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 登录 Vercel

```bash
vercel login
```

#### 3.3 部署后端 API

```bash
cd backend
vercel --prod
```

在部署过程中，Vercel 会询问一些问题：

- **Set up and deploy?** → 选择 `Y`
- **Which scope?** → 选择您的账户
- **Link to existing project?** → 选择 `N`（首次部署）
- **Project name?** → 输入 `joinya-api` 或使用默认值
- **Directory?** → 直接回车（使用当前目录）
- **Override settings?** → 选择 `N`

**部署完成后，记录下您的 API URL**（例如：`https://joinya-api.vercel.app`）

#### 3.4 配置后端环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的后端项目（`joinya-api`）
3. 进入 "Settings" → "Environment Variables"
4. 添加以下环境变量：

```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary 配置
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 环境配置
NODE_ENV=production
```

5. 添加完成后，点击 "Redeploy" 重新部署以应用环境变量

#### 3.5 部署前端网站（web）

```bash
cd ../web
vercel --prod
```

在部署过程中：

- **Link to existing project?** → 选择 `N`
- **Project name?** → 输入 `joinya-web` 或使用默认值

**部署完成后，记录下您的前端 URL**（例如：`https://joinya-web.vercel.app`）

#### 3.6 配置前端环境变量

1. 在 Vercel Dashboard 中选择前端项目（`joinya-web`）
2. 进入 "Settings" → "Environment Variables"
3. **重要：更新 `web/vercel.json` 中的 API 地址**

编辑 `web/vercel.json`，将 API 地址替换为您实际的后端 URL：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-api-url.vercel.app/api/$1"
    }
  ]
}
```

**注意**：前端代码使用 `/api` 作为 baseURL，Vercel 会自动通过 `vercel.json` 中的 rewrite 规则代理到后端 API。确保这里的 URL 是您实际的后端部署地址。

#### 3.7 部署管理后台（admin-panel）

```bash
cd ../admin-panel
vercel --prod
```

在部署过程中：

- **Link to existing project?** → 选择 `N`
- **Project name?** → 输入 `joinya-admin` 或使用默认值

**同样需要更新 `admin-panel/vercel.json` 中的 API 地址**

编辑 `admin-panel/vercel.json`，将 API 地址替换为您实际的后端 URL：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-api-url.vercel.app/api/$1"
    }
  ]
}
```

**可选：如果需要在开发环境使用不同的 API 地址，可以更新 `admin-panel/vite.config.ts` 中的代理配置。**

### 第四步：更新 Supabase 认证配置

1. 返回 Supabase Dashboard
2. 进入 "Authentication" → "Settings"
3. 更新以下配置：
   - **Site URL**: 您的前端网站 URL（例如：`https://joinya-web.vercel.app`）
   - **Redirect URLs**: 添加以下 URL：
     - `https://joinya-web.vercel.app/**`
     - `https://joinya-admin.vercel.app/**`
     - `http://localhost:3000/**`（开发环境）

### 第五步：测试部署

1. **测试后端 API**

   ```bash
   curl https://your-api-url.vercel.app/api/health
   ```

2. **测试前端网站**

   - 访问您的前端 URL
   - 检查页面是否正常加载
   - 测试 API 调用是否正常

3. **测试管理后台**
   - 访问您的管理后台 URL
   - 尝试登录（使用默认管理员账户或创建新账户）

### 第六步：配置自定义域名（可选）

1. **在 Vercel 中添加域名**

   - 进入项目 "Settings" → "Domains"
   - 添加您的自定义域名
   - 按照提示配置 DNS 记录

2. **更新 Supabase 配置**

   - 在 Supabase 的 "Authentication" → "URL Configuration" 中更新 Site URL 和 Redirect URLs

3. **更新前端 API 配置**
   - 如果使用自定义域名，更新 `web/vercel.json` 和 `admin-panel/vercel.json` 中的 API 地址
   - 确保 API 地址指向正确的后端服务

## 🔧 使用部署脚本（快速部署）

项目已包含自动化部署脚本 `deploy.sh`，您可以：

```bash
# 在项目根目录执行
chmod +x deploy.sh
./deploy.sh
```

**注意**：使用脚本部署后，仍需在 Vercel Dashboard 中手动配置环境变量。

## 📝 环境变量清单

### 后端环境变量（Vercel）

| 变量名                      | 说明                  | 示例                        |
| --------------------------- | --------------------- | --------------------------- |
| `SUPABASE_URL`              | Supabase 项目 URL     | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY`         | Supabase 匿名密钥     | `eyJhbGc...`                |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | `eyJhbGc...`                |
| `JWT_SECRET`                | JWT 签名密钥          | 随机字符串（至少 32 字符）  |
| `JWT_EXPIRES_IN`            | JWT 过期时间          | `7d`                        |
| `CLOUDINARY_CLOUD_NAME`     | Cloudinary 云名称     | `your-cloud-name`           |
| `CLOUDINARY_API_KEY`        | Cloudinary API 密钥   | `123456789012345`           |
| `CLOUDINARY_API_SECRET`     | Cloudinary API 密钥   | `your-secret-key`           |
| `NODE_ENV`                  | 环境模式              | `production`                |

### 前端环境变量（通常不需要，API 地址在 vercel.json 中配置）

## 🔒 安全建议

1. **JWT_SECRET**

   - 使用强随机字符串（至少 32 字符）
   - 可以使用以下命令生成：
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

2. **数据库密码**

   - 使用强密码
   - 妥善保管，不要提交到代码仓库

3. **API 密钥**

   - 所有密钥都应在 Vercel 环境变量中配置
   - 不要将密钥提交到 Git 仓库

4. **CORS 配置**
   - 确保后端 CORS 配置只允许您的域名访问

## 🐛 故障排除

### 问题 1: API 返回 500 错误

**检查**：

- Vercel 环境变量是否配置正确
- Supabase 连接是否正常
- 查看 Vercel 函数日志

### 问题 2: 文件上传失败

**检查**：

- Cloudinary 环境变量是否正确
- Cloudinary 账户是否正常
- 文件大小是否超过限制（当前限制为 10MB）

### 问题 3: 认证失败

**检查**：

- Supabase 的 Site URL 和 Redirect URLs 是否正确
- JWT_SECRET 是否配置
- 查看浏览器控制台和网络请求

### 问题 4: 数据库连接失败

**检查**：

- Supabase URL 和密钥是否正确
- Supabase 项目是否正常运行
- 网络连接是否正常

## 📊 监控和维护

1. **Vercel Analytics**

   - 在 Vercel Dashboard 中启用 Analytics
   - 监控网站性能和错误

2. **Supabase Dashboard**

   - 监控数据库使用情况
   - 查看 API 使用量
   - 定期备份数据

3. **Cloudinary Dashboard**
   - 监控存储使用量
   - 查看带宽使用情况

## 🌍 区域选择建议

- **目标用户在美国**：选择 `US East` 或 `US West`
- **目标用户在欧洲**：选择 `EU West` 或 `EU Central`
- **目标用户在亚洲**：选择 `Asia Pacific (Singapore)` 或 `Asia Pacific (Tokyo)`
- **全球用户**：选择 `US East`（Vercel 默认区域）

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Cloudinary 文档](https://cloudinary.com/documentation)
- **Supabase Dashboard 导航指南**：如果找不到 Dashboard 中的某个页面，请查看 `SUPABASE_DASHBOARD_GUIDE.md`

## ✅ 部署检查清单

- [√] Supabase 项目已创建（海外区域）
- [√] Supabase 数据库表已创建
- [√] Cloudinary 账户已配置
- [ ] 后端已部署到 Vercel
- [ ] 后端环境变量已配置
- [ ] 前端网站已部署到 Vercel
- [ ] 管理后台已部署到 Vercel
- [ ] Supabase 认证配置已更新
- [ ] 所有服务已测试通过
- [ ] 自定义域名已配置（如需要）

---

**部署完成后，您的应用将在全球范围内可用！** 🎉
