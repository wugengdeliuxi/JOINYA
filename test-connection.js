// MongoDB 连接测试脚本
// 使用前请替换连接字符串中的用户名、密码和集群地址

const mongoose = require('mongoose');

// 替换为你的真实连接字符串
const MONGODB_URI = 'mongodb+srv://你的用户名:你的密码@你的集群.mongodb.net/joinya?retryWrites=true&w=majority';

async function testConnection() {
    console.log('🔄 正在测试 MongoDB 连接...');
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB 连接成功！');
        console.log('✅ IP 白名单配置正确');
        
        // 测试基本操作
        console.log('🔄 测试数据库操作...');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('✅ 数据库操作正常');
        
    } catch (error) {
        console.log('❌ 连接失败:', error.message);
        
        if (error.message.includes('IP')) {
            console.log('💡 请检查 MongoDB Atlas 的 Network Access 设置');
            console.log('💡 确保添加了 0.0.0.0/0 到 IP 白名单');
        } else if (error.message.includes('authentication')) {
            console.log('💡 请检查用户名和密码是否正确');
        } else {
            console.log('💡 请检查连接字符串格式是否正确');
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 连接已关闭');
    }
}

testConnection(); 