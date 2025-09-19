<template>
  <div class="menu-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="container-fluid">
        <el-skeleton :rows="5" animated />
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-container">
      <div class="container">
        <div class="error-content">
          <h2>{{ $t('menu.notFound') }}</h2>
          <p>{{ $t('menu.notFoundDesc') }}</p>
          <p class="redirect-info">{{ $t('menu.redirecting') }}</p>
          <el-button type="primary" @click="$router.push('/')">
            {{ $t('menu.backHome') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 富文本内容 -->
    <div v-if="menu && !loading && !error" class="rich-content-wrapper">
      <div class="container-fluid">
        <div class="rich-content" v-html="getCurrentBody()"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { menusApi, type Menu } from '@/services/menus'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

const menu = ref<Menu | null>(null)
const loading = ref(true)
const error = ref(false)

// 获取当前语言的内容
const getCurrentBody = () => {
  if (!menu.value) return ''
  return locale.value === 'zh-cn' ? menu.value.content.zh.body : menu.value.content.en.body
}

// 获取菜单数据
const fetchMenu = async () => {
  try {
    loading.value = true
    error.value = false

    // 从路由路径中获取slug（去掉开头的斜杠）
    const slug = route.path.substring(1)
    const response = await menusApi.getMenu(slug)

    if (response.success) {
      menu.value = response.data

      // 设置页面标题和SEO信息
      const title = locale.value === 'zh-cn' ? menu.value.content.zh.metaTitle || menu.value.content.zh.title : menu.value.content.en.metaTitle || menu.value.content.en.title

      const description = locale.value === 'zh-cn' ? menu.value.content.zh.metaDescription : menu.value.content.en.metaDescription

      document.title = `${title} - JOINYA`

      if (description) {
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) {
          metaDesc.setAttribute('content', description)
        }
      }
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('获取菜单失败:', err)
    error.value = true
    ElMessage.error('获取菜单失败')
  } finally {
    loading.value = false
  }
}

// 监听语言变化
watch(locale, () => {
  if (menu.value) {
    // 更新页面标题和SEO信息
    const title = locale.value === 'zh-cn' ? menu.value.content.zh.metaTitle || menu.value.content.zh.title : menu.value.content.en.metaTitle || menu.value.content.en.title

    const description = locale.value === 'zh-cn' ? menu.value.content.zh.metaDescription : menu.value.content.en.metaDescription

    document.title = `${title} - JOINYA`

    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', description)
      }
    }
  }
})

// 组件挂载
onMounted(() => {
  fetchMenu()
})

// 监听路由变化
watch(
  () => route.path,
  () => {
    fetchMenu()
  }
)
</script>

<style scoped>
.menu-page {
  background: #f8f9fa;
}

.container-fluid {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container {
  padding: 40px 0;
}

.error-container {
  padding: 80px 0;
  text-align: center;
}

.error-content h2 {
  color: #e74c3c;
  margin-bottom: 16px;
}

.error-content p {
  color: #666;
  margin-bottom: 24px;
}

.redirect-info {
  color: #3498db !important;
  font-style: italic;
}

.rich-content-wrapper {
  padding: 0;
}

.rich-content {
  background: #fff;
  line-height: 1.8;
  color: #333;
  padding: 40px;
}

.rich-content :deep(h1),
.rich-content :deep(h2),
.rich-content :deep(h3),
.rich-content :deep(h4),
.rich-content :deep(h5),
.rich-content :deep(h6) {
  margin-top: 32px;
  margin-bottom: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.rich-content :deep(h1) {
  font-size: 2.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 16px;
}

.rich-content :deep(h2) {
  font-size: 2rem;
  color: #34495e;
}

.rich-content :deep(h3) {
  font-size: 1.5rem;
  color: #34495e;
}

.rich-content :deep(p) {
  margin-bottom: 16px;
  color: #555;
}

.rich-content :deep(ul),
.rich-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.rich-content :deep(li) {
  margin-bottom: 8px;
}

.rich-content :deep(blockquote) {
  border-left: 4px solid #3498db;
  padding-left: 20px;
  margin: 24px 0;
  color: #666;
  font-style: italic;
}

.rich-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.rich-content :deep(a) {
  color: #3498db;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.rich-content :deep(a:hover) {
  border-bottom-color: #3498db;
}

.rich-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
}

.rich-content :deep(th),
.rich-content :deep(td) {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.rich-content :deep(th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

.rich-content :deep(code) {
  background-color: #f1f2f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.rich-content :deep(pre) {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 24px 0;
}

.rich-content :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .rich-content {
    padding: 24px;
  }

  .rich-content :deep(h1) {
    font-size: 2rem;
  }

  .rich-content :deep(h2) {
    font-size: 1.5rem;
  }

  .rich-content :deep(h3) {
    font-size: 1.25rem;
  }
}
</style>
