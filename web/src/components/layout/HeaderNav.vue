<template>
  <header class="header-nav">
    <!-- 顶部信息栏 -->
    <div class="top-bar">
      <div class="container">
        <div class="top-bar-content">
          <div class="top-bar-links">
            <el-link :underline="false" class="top-link">{{ $t('nav.findYourBike') }}</el-link>
            <el-link :underline="false" class="top-link">{{ $t('nav.size') }}</el-link>
          </div>
          <div class="top-bar-right">
            <el-dropdown @command="handleLanguageChange" trigger="click">
              <span class="language-selector">
                <el-icon><Operation /></el-icon>
                {{ currentLanguage }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-cn">中文</el-dropdown-item>
                  <el-dropdown-item command="en">English</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 主导航栏 -->
    <nav class="main-nav">
      <div class="container">
        <div class="nav-content">
          <!-- Logo -->
          <router-link to="/" class="logo">
            <img :src="logoUrl || '@/assets/images/logo.jpg'" alt="JOINYA" class="logo-image" @error="handleLogoError" />
          </router-link>

          <!-- 主菜单 -->
          <div class="nav-menu" :class="{ 'mobile-open': mobileMenuOpen }">
            <router-link to="/road-bikes" class="nav-link">{{ $t('nav.roadBikes') }}</router-link>
            <router-link to="/gravel-bikes" class="nav-link">{{ $t('nav.gravelBikes') }}</router-link>
            <router-link to="/mountain-bikes" class="nav-link">{{ $t('nav.mountainBikes') }}</router-link>
            <router-link to="/e-bikes" class="nav-link">{{ $t('nav.eBikes') }}</router-link>
            <router-link to="/gear" class="nav-link">{{ $t('nav.gear') }}</router-link>
            <router-link to="/sale" class="nav-link sale-link">{{ $t('nav.sale') }}</router-link>
            <router-link to="/service" class="nav-link">{{ $t('nav.service') }}</router-link>
          </div>

          <!-- 右侧工具栏 -->
          <div class="nav-tools">
            <!-- 搜索 -->
            <el-button type="text" @click="showSearch = !showSearch" class="tool-btn">
              <el-icon><Search /></el-icon>
            </el-button>

            <!-- 登录 -->
            <el-button type="text" class="tool-btn">
              <el-icon><User /></el-icon>
            </el-button>

            <!-- 移动端菜单按钮 -->
            <el-button type="text" class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
              <el-icon><Menu /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 搜索框 -->
    <transition name="search-fade">
      <div v-if="showSearch" class="search-overlay">
        <div class="container">
          <div class="search-content">
            <el-input v-model="searchQuery" :placeholder="$t('nav.search')" size="large" clearable @keyup.enter="handleSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="text" @click="showSearch = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Search, Menu, Operation, Close, User } from '@element-plus/icons-vue'
import { materialsApi } from '@/services/materials'

const { locale, t } = useI18n()
const router = useRouter()

const mobileMenuOpen = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const logoUrl = ref('')

const currentLanguage = computed(() => {
  return locale.value === 'zh-cn' ? '中文' : 'English'
})

const handleLanguageChange = (language: string) => {
  locale.value = language
  localStorage.setItem('language', language)
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    showSearch.value = false
    searchQuery.value = ''
  }
}

// 获取动态logo
const fetchLogo = async () => {
  try {
    const response = (await materialsApi.getLogos()) as any
    if (response.success && response.data && response.data.length > 0) {
      // 使用第一个logo作为默认logo
      logoUrl.value = response.data[0].url
    }
  } catch (error) {
    console.warn('获取logo失败，使用默认logo:', error)
  }
}

// Logo加载错误处理
const handleLogoError = () => {
  logoUrl.value = ''
}

// 监听路由变化关闭移动端菜单
router.afterEach(() => {
  mobileMenuOpen.value = false
})

// 组件挂载时获取logo
onMounted(() => {
  fetchLogo()
})
</script>

<style scoped>
.header-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.top-bar {
  background: #f8f9fa;
  padding: 8px 0;
  font-size: 14px;
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-bar-links {
  display: flex;
  gap: 20px;
}

.top-link {
  color: #666;
  font-size: 13px;
  transition: color 0.3s ease;
}

.top-link:hover {
  color: #000;
}

.top-bar-right {
  display: flex;
  align-items: center;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.language-selector:hover {
  background: #e9ecef;
  color: #000;
}

.main-nav {
  padding: 15px 0;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: #333;
  font-weight: 500;
  text-decoration: none;
  padding: 10px 5px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-link:hover {
  color: #000;
}

.nav-link.router-link-active {
  color: #000;
  font-weight: 600;
}

.sale-link {
  color: #e74c3c !important;
  font-weight: 600;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-btn {
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.tool-btn:hover {
  background-color: #f5f5f5;
}

.tool-btn .el-icon {
  font-size: 20px;
  color: #333;
}

.mobile-menu-btn {
  display: none;
}

.search-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  padding: 20px 0;
  z-index: 999;
}

.search-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-content .el-input {
  flex: 1;
}

/* 动画 */
.search-fade-enter-active,
.search-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    display: none;
  }

  .nav-menu {
    position: fixed;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-menu.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
    justify-content: space-between;
  }

  .mobile-menu-btn {
    display: block;
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 32px;
  }

  .main-nav {
    padding: 12px 0;
  }
}
</style>
