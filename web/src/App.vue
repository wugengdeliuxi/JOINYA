<template>
  <div id="app">
    <!-- 导航栏 -->
    <HeaderNav />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 页脚 -->
    <FooterNav />
  </div>
</template>

<script setup lang="ts">
import HeaderNav from '@/components/layout/HeaderNav.vue'
import FooterNav from '@/components/layout/FooterNav.vue'
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-x: hidden;
}
</style> 