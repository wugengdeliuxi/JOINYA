import api from './api'
import type { ApiResponse } from '@/types'

// 定义Hero素材类型
export interface HeroMaterial {
  _id: string
  name: string
  type: 'image' | 'video' | 'document'
  category: 'hero'
  url: string
  thumbnail?: string
  description: string
  tags: string[]
  viewCount: number
  downloadCount: number
  createdAt: string
  updatedAt: string
}

export interface HeroListResponse {
  success: boolean
  data: HeroMaterial[]
}

export const heroesApi = {
  // 获取Hero素材列表
  getHeroes: async (): Promise<HeroListResponse> => {
    const response = await api.get('/materials/heroes')
    return response as unknown as HeroListResponse
  }
}
