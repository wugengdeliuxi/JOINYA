import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router, { setupDynamicRoutes } from './router'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import '@/assets/styles/global.css'
import { menuWatcher } from '@/utils/menuWatcher'

// 导入语言文件
import zhCnMessages from '@/locales/zh-cn.json'
import enMessages from '@/locales/en.json'

const messages = {
  'zh-cn': zhCnMessages,
  'en': enMessages
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-cn',
  fallbackLocale: 'en',
  messages
})

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
  locale: zhCn
})

// 设置动态路由
setupDynamicRoutes().then(() => {
  app.mount('#app')
  
  // 启动菜单更新监听
  menuWatcher.startWatching()
}).catch((error) => {
  console.error('动态路由设置失败:', error)
  app.mount('#app')
}) 