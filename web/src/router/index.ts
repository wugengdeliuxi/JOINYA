import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getDynamicRoutes, clearRouteCache } from '@/utils/routeManager'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  // 动态菜单路由将在运行时添加
  {
    path: '/product/:id',
    name: 'productDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: {
      title: '产品详情'
    }
  },
  {
    path: '/menu/:slug',
    name: 'menuPage',
    component: () => import('@/views/MenuPage.vue'),
    meta: {
      title: '菜单页面'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 动态添加菜单路由
export const setupDynamicRoutes = async () => {
  try {
    const dynamicRoutes = await getDynamicRoutes()
    
    // 添加动态路由到路由器
    dynamicRoutes.forEach(route => {
      if (!router.hasRoute(route.name)) {
        router.addRoute(route)
      }
    })
    
    console.log('动态路由加载完成:', dynamicRoutes.length, '个菜单路由')
  } catch (error) {
    console.error('设置动态路由失败:', error)
  }
}

// 重新加载动态路由（当菜单更新时调用）
export const reloadDynamicRoutes = async () => {
  clearRouteCache()
  await setupDynamicRoutes()
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - JOINYA`
  }

  // 检查是否是动态菜单路由（不是根路径且不是已知的静态路由）
  const staticRoutes = ['/', '/product', '/search']
  const isStaticRoute = staticRoutes.some(route => to.path.startsWith(route))
  
  if (!isStaticRoute && !router.hasRoute(to.name || '')) {
    // 检测到动态路由不存在，直接重定向到主页
    console.log('检测到动态路由不存在，重定向到主页:', to.path)
    next('/')
    return
  }

  next()
})

export default router 