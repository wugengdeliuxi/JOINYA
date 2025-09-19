import { menusApi } from '@/services/menus'
import type { Menu } from '@/services/menus'

// 动态路由缓存
let dynamicRoutes: any[] = []
let routesLoaded = false

// 获取动态菜单路由
export const getDynamicRoutes = async () => {
  if (routesLoaded) {
    return dynamicRoutes
  }

  try {
    // 获取所有启用的菜单
    const response = await menusApi.getMenus({ 
      isActive: true,
      limit: 100 // 获取所有菜单
    })

    if (response.success) {
      dynamicRoutes = response.data.map((menu: Menu) => ({
        path: `/${menu.slug}`,
        name: `menu-${menu.slug}`,
        component: () => import('@/views/MenuPage.vue'),
        meta: {
          title: menu.content.zh.title,
          menuId: menu._id,
          slug: menu.slug,
          type: menu.type
        }
      }))
      
      routesLoaded = true
      return dynamicRoutes
    }
  } catch (error) {
    console.error('获取动态路由失败:', error)
  }

  return []
}

// 清除路由缓存（当菜单更新时调用）
export const clearRouteCache = () => {
  routesLoaded = false
  dynamicRoutes = []
}

// 根据slug获取菜单信息
export const getMenuBySlug = async (slug: string): Promise<Menu | null> => {
  try {
    const response = await menusApi.getMenu(slug)
    if (response.success) {
      return response.data
    }
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
  return null
}

// 获取菜单类型对应的路由
export const getMenuTypeRoutes = async (type: string) => {
  try {
    const response = await menusApi.getMenusByType(type)
    if (response.success) {
      return response.data.map((menu: Menu) => ({
        path: `/${menu.slug}`,
        name: `menu-${menu.slug}`,
        component: () => import('@/views/MenuPage.vue'),
        meta: {
          title: menu.content.zh.title,
          menuId: menu._id,
          slug: menu.slug,
          type: menu.type
        }
      }))
    }
  } catch (error) {
    console.error('获取菜单类型路由失败:', error)
  }
  return []
}
