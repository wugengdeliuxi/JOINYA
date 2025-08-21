<template>
  <div class="service-page">
    <div class="container">
      <h1>{{ $t('nav.service') }}</h1>
      <p>服务页面正在开发中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.body.style.paddingTop = '120px'
})
</script>

<style scoped>
.service-page {
  padding: 40px 0;
  min-height: 60vh;
}
</style> 