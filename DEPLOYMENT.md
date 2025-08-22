# JOINYA 全栈项目国际部署指南

## 项目架构

```
JOINYA/
├── web/          # 官网前端 (Vue3 + Element Plus)
├── admin-panel/         # 管理后台 (Vue3 + Element Plus)
└── backend/             # 后端API (Node.js + Express + Vercel)
```

## 国际部署方案

### 1. 前端部署 (Vercel - 全球 CDN)

#### 官网前端部署

1. 将 `web` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. 选择全球部署区域（Vercel 自动选择最优节点）

#### 管理后台部署

1. 将 `admin-panel` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. 选择全球部署区域

### 2. 后端部署 (Vercel Serverless Functions - 全球边缘计算)

1. 将 `backend` 目录推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=production
   ```
4. 启用全球边缘计算功能

## 详细部署步骤

### 第一步：准备全球数据库

1. **创建 MongoDB Atlas 全球集群**

   - 注册 MongoDB Atlas 账户
   - 选择 **Global Cluster** 或 **Multi-Region Cluster**
   - 选择多个地区部署（建议：北美、欧洲、亚太）
   - 配置网络访问（允许所有 IP：0.0.0.0/0）
   - 创建数据库用户
   - 获取全球连接字符串

2. **初始化数据库**

   ```bash
   # 连接到 MongoDB Atlas 全球集群
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/joinya?retryWrites=true&w=majority"

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

3. **配置全球数据同步**
   - 启用 MongoDB Atlas 的全球数据同步功能
   - 配置读写偏好（Read Preference）为就近读取
   - 设置故障转移策略

### 第二步：部署后端到全球边缘

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

4. **部署到 Vercel 全球边缘**

   ```bash
   # 安装 Vercel CLI
   npm i -g vercel

   # 登录 Vercel
   vercel login

   # 部署到全球边缘
   vercel --prod
   ```

5. **配置 Vercel 全球环境变量**

   - 在 Vercel 控制台中找到项目
   - 进入 Settings > Environment Variables
   - 添加以下变量：
     - `MONGODB_URI` (全球数据库连接字符串)
     - `JWT_SECRET`
     - `NODE_ENV=production`
   - 确保环境变量在所有地区都可用

6. **配置全球边缘计算**
   - 启用 Vercel Edge Functions
   - 配置全球部署区域
   - 设置就近路由策略

### 第三步：部署前端到全球 CDN

#### 官网前端

1. **更新 API 配置**

   ```javascript
   // web/src/api/index.js
   const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-backend-domain.vercel.app/api' : 'http://localhost:3000/api'
   ```

2. **部署到 Vercel 全球 CDN**
   ```bash
   cd web
   vercel --prod
   ```

#### 管理后台

1. **更新 API 配置**

   ```javascript
   // admin-panel/src/api/index.js
   const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-backend-domain.vercel.app/api' : 'http://localhost:3000/api'
   ```

2. **部署到 Vercel 全球 CDN**

   ```bash
   cd admin-panel
   vercel --prod
   ```

3. **配置全球 CDN 优化**
   - 启用 Vercel 的全球 CDN 加速
   - 配置静态资源缓存策略
   - 启用图片和视频优化

### 第四步：配置全球域名和 SSL

1. **全球自定义域名**

   - 在 Vercel 控制台中为每个项目配置自定义域名
   - 建议使用国际域名：
     - 官网：`www.joinya.com` 或 `joinya.com`
     - 管理后台：`admin.joinya.com`
     - API：`api.joinya.com`
   - 配置 DNS 解析到 Vercel 的全球 CDN 节点

2. **全球 SSL 证书**

   - Vercel 自动提供全球 SSL 证书
   - 确保所有域名都使用 HTTPS
   - 配置 HSTS 安全头
   - 启用 HTTP/2 和 HTTP/3 支持

3. **全球 DNS 优化**
   - 使用 Cloudflare 或其他全球 DNS 服务
   - 配置就近解析
   - 启用 DNS 缓存优化

