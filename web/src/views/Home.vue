<template>
  <div class="home-page">
    <!-- Hero区域 -->
    <section class="hero-section">
      <div class="hero-background">
        <!-- 动态背景图片 -->
        <BackgroundManager />
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">{{ $t('hero.title') }}</h1>
            <p class="hero-subtitle">{{ $t('hero.subtitle') }}</p>
          </div>
        </div>
      </div>
      <!-- 滚动特色文字 - 悬浮在Hero底部 -->
      <section class="features-scrolling">
        <div class="scrolling-features-content">
          <span class="scrolling-feature-item">
            <el-icon><Van /></el-icon>
            {{ $t('features.directValue') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Star /></el-icon>
            {{ $t('features.championRaced') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Tools /></el-icon>
            {{ $t('features.quickBuild') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Location /></el-icon>
            {{ $t('features.serviceLocations') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Trophy /></el-icon>
            {{ $t('features.germanEngineering') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><CreditCard /></el-icon>
            {{ $t('features.flexiblePayment') }}
          </span>
          <!-- 重复一遍确保无缝循环 -->
          <span class="scrolling-feature-item">
            <el-icon><Van /></el-icon>
            {{ $t('features.directValue') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Star /></el-icon>
            {{ $t('features.championRaced') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Tools /></el-icon>
            {{ $t('features.quickBuild') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Location /></el-icon>
            {{ $t('features.serviceLocations') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><Trophy /></el-icon>
            {{ $t('features.germanEngineering') }}
          </span>
          <span class="scrolling-feature-item">
            <el-icon><CreditCard /></el-icon>
            {{ $t('features.flexiblePayment') }}
          </span>
        </div>
      </section>
    </section>

    <!-- 产品Hero -->
    <section class="product-hero" v-if="currentHero">
      <div class="product-hero-bg">
        <!-- 动态媒体内容 -->
        <video v-if="currentHero.type === 'video'" class="product-hero-video" autoplay muted loop playsinline>
          <source :src="currentHero.url" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <img v-else-if="currentHero.type === 'image'" :src="currentHero.url" :alt="currentHero.name" class="product-hero-image" />
        <div class="product-hero-overlay"></div>
      </div>
      <div class="container">
        <div class="product-hero-content">
          <div class="product-hero-text">
            <h2>{{ currentHero.name }}</h2>
            <p>{{ currentHero.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 第二个产品Hero -->
    <!-- <section class="product-hero secondary">
      <div class="container">
        <div class="product-hero-content">
          <div class="product-hero-text">
            <h2>{{ $t('hero.modernRoadBike') }}</h2>
            <p>{{ $t('hero.modernRoadBikeDesc') }}</p>
            <div class="product-actions">
              <el-button type="primary" size="large">立即购买</el-button>
              <el-button type="default" size="large">查看自行车</el-button>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- 产品分类 -->
    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">{{ $t('categories.shopByWorld') }}</h2>
        <div class="categories-grid">
          <div class="category-card" v-for="category in categories" :key="category.name">
            <router-link :to="category.path" class="category-link">
              <div v-if="category.image" class="category-image">
                <img :src="category.image" :alt="category.name" />
              </div>
              <div class="category-content">
                <h3>{{ category.name }}</h3>
                <p v-if="category.description">{{ category.description }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 发现更多 -->
    <section class="discover-section">
      <div class="container">
        <h2 class="section-title">{{ $t('discover.title') }}</h2>
        <div class="discover-grid">
          <div class="discover-card featured">
            <div class="discover-image"></div>
            <div class="discover-content">
              <h3>{{ $t('discover.grail') }}</h3>
              <p>{{ $t('discover.grailDesc') }}</p>
              <el-button type="primary">{{ $t('discover.shopBikes') }}</el-button>
            </div>
          </div>
          <div class="discover-card">
            <div class="discover-image"></div>
            <div class="discover-content">
              <h3>{{ $t('discover.bikeOfWeek') }}</h3>
              <p>{{ $t('discover.bikeOfWeekDesc') }}</p>
              <el-button type="primary">{{ $t('discover.shopBike') }}</el-button>
            </div>
          </div>
          <div class="discover-card">
            <div class="discover-image"></div>
            <div class="discover-content">
              <h3>{{ $t('discover.customize') }}</h3>
              <p>{{ $t('discover.customizeDesc') }}</p>
              <el-button type="primary">{{ $t('discover.discoverMyCanyon') }}</el-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 支持服务 -->
    <section class="support-section">
      <div class="container">
        <h2 class="section-title">{{ $t('support.title') }}</h2>
        <div class="support-grid">
          <div class="support-card">
            <div class="support-icon">
              <el-icon size="48"><Phone /></el-icon>
            </div>
            <h3>{{ $t('support.appTitle') }}</h3>
            <p>{{ $t('support.appDesc') }}</p>
            <el-button type="primary">{{ $t('support.downloadApp') }}</el-button>
          </div>
          <div class="support-card">
            <div class="support-icon">
              <el-icon size="48"><Setting /></el-icon>
            </div>
            <h3>{{ $t('support.sparePartsTitle') }}</h3>
            <p>{{ $t('support.sparePartsDesc') }}</p>
            <el-button type="primary">{{ $t('support.learnMore') }}</el-button>
          </div>
          <div class="support-card">
            <div class="support-icon">
              <el-icon size="48"><Position /></el-icon>
            </div>
            <h3>{{ $t('support.serviceTitle') }}</h3>
            <p>{{ $t('support.serviceDesc') }}</p>
            <el-button type="primary">{{ $t('support.learnMore') }}</el-button>
          </div>
          <div class="support-card">
            <div class="support-icon">
              <el-icon size="48"><Box /></el-icon>
            </div>
            <h3>{{ $t('support.assemblyTitle') }}</h3>
            <p>{{ $t('support.assemblyDesc') }}</p>
            <el-button type="primary">{{ $t('support.learnMore') }}</el-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackgroundManager from '@/components/BackgroundManager.vue'
import { Tools, Location, CreditCard, Trophy, Van, Star, Phone, Setting, Position, Box } from '@element-plus/icons-vue'
import { heroesApi, type HeroMaterial } from '@/services/heroes'
import { menusApi, type Menu } from '@/services/menus'

const { t, locale } = useI18n()

// Hero素材数据
const heroMaterials = ref<HeroMaterial[]>([])
const currentHero = ref<HeroMaterial | null>(null)

// 产品分类数据（从动态菜单获取）
const categories = ref<
  Array<{
    name: string
    path: string
    image: string
    description?: string
  }>
>([])

// 获取动态菜单数据
const fetchDynamicMenus = async () => {
  try {
    const response = await menusApi.getMenus({
      isActive: true,
      limit: 20
    })
    if (response.success) {
      // 将菜单转换为categories格式
      categories.value = response.data.map((menu: Menu) => ({
        name: locale.value === 'zh-cn' ? menu.content.zh.title : menu.content.en.title,
        path: `/${menu.slug}`,
        image: menu.coverImage || '',
        description: locale.value === 'zh-cn' ? menu.content.zh.description : menu.content.en.description
      }))
    }
  } catch (error) {
    console.warn('获取动态菜单失败:', error)
  }
}

// 获取Hero素材数据
const fetchHeroMaterials = async () => {
  try {
    const response = await heroesApi.getHeroes()
    console.log(response, 'response')
    if (response.success && response.data.length > 0) {
      heroMaterials.value = response.data
      // 使用第一个Hero作为当前显示的Hero
      currentHero.value = response.data[0]
    }
  } catch (error) {
    console.warn('获取Hero素材失败:', error)
  }
}

// 监听语言变化
watch(locale, () => {
  fetchDynamicMenus()
})

// 组件挂载时获取数据
onMounted(() => {
  fetchHeroMaterials()
  fetchDynamicMenus()
})
</script>

<style scoped>
.home-page {
  overflow-x: hidden;
}

/* Hero区域 */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-image {
  width: 100%;
  height: 100%;
  background: url('@/assets/images/bg.avif') center/cover;
  background-position: center center;
  background-repeat: no-repeat;
  opacity: 0.7;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 滚动特色文字 - 悬浮在Hero底部 */
.features-scrolling {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 15px 0;
  overflow: hidden;
  white-space: nowrap;
  z-index: 3;
  backdrop-filter: blur(2px);
}

.scrolling-features-content {
  display: flex;
  animation: scroll-features 30s linear infinite;
}

.scrolling-feature-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 60px;
  flex-shrink: 0;
}

.scrolling-feature-item .el-icon {
  font-size: 16px;
}

@keyframes scroll-features {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* 产品Hero */
.product-hero {
  position: relative;
  height: 80vh;
  display: flex;
  align-items: center;
  background: #000;
  color: white;
  overflow: hidden;
  margin: 16px 16px;
  border-radius: 12px;
}

.product-hero.secondary {
  background: #fff;
  color: #000;
  margin: 16px 16px;
  border-radius: 12px;
}

.product-hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.product-hero-video,
.product-hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.product-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.product-hero-content {
  position: relative;
  z-index: 2;
}

.product-hero-text h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.product-hero-text p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* 产品分类 */
.categories-section {
  padding: 80px 0;
  background: #fff;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #1a1a1a;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.category-card {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.category-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.category-image {
  height: 250px;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.05);
}

.category-content {
  padding: 25px;
  text-align: center;
}

.category-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* 发现更多 */
.discover-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.discover-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 30px;
}

.discover-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.discover-card:hover {
  transform: translateY(-5px);
}

.discover-card.featured {
  grid-row: span 2;
}

.discover-image {
  height: 200px;
  background: url('https://via.placeholder.com/400x200/666/fff?text=Discover') center/cover;
}

.discover-card.featured .discover-image {
  height: 300px;
}

.discover-content {
  padding: 25px;
}

.discover-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.discover-content p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

/* 支持服务 */
.support-section {
  padding: 80px 0;
  background: #fff;
}

.support-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.support-card {
  text-align: center;
  padding: 30px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.support-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.support-icon {
  margin-bottom: 20px;
  color: #007bff;
}

.support-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1a1a1a;
}

.support-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .discover-grid {
    grid-template-columns: 1fr;
  }

  .discover-card.featured {
    grid-row: span 1;
  }

  .support-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-hero-text h2 {
    font-size: 2rem;
  }

  .scrolling-item {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .support-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
