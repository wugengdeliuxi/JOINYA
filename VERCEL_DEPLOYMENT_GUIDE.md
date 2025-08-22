# JOINYA Vercel 部署指南 (Monorepo)

## 项目结构

```
JOINYA/
├── web/              # 官网前端 (Vue3 + Vite)
├── admin-panel/      # 管理后台 (Vue3 + Vite)
└── backend/          # 后端API (Node.js + Vercel Functions)
```

## 部署步骤

### 方法一：通过 Vercel 网站部署 (推荐)

#### 1. 部署后端 API

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. **重要配置**：

   - **Root Directory**: 设置为 `backend`
   - **Framework Preset**: 选择 "Other"
   - **Build and Output Settings**:
     - Build Command: `echo "No build step required"`
     - Output Directory: 留空
     - Install Command: `npm install`

5. **环境变量配置**：

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   ```

6. 点击 "Deploy" 部署

#### 2. 部署官网前端

1. 在 Vercel Dashboard 点击 "New Project"
2. 再次导入你的 GitHub 仓库
3. **重要配置**：

   - **Root Directory**: 设置为 `web`
   - **Framework Preset**: 选择 "Vite"
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

4. **环境变量配置**：

   ```
   VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
   NODE_ENV=production
   ```

5. 点击 "Deploy" 部署

#### 3. 部署管理后台

1. 在 Vercel Dashboard 点击 "New Project"
2. 再次导入你的 GitHub 仓库
3. **重要配置**：

   - **Root Directory**: 设置为 `admin-panel`
   - **Framework Preset**: 选择 "Vite"
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

4. **环境变量配置**：

   ```
   VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
   NODE_ENV=production
   ```

5. 点击 "Deploy" 部署

### 方法二：通过 Vercel CLI 部署

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
vercel login
```

#### 2. 部署后端

```bash
cd backend
vercel --prod
# 按提示配置项目名称和设置
```

#### 3. 部署前端

```bash
cd ../web
vercel --prod
# 按提示配置项目名称和设置
```

#### 4. 部署管理后台

```bash
cd ../admin-panel
vercel --prod
# 按提示配置项目名称和设置
```

## 重要注意事项

### 1. Root Directory 设置

- 每个项目必须设置正确的 Root Directory
- 这告诉 Vercel 在哪个目录下构建项目

### 2. 环境变量

- 后端需要 MongoDB 连接字符串和 JWT 密钥
- 前端需要后端 API 地址
- 在每个项目的 Settings > Environment Variables 中配置

### 3. 域名配置

部署成功后，你会得到 3 个域名：

- Backend API: `https://your-backend.vercel.app`
- 官网: `https://your-web.vercel.app`
- 管理后台: `https://your-admin.vercel.app`

### 4. CORS 配置

确保后端的 CORS 配置包含你的前端域名：

```javascript
const allowedOrigins = [
  'https://your-web.vercel.app',
  'https://your-admin.vercel.app',
  'http://localhost:5173', // 开发环境
  'http://localhost:5174' // 开发环境
]
```

## 故障排除

### 1. 构建失败

- 检查 Root Directory 是否设置正确
- 检查 package.json 中的 build 脚本
- 查看构建日志中的具体错误信息

### 2. API 连接失败

- 检查前端环境变量中的 API 地址
- 检查后端的 CORS 配置
- 查看浏览器开发者工具的网络请求

### 3. 404 错误

- 对于 Vue SPA，确保路由配置正确
- vercel.json 中的路由重写规则已配置

### 4. 环境变量未生效

- 确保环境变量名称正确（VITE\_ 前缀）
- 重新部署项目使环境变量生效

## 自动部署配置

每个项目都会自动关联到同一个 Git 仓库，当你推送代码时：

- 推送到 `main` 分支会触发生产环境部署
- 推送到其他分支会创建预览部署

## 监控和日志

在 Vercel Dashboard 中可以：

- 查看部署历史
- 查看实时日志
- 监控性能指标
- 设置告警通知
