<template>
  <footer class="footer-nav">
    <!-- 新闻通讯订阅区域 -->
    <section class="newsletter-section">
      <div class="container">
        <div class="newsletter-content">
          <div class="newsletter-info">
            <h3>{{ $t('newsletter.title') }}</h3>
            <p>{{ $t('newsletter.description') }}</p>
          </div>
          <div class="newsletter-form">
            <el-input
              v-model="email"
              :placeholder="$t('newsletter.email')"
              size="large"
              class="newsletter-input"
            >
              <template #append>
                <el-button type="primary" @click="handleSubscribe">
                  {{ $t('newsletter.subscribe') }}
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </section>

    <!-- 主要页脚内容 -->
    <section class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <!-- 关于我们 -->
          <div class="footer-column">
            <h4>{{ $t('footer.aboutUs') }}</h4>
            <ul class="footer-links">
              <li><a href="#">{{ $t('footer.exploreBrand') }}</a></li>
              <li><a href="#">{{ $t('footer.awards') }}</a></li>
              <li><a href="#">{{ $t('footer.workAt') }}</a></li>
              <li><a href="#">{{ $t('footer.newsroom') }}</a></li>
              <li><a href="#">{{ $t('footer.terms') }}</a></li>
              <li><a href="#">{{ $t('footer.legal') }}</a></li>
              <li><a href="#">{{ $t('footer.privacy') }}</a></li>
              <li><a href="#">{{ $t('footer.compliance') }}</a></li>
            </ul>
          </div>

          <!-- 探索 -->
          <div class="footer-column">
            <h4>{{ $t('footer.explore') }}</h4>
            <ul class="footer-links">
              <li><a href="#">{{ $t('footer.news') }}</a></li>
              <li><a href="#">{{ $t('footer.athletes') }}</a></li>
              <li><a href="#">{{ $t('footer.events') }}</a></li>
              <li><a href="#">{{ $t('footer.benefits') }}</a></li>
              <li><a href="#">{{ $t('footer.app') }}</a></li>
              <li><a href="#">{{ $t('footer.sitemap') }}</a></li>
            </ul>
          </div>

          <!-- 购买工具 -->
          <div class="footer-column">
            <h4>{{ $t('footer.buyingTools') }}</h4>
            <ul class="footer-links">
              <li><a href="#">{{ $t('footer.findDreamBike') }}</a></li>
              <li><a href="#">{{ $t('footer.inStockBikes') }}</a></li>
              <li><a href="#">{{ $t('footer.findSize') }}</a></li>
              <li><a href="#">{{ $t('footer.comparison') }}</a></li>
              <li><a href="#">{{ $t('footer.referFriend') }}</a></li>
            </ul>
          </div>

          <!-- 客户服务 -->
          <div class="footer-column">
            <h4>{{ $t('footer.customerService') }}</h4>
            <ul class="footer-links">
              <li><a href="#">{{ $t('footer.supportCenter') }}</a></li>
              <li><a href="#">{{ $t('footer.serviceLocations') }}</a></li>
              <li><a href="#">{{ $t('footer.shipping') }}</a></li>
              <li><a href="#">{{ $t('footer.paymentFinancing') }}</a></li>
              <li><a href="#">{{ $t('footer.warranty') }}</a></li>
              <li><a href="#">{{ $t('footer.returns') }}</a></li>
              <li><a href="#">{{ $t('footer.trackOrder') }}</a></li>
              <li><a href="#">{{ $t('footer.contact') }}</a></li>
            </ul>
          </div>

          <!-- 自行车世界 -->
          <div class="footer-column">
            <h4>{{ $t('footer.bikeWorlds') }}</h4>
            <ul class="footer-links">
              <li><router-link to="/road-bikes">{{ $t('footer.road') }}</router-link></li>
              <li><router-link to="/gravel-bikes">{{ $t('footer.gravel') }}</router-link></li>
              <li><router-link to="/mountain-bikes">{{ $t('footer.mountain') }}</router-link></li>
              <li><router-link to="/e-bikes">{{ $t('footer.electric') }}</router-link></li>
              <li><a href="#">{{ $t('footer.hybrid') }}</a></li>
              <li><router-link to="/gear">{{ $t('footer.gear') }}</router-link></li>
              <li><router-link to="/sale">{{ $t('footer.outlet') }}</router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 版权信息 -->
    <section class="footer-bottom">
      <div class="container">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>JOINYA © {{ $t('footer.copyright') }} – {{ currentYear }} JOINYA Bicycles GmbH – {{ $t('footer.allRightsReserved') }}</p>
          </div>
          <div class="footer-meta">
            <span>{{ currentCountry }} | {{ currentLanguage }}</span>
          </div>
        </div>
      </div>
    </section>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { locale, t } = useI18n()
const email = ref('')

const currentYear = new Date().getFullYear()

const currentLanguage = computed(() => {
  return locale.value === 'zh-cn' ? '简体中文' : 'English'
})

const currentCountry = computed(() => {
  return locale.value === 'zh-cn' ? 'China' : 'Global'
})

const handleSubscribe = () => {
  if (!email.value) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  if (!isValidEmail(email.value)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }

  // 这里实际项目中应该调用API
  ElMessage.success('订阅成功！感谢您的关注。')
  email.value = ''
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
</script>

<style scoped>
.footer-nav {
  background: #1a1a1a;
  color: #fff;
  margin-top: auto;
}

.newsletter-section {
  background: #000;
  padding: 60px 0;
}

.newsletter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.newsletter-info h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #fff;
}

.newsletter-info p {
  color: #ccc;
  font-size: 16px;
  margin: 0;
  max-width: 500px;
}

.newsletter-form {
  flex-shrink: 0;
  min-width: 400px;
}

.newsletter-input {
  width: 100%;
}

.newsletter-input :deep(.el-input__wrapper) {
  background: #fff;
  border-radius: 6px 0 0 6px;
}

.newsletter-input :deep(.el-input-group__append) {
  background: #007bff;
  border: none;
  border-radius: 0 6px 6px 0;
}

.newsletter-input :deep(.el-button) {
  background: #007bff;
  border: none;
  color: #fff;
  font-weight: 500;
  padding: 0 20px;
}

.newsletter-input :deep(.el-button):hover {
  background: #0056b3;
}

.footer-main {
  padding: 60px 0 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 40px;
}

.footer-column h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #fff;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #fff;
}

.footer-bottom {
  border-top: 1px solid #333;
  padding: 20px 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright p {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.footer-meta {
  color: #999;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .newsletter-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }

  .newsletter-form {
    min-width: auto;
    width: 100%;
    max-width: 400px;
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .newsletter-section {
    padding: 40px 0;
  }

  .newsletter-info h3 {
    font-size: 20px;
  }

  .footer-main {
    padding: 40px 0 30px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .footer-column {
    text-align: center;
  }
}
</style> 