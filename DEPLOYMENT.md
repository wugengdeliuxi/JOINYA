# JOINYA 全栈项目部署指南

## 项目架构

```
JOINYA/
├── web/          # 官网前端 (Vue3 + Element Plus)
├── admin-panel/         # 管理后台 (Vue3 + Element Plus)
└── backend/             # 后端API (Node.js + Express + Vercel)
```

## 部署方案

### 1. 前端部署 (Vercel)

#### 官网前端部署

1. 将 `JOINYA-WEB` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### 管理后台部署

1. 将 `admin-panel` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. 后端部署 (Vercel Serverless Functions)

1. 将 `backend` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   ```

## 详细部署步骤

### 第一步：准备数据库

1. **创建 MongoDB Atlas 集群**

   - 注册 MongoDB Atlas 账户
   - 创建免费集群
   - 配置网络访问（允许所有 IP：0.0.0.0/0）
   - 创建数据库用户
   - 获取连接字符串

2. **初始化数据库**

   ```bash
   # 连接到 MongoDB
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/joinya"

   # 创建管理员用户
   use joinya
   db.users.insertOne({
     username: "admin",
     email: "admin@joinya.com",
     password: "$2a$12$...", // 使用 bcrypt 加密的密码
     role: "admin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

### 第二步：部署后端

1. **准备后端代码**

   ```bash
   cd backend
   npm install
   ```

2. **配置环境变量**

   ```bash
   cp env.example .env
   # 编辑 .env 文件，填入真实的数据库连接字符串和JWT密钥
   ```

3. **本地测试**

   ```bash
   npm run dev
   # 访问 http://localhost:3000/api/health 检查服务是否正常
   ```

4. **部署到 Vercel**

   ```bash
   # 安装 Vercel CLI
   npm i -g vercel

   # 登录 Vercel
   vercel login

   # 部署
   vercel --prod
   ```

5. **配置 Vercel 环境变量**
   - 在 Vercel 控制台中找到项目
   - 进入 Settings > Environment Variables
   - 添加以下变量：
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`

### 第三步：部署前端

#### 官网前端

1. **更新 API 配置**

   ```javascript
   // JOINYA-WEB/src/api/index.js
   const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-backend-domain.vercel.app/api' : 'http://localhost:3000/api'
   ```

2. **部署到 Vercel**
   ```bash
   cd JOINYA-WEB
   vercel --prod
   ```

#### 管理后台

1. **更新 API 配置**

   ```javascript
   // admin-panel/src/api/index.js
   const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-backend-domain.vercel.app/api' : 'http://localhost:3000/api'
   ```

2. **部署到 Vercel**
   ```bash
   cd admin-panel
   vercel --prod
   ```

### 第四步：配置域名和 SSL

1. **自定义域名**

   - 在 Vercel 控制台中为每个项目配置自定义域名
   - 例如：
     - 官网：`www.joinya.com`
     - 管理后台：`admin.joinya.com`
     - API：`api.joinya.com`

2. **SSL 证书**
   - Vercel 自动提供 SSL 证书
   - 确保所有域名都使用 HTTPS

### 第五步：文件存储配置

对于生产环境，建议使用云存储服务：

#### 方案一：AWS S3

```javascript
// backend/lib/storage.js
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

export const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }

  const result = await s3.upload(params).promise()
  return result.Location
}
```

#### 方案二：阿里云 OSS

```javascript
// backend/lib/storage.js
import OSS from 'ali-oss'

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
})

export const uploadToOSS = async (file, key) => {
  const result = await client.put(key, file.buffer)
  return result.url
}
```

### 第六步：监控和日志

1. **Vercel Analytics**

   - 在 Vercel 控制台启用 Analytics
   - 监控网站性能和用户行为

2. **错误监控**

   - 集成 Sentry 进行错误监控
   - 配置告警通知

3. **日志管理**
   - 使用 Vercel 的日志功能
   - 考虑集成第三方日志服务

## 环境变量配置

### 后端环境变量

```bash
# 数据库
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# 环境
NODE_ENV=production

# 文件存储 (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# 跨域
ALLOWED_ORIGINS=https://www.joinya.com,https://admin.joinya.com
```

### 前端环境变量

```bash
# API地址
VITE_API_BASE_URL=https://api.joinya.com/api

# 环境
NODE_ENV=production
```

## 性能优化

### 前端优化

1. **代码分割**

   ```javascript
   // 路由懒加载
   const Home = () => import('@/views/Home.vue')
   ```

2. **图片优化**

   - 使用 WebP 格式
   - 实现懒加载
   - 使用 CDN

3. **缓存策略**
   - 静态资源长期缓存
   - API 响应适当缓存

### 后端优化

1. **数据库优化**

   - 创建合适的索引
   - 使用连接池
   - 实现查询缓存

2. **API 优化**
   - 实现分页
   - 压缩响应
   - 速率限制

## 安全配置

1. **CORS 配置**

   ```javascript
   app.use(
     cors({
       origin: ['https://www.joinya.com', 'https://admin.joinya.com'],
       credentials: true
     })
   )
   ```

2. **安全头**

   ```javascript
   app.use(
     helmet({
       contentSecurityPolicy: {
         directives: {
           defaultSrc: ["'self'"],
           styleSrc: ["'self'", "'unsafe-inline'"],
           scriptSrc: ["'self'"],
           imgSrc: ["'self'", 'data:', 'https:']
         }
       }
     })
   )
   ```

3. **输入验证**
   - 所有用户输入都进行验证
   - 防止 SQL 注入和 XSS 攻击

## 备份策略

1. **数据库备份**

   - MongoDB Atlas 自动备份
   - 定期导出数据

2. **代码备份**
   - 使用 Git 版本控制
   - 定期推送到远程仓库

## 故障排除

### 常见问题

1. **CORS 错误**

   - 检查 CORS 配置
   - 确保域名正确

2. **数据库连接失败**

   - 检查网络连接
   - 验证连接字符串
   - 检查防火墙设置

3. **文件上传失败**
   - 检查文件大小限制
   - 验证文件类型
   - 检查存储服务配置

### 调试技巧

1. **查看日志**

   ```bash
   vercel logs
   ```

2. **本地调试**

   ```bash
   vercel dev
   ```

3. **API 测试**
   ```bash
   curl -X GET https://api.joinya.com/api/health
   ```

## 维护计划

1. **定期更新**

   - 依赖包更新
   - 安全补丁
   - 功能升级

2. **性能监控**

   - 定期检查性能指标
   - 优化慢查询
   - 监控资源使用

3. **安全审计**
   - 定期安全扫描
   - 权限审查
   - 漏洞修复

## 成本估算

### Vercel 费用

- Hobby Plan: $0/月 (适合小项目)
- Pro Plan: $20/月 (适合中型项目)
- Enterprise Plan: 联系销售

### MongoDB Atlas 费用

- Free Tier: $0/月 (512MB)
- Shared Cluster: $9/月 (2GB)
- Dedicated Cluster: $57/月 (2GB)

### 云存储费用

- AWS S3: 按使用量计费
- 阿里云 OSS: 按使用量计费

## 总结

这个部署方案提供了：

- 现代化的 Serverless 架构
- 自动扩展能力
- 全球 CDN 加速
- 自动 SSL 证书
- 完整的监控和日志
- 高可用性和安全性

建议先在开发环境充分测试，然后逐步部署到生产环境。
