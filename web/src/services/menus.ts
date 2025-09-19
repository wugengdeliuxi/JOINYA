import api from './api'

export interface MenuContent {
  title: string
  description?: string
  body: string
  metaTitle?: string
  metaDescription?: string
}

export interface Menu {
  _id: string
  name: string
  slug: string
  type: 'road-bikes' | 'gravel-bikes' | 'mountain-bikes' | 'e-bikes' | 'gear' | 'service' | 'sale' | 'custom'
  content: {
    zh: MenuContent
    en: MenuContent
  }
  isActive: boolean
  sortOrder: number
  coverImage?: string
  tags: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface MenuListResponse {
  success: boolean
  data: Menu[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface MenuResponse {
  success: boolean
  data: Menu
}

export const menusApi = {
  // 获取菜单列表
  getMenus: async (params?: {
    page?: number
    limit?: number
    type?: string
    keyword?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<MenuListResponse> => {
    const response = await api.get('/menus', { params })
    return response as unknown as MenuListResponse
  },

  // 获取单个菜单
  getMenu: async (slug: string): Promise<MenuResponse> => {
    const response = await api.get(`/menus/${slug}`)
    return response as unknown as MenuResponse
  },

  // 获取指定类型的菜单
  getMenusByType: async (type: string): Promise<MenuListResponse> => {
    const response = await api.get(`/menus/type/${type}`)
    return response as unknown as MenuListResponse
  }
}
