import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/road-bikes',
    name: 'roadBikes',
    component: () => import('@/views/RoadBikes.vue'),
    meta: {
      title: '公路车'
    }
  },
  {
    path: '/gravel-bikes',
    name: 'gravelBikes',
    component: () => import('@/views/GravelBikes.vue'),
    meta: {
      title: '砾石车'
    }
  },
  {
    path: '/mountain-bikes',
    name: 'mountainBikes',
    component: () => import('@/views/MountainBikes.vue'),
    meta: {
      title: '山地车'
    }
  },
  {
    path: '/e-bikes',
    name: 'eBikes',
    component: () => import('@/views/EBikes.vue'),
    meta: {
      title: '电助力自行车'
    }
  },
  {
    path: '/gear',
    name: 'gear',
    component: () => import('@/views/Gear.vue'),
    meta: {
      title: '装备'
    }
  },
  {
    path: '/sale',
    name: 'sale',
    component: () => import('@/views/Sale.vue'),
    meta: {
      title: '特惠'
    }
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('@/views/Service.vue'),
    meta: {
      title: '服务'
    }
  },
  {
    path: '/product/:id',
    name: 'productDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: {
      title: '产品详情'
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

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - JOINYA`
  }
  next()
})

export default router 