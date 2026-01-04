# Supabase Dashboard 导航指南

本指南将帮助您找到 Supabase Dashboard 中的各个配置页面。

## 📍 当前位置

根据您的截图，您当前在 **Project Overview** 页面（项目概览页）。这是 Supabase 项目的主页面。

## 🗺️ 左侧导航菜单说明

在左侧边栏，您可以看到以下菜单项：

### 1. Project Overview（项目概览）

- **当前位置**：您正在查看的页面
- **用途**：查看项目状态、统计数据和服务指标

### 2. Table Editor（表编辑器）

- **用途**：可视化编辑数据库表和数据
- **访问**：点击左侧菜单的 "Table Editor"

### 3. SQL Editor（SQL 编辑器）⭐ **重要**

- **用途**：执行 SQL 脚本创建数据库表
- **访问**：点击左侧菜单的 "SQL Editor"
- **操作步骤**：
  1. 点击左侧菜单的 "SQL Editor"
  2. 点击页面上的 "New query" 按钮
  3. 粘贴 `supabase-schema.sql` 文件的内容
  4. 点击 "Run" 按钮执行

### 4. Database（数据库）

- **用途**：查看数据库结构、索引、外键等
- **访问**：点击左侧菜单的 "Database"

### 5. Authentication（认证）⭐ **重要**

- **用途**：配置用户认证、登录方式、重定向 URL
- **访问**：点击左侧菜单的 "Authentication"
- **配置 URL 的步骤**：
  1. 点击左侧菜单的 "Authentication"
  2. 在 Authentication 页面的左侧导航栏中，找到 "CONFIGURATION" 部分
  3. 点击 "URL Configuration"（不是 Settings 标签）
  4. 在这里配置：
     - **Site URL**：您的前端网站地址
     - **Redirect URLs**：重定向 URL 列表

### 6. Storage（存储）

- **用途**：管理文件存储
- **访问**：点击左侧菜单的 "Storage"

### 7. Edge Functions（边缘函数）

- **用途**：创建和部署边缘函数
- **访问**：点击左侧菜单的 "Edge Functions"

### 8. Realtime（实时）

- **用途**：配置实时功能
- **访问**：点击左侧菜单的 "Realtime"

### 9. Advisors（顾问）

- **用途**：查看项目优化建议
- **访问**：点击左侧菜单的 "Advisors"
- **注意**：您看到的 "10 issues need attention" 可能在这里显示

### 10. Observability（可观测性）

- **用途**：查看项目监控数据
- **访问**：点击左侧菜单的 "Observability"

### 11. Logs（日志）

- **用途**：查看系统日志
- **访问**：点击左侧菜单的 "Logs"

### 12. API Docs（API 文档）

- **用途**：查看自动生成的 API 文档
- **访问**：点击左侧菜单的 "API Docs"

### 13. Integrations（集成）

- **用途**：配置第三方集成
- **访问**：点击左侧菜单的 "Integrations"

### 14. Project Settings（项目设置）⭐ **最重要**

- **用途**：获取 API 密钥、配置项目设置
- **访问**：点击左侧菜单最底部的 "Project Settings"（或 "Settings"）
- **操作步骤**：
  1. 点击左侧菜单的 "Project Settings" 或 "Settings"
  2. 在设置页面中，点击左侧的 "API" 子菜单
  3. 在这里您可以看到：
     - **Project URL**：项目的 API 地址
     - **anon public key**：匿名密钥（公开使用）
     - **service_role key**：服务角色密钥（需要展开 "Project API keys" 部分查看，**请妥善保管，不要泄露**）

## 🔑 获取 API 密钥的详细步骤

### 方法一：通过 Project Settings

1. **找到 Settings 菜单**

   - 在左侧导航栏的最底部，找到 "Project Settings" 或 "Settings"
   - 点击进入

2. **进入 API 页面**

   - 在 Settings 页面中，左侧会有一个子菜单
   - 点击 "API" 选项

3. **查看配置信息**
   - 在 API 页面，您会看到：
     - **Project URL**：类似 `https://xxxxx.supabase.co`
     - **anon public key**：一个很长的 JWT token
     - **service_role key**：在 "Project API keys" 部分，可能需要点击展开才能看到

### 方法二：通过顶部导航

