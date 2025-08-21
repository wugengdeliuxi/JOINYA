import axios from 'axios'
import type { ApiResponse } from '@/types'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 通用API方法
export const apiClient = {
  get: <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    return api.get(url, { params })
  },
  
  post: <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return api.post(url, data)
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
