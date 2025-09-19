// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar?: string
  createdAt: string
  updatedAt: string
}

// 素材相关类型
export interface Material {
  _id: string
  name: string
  type: 'image' | 'video' | 'document'
  category: string
  url: string
  thumbnail?: string
  size: number
  mimeType: string
  description?: string
  tags: string[]
  uploadedBy: string
  createdAt: string
  updatedAt: string
  // Cloudinary相关字段
  cloudinaryPublicId?: string
  cloudinaryVersion?: string
  cloudinarySignature?: string
  // 下载相关
  downloadUrl?: string
  thumbnailUrl?: string
}

// 产品相关类型
export interface Product {
  id: string
  name: string
  category: 'road' | 'mountain' | 'gravel' | 'ebike' | 'gear'
  price: number
  originalPrice?: number
  description: string
  features: string[]
  specifications: Record<string, string>
  images: string[]
  mainImage: string
  inStock: boolean
  createdAt: string
  updatedAt: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination
}

// 登录相关类型
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 文件上传类型
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// 搜索和筛选类型
export interface SearchFilters {
  keyword?: string
  category?: string
  type?: string
  dateRange?: [string, string]
  tags?: string[]
}
