import { supabase } from '../lib/supabase.js'

export class Material {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.type = data.type
    this.category = data.category
    this.url = data.url
    this.thumbnail = data.thumbnail
    this.cloudinary_public_id = data.cloudinary_public_id
    this.cloudinary_version = data.cloudinary_version
    this.cloudinary_signature = data.cloudinary_signature
    this.size = data.size
    this.mime_type = data.mime_type
    this.description = data.description
    this.tags = data.tags || []
    this.uploaded_by = data.uploaded_by
    this.is_public = data.is_public
    this.download_count = data.download_count
    this.view_count = data.view_count
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  // 创建素材
  static async create(materialData) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select()
        .single()

      if (error) throw error
      return new Material(data)
    } catch (error) {
      throw new Error(`创建素材失败: ${error.message}`)
    }
  }

  // 根据ID查找素材
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          uploaded_by:users(username)
        `)
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? new Material(data) : null
    } catch (error) {
      throw new Error(`查找素材失败: ${error.message}`)
    }
  }

  // 获取素材列表
  static async findMany(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 12, 
        keyword, 
        type, 
        category 
      } = options
      const offset = (page - 1) * limit

      let query = supabase
        .from('materials')
        .select(`
          *,
          uploaded_by:users(username)
        `, { count: 'exact' })
        .eq('is_public', true)

      if (keyword) {
        query = query.textSearch('name,description', keyword)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        data: data.map(material => new Material(material)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    } catch (error) {
      throw new Error(`获取素材列表失败: ${error.message}`)
    }
  }

  // 更新素材
  async update(updateData) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single()

      if (error) throw error
      
      // 更新当前实例
      Object.assign(this, data)
      return this
    } catch (error) {
      throw new Error(`更新素材失败: ${error.message}`)
    }
  }

  // 删除素材
  async delete() {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', this.id)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(`删除素材失败: ${error.message}`)
    }
  }

  // 增加查看次数
  async incrementViewCount() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({ view_count: this.view_count + 1 })
        .eq('id', this.id)
        .select()
        .single()

      if (error) throw error
      this.view_count = data.view_count
      return this
    } catch (error) {
      throw new Error(`更新查看次数失败: ${error.message}`)
    }
  }

  // 增加下载次数
  async incrementDownloadCount() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({ download_count: this.download_count + 1 })
        .eq('id', this.id)
        .select()
        .single()

      if (error) throw error
      this.download_count = data.download_count
      return this
    } catch (error) {
      throw new Error(`更新下载次数失败: ${error.message}`)
    }
  }

  // 获取Hero素材
  static async getHeroes() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('category', 'hero')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(material => new Material(material))
    } catch (error) {
      throw new Error(`获取Hero素材失败: ${error.message}`)
    }
  }

  // 获取Logo素材
  static async getLogos() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('category', 'logo')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(material => new Material(material))
    } catch (error) {
      throw new Error(`获取Logo素材失败: ${error.message}`)
    }
  }

  // 格式化文件大小
  get formattedSize() {
    const bytes = this.size
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 转换为JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: this.category,
      url: this.url,
      thumbnail: this.thumbnail,
      size: this.size,
      formattedSize: this.formattedSize,
      mime_type: this.mime_type,
      description: this.description,
      tags: this.tags,
      uploaded_by: this.uploaded_by,
      is_public: this.is_public,
      download_count: this.download_count,
      view_count: this.view_count,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}