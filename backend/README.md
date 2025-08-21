# JOINYA Backend API

基于 Vercel Serverless Functions 的后端 API 服务

## 技术栈

- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Express Validator
- **Deployment**: Vercel Serverless Functions

## 项目结构

```
backend/
├── api/                    # API路由
│   ├── index.js           # 主入口
│   ├── auth.js            # 认证相关
│   ├── materials.js       # 素材管理
│   ├── products.js        # 产品管理
│   └── users.js           # 用户管理
├── lib/                   # 工具库
│   └── db.js             # 数据库连接
├── models/                # 数据模型
│   ├── User.js           # 用户模型
│   └── Material.js       # 素材模型
├── middleware/            # 中间件
│   └── auth.js           # 认证中间件
├── vercel.json           # Vercel配置
├── package.json          # 依赖配置
└── env.example           # 环境变量示例
```

## 环境变量

复制 `env.example` 为 `.env` 并配置以下变量：

```bash
# 数据库配置
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key-here

# 环境配置
NODE_ENV=development
```

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp env.example .env
# 编辑 .env 文件
```

3. 启动开发服务器：

```bash
npm run dev
```

## 部署到 Vercel

1. 安装 Vercel CLI：

```bash
npm i -g vercel
```

2. 登录 Vercel：

```bash
vercel login
```

3. 部署：

```bash
vercel --prod
```

4. 配置环境变量：
   在 Vercel 控制台中设置以下环境变量：

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

## API 端点

### 认证相关

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 用户登出

### 素材管理

- `GET /api/materials` - 获取素材列表
- `POST /api/materials/upload` - 上传素材
- `GET /api/materials/:id` - 获取单个素材
- `PUT /api/materials/:id` - 更新素材信息
- `DELETE /api/materials/:id` - 删除素材

### 产品管理

- `GET /api/products` - 获取产品列表

### 用户管理

- `GET /api/users` - 获取用户列表

## 文件上传

支持的文件类型：

- 图片：JPEG, PNG, GIF, WebP
- 视频：MP4, WebM, OGG
- 文档：PDF, DOC, DOCX

文件大小限制：50MB

## 权限控制

- **admin**: 管理员权限，可以执行所有操作
- **editor**: 编辑权限，可以上传和管理素材
- **viewer**: 查看权限，只能查看公开内容

## 数据库设计

### User 模型

- username: 用户名
- email: 邮箱
- password: 密码（加密存储）
- role: 角色
- avatar: 头像
- isActive: 是否激活
- lastLogin: 最后登录时间

### Material 模型

- name: 素材名称
- type: 素材类型（image/video/document）
- category: 分类
- url: 文件 URL
- size: 文件大小
- mimeType: MIME 类型
- description: 描述
- tags: 标签数组
- uploadedBy: 上传者
- isPublic: 是否公开
- downloadCount: 下载次数
- viewCount: 查看次数

## 注意事项

1. **文件存储**: 当前使用模拟 URL，生产环境需要集成云存储服务（如 AWS S3、阿里云 OSS 等）

2. **数据库**: 使用 MongoDB Atlas 云数据库，确保网络连接稳定

3. **安全性**:

   - 所有密码都使用 bcrypt 加密
   - JWT 令牌有过期时间
   - 实现了速率限制
   - 使用 helmet 增强安全性

4. **性能**:
   - 数据库连接使用连接池
   - 实现了分页查询
   - 使用索引优化查询性能

## 开发计划

- [ ] 集成云存储服务
- [ ] 添加图片压缩和缩略图生成
- [ ] 实现素材预览功能
- [ ] 添加数据统计和分析
- [ ] 实现批量操作功能
- [ ] 添加 API 文档（Swagger）