### 第五步：全球文件存储配置

对于国际生产环境，建议使用全球云存储服务：

#### 方案一：AWS S3 + CloudFront (推荐)

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
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000' // 1年缓存
  }

  const result = await s3.upload(params).promise()
  // 返回CloudFront CDN URL
  return result.Location.replace(process.env.AWS_S3_BUCKET, process.env.CLOUDFRONT_DOMAIN)
}
```

#### 方案二：Cloudflare R2 (全球 CDN)

```javascript
// backend/lib/storage.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export const uploadToR2 = async (file, key) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  })

  await s3Client.send(command)
  return `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`
}
```

#### 方案三：Vercel Blob Storage (内置全球 CDN)

```javascript
// backend/lib/storage.js
import { put } from '@vercel/blob'

export const uploadToVercelBlob = async (file, filename) => {
  const { url } = await put(filename, file.buffer, {
    access: 'public',
    contentType: file.mimetype
  })
  return url
}
```

### 第六步：全球监控和日志

1. **Vercel Analytics (全球性能监控)**

   - 在 Vercel 控制台启用 Analytics
   - 监控全球各地区网站性能
   - 分析用户地理分布和访问模式
   - 监控 Core Web Vitals 指标

2. **全球错误监控**

   - 集成 Sentry 进行全球错误监控
   - 配置多地区告警通知
   - 监控 API 响应时间和错误率
   - 设置性能预算告警

3. **全球日志管理**

   - 使用 Vercel 的全球日志功能
   - 集成 Datadog 或 New Relic 进行全球监控
   - 配置日志聚合和分析
   - 监控数据库连接和查询性能

4. **全球可用性监控**
   - 使用 UptimeRobot 或 Pingdom 监控全球可用性
   - 配置多地区健康检查
   - 监控 CDN 性能和缓存命中率

## 全球环境变量配置

### 后端环境变量

```bash
# 全球数据库
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya?retryWrites=true&w=majority&readPreference=nearest

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# 环境
NODE_ENV=production

# 全球文件存储 (AWS S3 + CloudFront)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# 全球文件存储 (Cloudflare R2)
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-r2-bucket
R2_PUBLIC_DOMAIN=your-r2-public-domain.r2.dev
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id

# 全球跨域
ALLOWED_ORIGINS=https://www.joinya.com,https://admin.joinya.com,https://joinya.com

# 全球CDN配置
CDN_ENABLED=true
CACHE_CONTROL_MAX_AGE=31536000
```

### 前端环境变量

```bash
# 全球API地址
VITE_API_BASE_URL=https://api.joinya.com/api

# 全球CDN配置
VITE_CDN_ENABLED=true
VITE_ASSETS_CDN=https://cdn.joinya.com

