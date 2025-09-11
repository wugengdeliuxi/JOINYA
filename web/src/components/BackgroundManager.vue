<template>
  <div class="background-manager">
    <div v-if="backgroundUrl" class="background-image" :style="{ backgroundImage: `url(${backgroundUrl})` }" />
    <div v-else class="default-background" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { materialsApi } from '@/services/materials'

const backgroundUrl = ref('')

// 获取背景图片
const fetchBackground = async () => {
  try {
    const response = (await materialsApi.getBackgrounds()) as any
    if (response?.data && response?.data?.length > 0) {
      // 使用第一个背景图片
      backgroundUrl.value = response.data[0].url
    }
  } catch (error) {
    console.warn('获取背景图片失败，使用默认背景:', error)
  }
}

onMounted(() => {
  fetchBackground()
})
</script>

<style scoped>
.background-manager {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.background-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.default-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
