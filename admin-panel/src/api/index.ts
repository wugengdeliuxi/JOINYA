import axios from 'axios'
import type { ApiResponse, PaginatedResponse } from '@/types'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api'  // 使用同域名代理
    : 'http://localhost:3002/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 对于文件上传，需要检查响应状态
    if (response.status >= 200 && response.status < 300) {
      return response.data
    }
    return Promise.reject(new Error('请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// 通用API方法
export const apiClient = {
  get: <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    return api.get(url, { params })
  },
  
  getPaginated: <T>(url: string, params?: any): Promise<PaginatedResponse<T>> => {
    return api.get(url, { params })
  },
  
  post: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    // 如果是FormData，不设置Content-Type，让axios自动处理
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': undefined
      }
    } : {}
    return api.post(url, data, config)
  },
  
  put: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return api.put(url, data)
  },
  
  delete: <T>(url: string): Promise<ApiResponse<T>> => {
    return api.delete(url)
  },
  
  upload: <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  }
}

export default api
