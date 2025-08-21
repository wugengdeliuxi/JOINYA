<template>
  <div class="gear-page">
    <div class="container">
      <h1>{{ $t('nav.gear') }}</h1>
      <p>装备页面正在开发中...</p>
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
.gear-page {
  padding: 40px 0;
  min-height: 60vh;
}
</style> 