import api from './api'

// 素材相关API
export const materialsApi = {
  // 获取素材列表
  getMaterials: (params?: {
    page?: number
    limit?: number
    keyword?: string
    type?: 'image' | 'video' | 'document'
    category?: 'product' | 'background' | 'logo' | 'other'
  }) => {
    return api.get('/materials', { params })
  },

  // 获取单个素材
  getMaterial: (id: string) => {
    return api.get(`/materials/${id}`)
  },

  // 获取特定类型的素材（用于官网）
  getMaterialsByCategory: (category: 'logo' | 'background') => {
    return api.get('/materials', {
      params: {
        category,
        type: 'image',
        limit: 10
      }
    })
  },

  // 获取Logo素材
  getLogos: () => {
    return materialsApi.getMaterialsByCategory('logo')
  },

  // 获取背景素材
  getBackgrounds: () => {
    return materialsApi.getMaterialsByCategory('background')
  }
}

export default materialsApi