# 环境
NODE_ENV=production
```

## 全球性能优化

### 前端优化

1. **全球代码分割**

   ```javascript
   // 路由懒加载
   const Home = () => import('@/views/Home.vue')

   // 按地区动态导入
   const loadLocaleData = (locale) => import(`@/locales/${locale}.json`)
   ```

2. **全球图片优化**

   - 使用 WebP/AVIF 格式
   - 实现响应式图片
   - 使用全球 CDN
   - 启用图片压缩和优化

3. **全球缓存策略**

   - 静态资源长期缓存（1 年）
   - API 响应就近缓存
   - 启用 Service Worker 缓存
   - 配置 Cache-Control 头

4. **全球 CDN 优化**
   - 启用 Vercel 的全球 CDN
   - 配置就近访问
   - 启用 HTTP/2 和 HTTP/3
   - 启用 Brotli 压缩

### 后端优化

1. **全球数据库优化**

   - 使用 MongoDB Atlas 全球集群
   - 配置就近读取
   - 创建合适的索引
   - 使用连接池
   - 实现查询缓存

2. **全球 API 优化**

   - 实现分页和流式响应
   - 启用 gzip/Brotli 压缩
   - 配置全球速率限制
   - 启用 API 缓存
   - 使用 Edge Functions

3. **全球边缘计算**
   - 启用 Vercel Edge Functions
   - 配置就近计算
   - 优化冷启动时间
   - 使用全球缓存

## 全球安全配置

1. **全球 CORS 配置**

   ```javascript
   app.use(
     cors({
       origin: ['https://www.joinya.com', 'https://joinya.com', 'https://admin.joinya.com', 'https://api.joinya.com'],
       credentials: true,
       methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
       allowedHeaders: ['Content-Type', 'Authorization']
     })
   )
   ```

2. **全球安全头**

   ```javascript
   app.use(
     helmet({
       contentSecurityPolicy: {
         directives: {
           defaultSrc: ["'self'"],
           styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
           scriptSrc: ["'self'", 'https://vercel.live'],
           imgSrc: ["'self'", 'data:', 'https:', 'https://*.cloudfront.net'],
           fontSrc: ["'self'", 'https://fonts.gstatic.com'],
           connectSrc: ["'self'", 'https://api.joinya.com']
         }
       },
       hsts: {
         maxAge: 31536000,
         includeSubDomains: true,
         preload: true
       }
     })
   )
   ```

3. **全球输入验证**

   - 所有用户输入都进行验证
   - 防止 SQL 注入和 XSS 攻击
   - 启用 CSRF 保护
   - 配置全球速率限制

4. **全球 SSL/TLS 配置**
   - 强制 HTTPS 重定向
   - 配置 HSTS 头
   - 启用 HTTP/2 和 HTTP/3
   - 配置安全的 TLS 版本

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

## 全球成本估算

### Vercel 费用

- Hobby Plan: $0/月 (适合小项目，全球 CDN)
- Pro Plan: $20/月 (适合中型项目，全球边缘计算)
- Enterprise Plan: 联系销售 (企业级全球部署)

### MongoDB Atlas 费用

- Free Tier: $0/月 (512MB，单地区)
- Shared Cluster: $9/月 (2GB，单地区)
- **Global Cluster: $57/月 (2GB，多地区部署)**
- **Multi-Region Cluster: $114/月 (2GB，全球部署)**

### 全球云存储费用

- **AWS S3 + CloudFront**: 存储 + 全球 CDN 流量费用
- **Cloudflare R2**: 存储费用，CDN 免费
- **Vercel Blob**: 存储 + 全球 CDN，按使用量计费

### 全球 DNS 费用

- **Cloudflare**: 免费计划支持全球 DNS
- **Route 53**: 按查询次数计费

### 全球监控费用

- **Sentry**: 按事件数量计费
- **Datadog**: 按主机和功能计费
- **UptimeRobot**: 免费计划支持 50 个监控点

## 全球部署优势

这个全球部署方案提供了：

### 🌍 全球覆盖

- **200+ 全球 CDN 节点**
- **自动就近访问**
- **多地区数据库部署**
- **全球边缘计算**

### ⚡ 极致性能

- **毫秒级响应时间**
- **HTTP/3 支持**
- **Brotli 压缩**
- **智能缓存策略**

### 🔒 企业级安全

- **全球 SSL 证书**
- **DDoS 防护**
- **WAF 防火墙**
- **合规性支持**

### 📊 全面监控

- **全球性能监控**
- **实时错误追踪**
- **用户行为分析**
- **可用性监控**

### 💰 成本优化

- **按使用量付费**
- **自动扩展**
- **资源优化**
- **免费额度充足**

## 部署建议

1. **开发阶段**: 使用 Vercel Hobby Plan + MongoDB Atlas Free Tier
2. **测试阶段**: 升级到 Pro Plan 进行全球测试
3. **生产阶段**: 根据用户分布选择合适的多地区部署方案
4. **扩展阶段**: 考虑企业级方案以获得更好的支持和性能

建议先在开发环境充分测试，然后逐步部署到生产环境，并根据实际使用情况优化配置。
