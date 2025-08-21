<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon size="32"><Picture /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.materials }}</div>
            <div class="stat-label">素材总数</div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon size="32"><Goods /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.products }}</div>
            <div class="stat-label">产品总数</div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon size="32"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.users }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-col>
      
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon size="32"><DataLine /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.views }}</div>
            <div class="stat-label">今日访问</div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <div class="chart-card">
          <h3>素材上传趋势</h3>
          <div class="chart-placeholder">
            <el-icon size="48"><TrendCharts /></el-icon>
            <p>图表区域 - 素材上传趋势</p>
          </div>
        </div>
      </el-col>
      
      <el-col :span="12">
        <div class="chart-card">
          <h3>素材类型分布</h3>
          <div class="chart-placeholder">
            <el-icon size="48"><PieChart /></el-icon>
            <p>图表区域 - 素材类型分布</p>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 最近活动 -->
    <div class="recent-activities">
      <h3>最近活动</h3>
      <el-timeline>
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref({
  materials: 0,
  products: 0,
  users: 0,
  views: 0
})

const recentActivities = ref([
  {
    id: 1,
    content: '上传了新的产品图片',
    time: '2024-01-15 14:30',
    type: 'primary'
  },
  {
    id: 2,
    content: '更新了产品信息',
    time: '2024-01-15 13:20',
    type: 'success'
  },
  {
    id: 3,
    content: '删除了过期素材',
    time: '2024-01-15 12:15',
    type: 'warning'
  },
  {
    id: 4,
    content: '新增用户注册',
    time: '2024-01-15 11:45',
    type: 'info'
  }
])

onMounted(() => {
  // 模拟获取统计数据
  stats.value = {
    materials: 156,
    products: 89,
    users: 23,
    views: 1247
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  color: #409EFF;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.charts-row {
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 300px;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.chart-placeholder {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
}

.chart-placeholder p {
  margin: 10px 0 0 0;
  font-size: 14px;
}

.recent-activities {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-activities h3 {
  margin: 0 0 20px 0;
  color: #333;
}
</style>
