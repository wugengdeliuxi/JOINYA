<template>
  <div class="sale-page">
    <div class="container">
      <h1>{{ $t('nav.sale') }}</h1>
      <p>特惠页面正在开发中...</p>
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
.sale-page {
  padding: 40px 0;
  min-height: 60vh;
}
</style> 