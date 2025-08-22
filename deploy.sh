#!/bin/bash

echo "🚀 JOINYA Monorepo 部署脚本"
echo "================================"

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，请先安装："
    echo "npm i -g vercel"
    exit 1
fi

echo "📦 开始部署..."

# 部署后端
echo "🔧 部署后端 API..."
cd backend
vercel --prod --confirm
if [ $? -eq 0 ]; then
    echo "✅ 后端部署成功"
else
    echo "❌ 后端部署失败"
    exit 1
fi

# 部署官网前端
echo "🌐 部署官网前端..."
cd ../web
vercel --prod --confirm
if [ $? -eq 0 ]; then
    echo "✅ 官网前端部署成功"
else
    echo "❌ 官网前端部署失败"
    exit 1
fi

# 部署管理后台
echo "⚙️ 部署管理后台..."
cd ../admin-panel
vercel --prod --confirm
if [ $? -eq 0 ]; then
    echo "✅ 管理后台部署成功"
else
    echo "❌ 管理后台部署失败"
    exit 1
fi

cd ..
echo "🎉 所有项目部署完成！"
echo "请在 Vercel Dashboard 中检查部署状态和配置环境变量。" 