1. 查看页面顶部（在项目名称附近）
2. 可能会有一个 "Settings" 或齿轮图标
3. 点击进入设置页面

## 📝 配置数据库表的步骤

1. **打开 SQL Editor**

   - 在左侧菜单中，点击 "SQL Editor"
   - 您会看到一个代码编辑器界面

2. **创建新查询**

   - 点击页面上的 "New query" 按钮
   - 或者点击 "+" 图标创建新查询

3. **粘贴 SQL 脚本**

   - 打开项目中的 `supabase-schema.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor 中

4. **执行脚本**

   - 点击编辑器下方的 "Run" 按钮
   - 或者按快捷键（通常是 Ctrl+Enter 或 Cmd+Enter）
   - 等待执行完成

5. **验证结果**
   - 执行成功后，您会看到 "Success" 提示
   - 可以切换到 "Table Editor" 查看创建的表

## 🔐 配置认证的步骤

1. **打开 Authentication**

   - 在左侧菜单中，点击 "Authentication"
   - 您会看到认证相关的页面

2. **找到 URL Configuration**

   - 在 Authentication 页面的左侧导航栏中，找到 "CONFIGURATION" 部分
   - 点击 "URL Configuration"（**不是 Settings 标签**）
   - **注意**：URL Configuration 在左侧导航栏的 CONFIGURATION 部分，不在页面顶部的标签中

3. **配置 Site URL**

   - 找到 "Site URL" 输入框
   - 输入您的前端网站地址（例如：`https://your-app.vercel.app`）
   - 如果是开发环境，可以输入：`http://localhost:3000`

4. **配置 Redirect URLs**

   - 找到 "Redirect URLs" 部分
   - 点击 "Add URL" 或 "+" 按钮
   - 添加以下 URL：
     - `https://your-app.vercel.app/**`
     - `http://localhost:3000/**`（开发环境）

5. **保存配置**
   - 配置完成后，页面会自动保存
   - 或者点击 "Save" 按钮

## 🎯 快速导航清单

按照以下顺序完成配置：

- [ ] **步骤 1**：点击 "Project Settings" → "API" → 复制 Project URL、anon key、service_role key
- [ ] **步骤 2**：点击 "SQL Editor" → "New query" → 粘贴 `supabase-schema.sql` → 点击 "Run"
- [ ] **步骤 3**：点击 "Authentication" → "Settings" → 配置 Site URL 和 Redirect URLs
- [ ] **步骤 4**：检查 "Table Editor" 确认表已创建成功

## 💡 常见问题

### Q: 找不到 Settings 菜单？

**A**: Settings 通常在左侧导航栏的最底部，或者可能在项目名称旁边的下拉菜单中。如果还是找不到，可以尝试：

- 查看页面右上角是否有设置图标
- 查看页面顶部是否有 "Settings" 链接

### Q: 找不到 API 密钥？

**A**:

1. 确保您已经进入了 "Project Settings" 页面
2. 在 Settings 页面中，点击左侧的 "API" 子菜单
3. service_role key 可能需要展开 "Project API keys" 部分才能看到

### Q: SQL Editor 在哪里？

**A**: 在左侧导航菜单中，找到 "SQL Editor" 并点击。如果看不到，可能是菜单被折叠了，尝试点击菜单图标展开。

### Q: 如何查看创建的表？

**A**:

1. 点击左侧菜单的 "Table Editor"
2. 您应该能看到所有创建的表
3. 点击表名可以查看表结构和数据

## 📸 界面元素说明

根据您的截图，您当前看到的是：

- **顶部导航栏**：显示项目路径和搜索功能
- **左侧导航栏**：包含所有功能菜单
- **主内容区**：显示项目概览和统计数据
- **服务指标卡片**：显示 Database、Auth、Storage、Realtime 的使用情况

## 🚀 下一步

完成 Supabase 配置后，请继续：

1. 将 API 密钥配置到 Vercel 环境变量中
2. 部署后端到 Vercel
3. 部署前端到 Vercel
4. 测试应用是否正常工作

详细步骤请参考 `DEPLOYMENT_GUIDE.md`。

---

**提示**：如果仍然找不到某个页面，请告诉我您具体想找什么功能，我可以提供更详细的指导。
