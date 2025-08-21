<template>
  <div class="mountain-bikes-page">
    <div class="container">
      <h1>{{ $t('nav.mountainBikes') }}</h1>
      <p>山地车页面正在开发中...</p>
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
.mountain-bikes-page {
  padding: 40px 0;
  min-height: 60vh;
}
</style> 