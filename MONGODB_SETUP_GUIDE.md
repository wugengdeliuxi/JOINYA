# MongoDB 数据库配置指南

## 📋 概述

部署 JOINYA 项目需要两个关键的环境变量：

- `MONGODB_URI`: MongoDB 数据库连接字符串
- `JWT_SECRET`: JWT 令牌签名密钥

## 🗄️ MongoDB 数据库配置

### 方法 1：使用 MongoDB Atlas（推荐 - 免费）

MongoDB Atlas 是 MongoDB 官方提供的云数据库服务，有免费套餐。

#### 步骤 1：创建 MongoDB Atlas 账户

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 点击 "Try Free" 注册免费账户
3. 验证邮箱并登录

#### 步骤 2：创建集群

1. 登录后，点击 "Build a Database"
2. 选择 **"M0 Sandbox"**（免费套餐）
3. 选择云服务商：
   - **AWS** 或 **Google Cloud**
   - 推荐选择离你最近的区域（如 Singapore 或 Hong Kong）
4. 集群名称：可以使用默认或改为 `joinya-cluster`
5. 点击 "Create"

#### 步骤 3：配置数据库访问

1. **设置数据库用户**：

   - 页面会自动跳转到用户设置
   - Username: 输入 `joinya-admin`
   - Password: 点击 "Autogenerate Secure Password" 生成密码
   - **重要：复制并保存这个密码！**
   - 点击 "Create User"

2. **配置网络访问**：
   - 选择 "Add IP Address"
   - 点击 "Add a current IP address" 添加当前 IP
   - **重要：为了 Vercel 部署，还需要添加 `0.0.0.0/0`**
   - 点击 "Add Entry"
   - 点击 "Finish and Close"

#### 步骤 4：获取连接字符串

1. 在 Atlas Dashboard 中，点击 "Connect"
2. 选择 "Connect your application"
3. Driver 选择 "Node.js"，Version 选择 "4.1 or later"
4. 复制连接字符串，格式如下：

   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **替换占位符**：

   - 将 `<username>` 替换为你的用户名（如 `joinya-admin`）
   - 将 `<password>` 替换为你生成的密码
   - 在 `mongodb.net/` 后面添加数据库名 `joinya`

6. **最终的 MONGODB_URI 应该类似**：
   ```
   mongodb+srv://joinya-admin:your-password@cluster0.xxxxx.mongodb.net/joinya?retryWrites=true&w=majority
   ```

### 方法 2：本地 MongoDB（开发环境）

如果只是本地开发，可以安装本地 MongoDB：

```bash
# macOS (使用 Homebrew)
brew install mongodb-community

# Windows (下载安装包)
# 访问 https://www.mongodb.com/try/download/community

# Ubuntu/Debian
sudo apt-get install mongodb

# 本地连接字符串
MONGODB_URI=mongodb://localhost:27017/joinya
```

## 🔐 JWT_SECRET 配置

JWT_SECRET 是用于签名 JWT 令牌的密钥，需要是一个足够复杂的随机字符串。

### 生成 JWT_SECRET 的方法

#### 方法 1：使用 Node.js 生成（推荐）

在终端运行以下命令：

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

这会生成一个 128 字符的随机十六进制字符串，如：

```
a1b2c3d4e5f6...（128个字符）
```

#### 方法 2：在线生成器

访问以下任一网站生成：

- [randomkeygen.com](https://randomkeygen.com/)
- [allkeysgenerator.com](https://allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx)

选择 "CodeIgniter Encryption Keys" 或类似选项。

#### 方法 3：手动创建

创建一个至少 32 字符的复杂字符串，包含：

- 大小写字母
- 数字
- 特殊字符

例如：

```
MySuper$ecretJWT2024!@#joinya$project&secure*key
```

## 📝 完整的环境变量配置

### 开发环境 (.env 文件)

在 `backend` 目录创建 `.env` 文件：

```bash
# 数据库配置
MONGODB_URI=mongodb+srv://joinya-admin:your-password@cluster0.xxxxx.mongodb.net/joinya?retryWrites=true&w=majority

# JWT配置
JWT_SECRET=your-generated-jwt-secret-here

# 环境配置
NODE_ENV=development

# 文件上传配置
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# 跨域配置
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 生产环境（Vercel）

在 Vercel Dashboard 的项目设置中添加环境变量：

1. 进入你的后端项目
2. 点击 "Settings" → "Environment Variables"
3. 添加以下变量：

| Name          | Value                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | `mongodb+srv://joinya-admin:your-password@cluster0.xxxxx.mongodb.net/joinya?retryWrites=true&w=majority` |
| `JWT_SECRET`  | `your-generated-jwt-secret-here`                                                                         |
| `NODE_ENV`    | `production`                                                                                             |

## 🧪 测试连接

### 测试 MongoDB 连接

创建一个测试脚本 `test-db.js`：

```javascript
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB 连接成功！')

    // 测试创建一个文档
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    })

    const TestModel = mongoose.model('Test', testSchema)
    const testDoc = new TestModel({ name: 'Connection Test' })
    await testDoc.save()

    console.log('✅ 数据库写入测试成功！')

    // 清理测试数据
    await TestModel.deleteOne({ name: 'Connection Test' })
    console.log('✅ 测试完成，数据已清理')
  } catch (error) {
    console.error('❌ 数据库连接失败：', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

testConnection()
```

运行测试：

```bash
cd backend
node test-db.js
```

### 测试 JWT

创建测试脚本 `test-jwt.js`：

```javascript
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

function testJWT() {
  try {
    const payload = { userId: 'test123', email: 'test@example.com' }

    // 生成令牌
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
    console.log('✅ JWT 令牌生成成功')

    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ JWT 令牌验证成功：', decoded)
  } catch (error) {
    console.error('❌ JWT 测试失败：', error.message)
  }
}

testJWT()
```

运行测试：

```bash
node test-jwt.js
```

## 🔒 安全注意事项

1. **永远不要将敏感信息提交到 Git**

   - 确保 `.env` 文件在 `.gitignore` 中
   - 使用 `env.example` 作为模板

2. **定期轮换密钥**

   - JWT_SECRET 应该定期更换
   - MongoDB 密码也建议定期更新

3. **网络安全**

   - 生产环境中，尽量限制 MongoDB 的 IP 访问范围
   - 使用强密码

4. **备份**
   - MongoDB Atlas 提供自动备份功能
   - 重要数据请定期手动备份

## 🚀 快速开始

复制这个命令来快速生成你需要的配置：

```bash
# 生成 JWT Secret
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"

# 创建 .env 文件模板
cat > backend/.env << EOF
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/joinya?retryWrites=true&w=majority
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
NODE_ENV=development
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
EOF

echo "✅ .env 文件已创建，请更新 MONGODB_URI 中的实际数据库连接信息"
```

现在你有了完整的数据库和 JWT 配置指南！🎉
