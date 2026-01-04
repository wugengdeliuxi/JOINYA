import { supabase, supabaseAdmin } from '../lib/supabase.js'

export class Menu {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.slug = data.slug
    this.type = data.type
    this.content = data.content
    this.cover_image = data.cover_image
    this.tags = data.tags || []
    this.sort_order = data.sort_order
    this.is_active = data.is_active
    this.view_count = data.view_count
    this.created_by = data.created_by
    this.updated_by = data.updated_by
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  // 创建菜单
  // 使用服务角色客户端绕过 RLS 策略
  static async create(menuData) {
    try {
      const { data, error } = await supabaseAdmin
        .from('menus')
        .insert([menuData])
        .select()
        .single()

      if (error) throw error
      return new Menu(data)
    } catch (error) {
      throw new Error(`创建菜单失败: ${error.message}`)
    }
  }

  // 根据ID查找菜单
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select(`
          *,
          created_by:users(username),
          updated_by:users(username)
        `)
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? new Menu(data) : null
    } catch (error) {
      throw new Error(`查找菜单失败: ${error.message}`)
    }
  }

  // 根据slug查找菜单
  static async findBySlug(slug) {
    try {
      // 使用服务角色客户端
      // 暂时不关联 users 表，避免关系冲突
      const { data, error } = await supabaseAdmin
        .from('menus')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? new Menu(data) : null
    } catch (error) {
      throw new Error(`查找菜单失败: ${error.message}`)
    }
  }

  // 获取菜单列表
  static async findMany(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        keyword, 
        type, 
        isActive 
      } = options
      const offset = (page - 1) * limit

      // 使用服务角色客户端绕过 RLS
      // 暂时不关联 users 表，避免关系冲突
      let query = supabaseAdmin
        .from('menus')
        .select('*', { count: 'exact' })

      if (keyword) {
        query = query.or(`name.ilike.%${keyword}%,slug.ilike.%${keyword}%`)
      }

      if (type) {
        query = query.eq('type', type)
      }

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive)
      }

      const { data, error, count } = await query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        data: data.map(menu => new Menu(menu)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    } catch (error) {
      throw new Error(`获取菜单列表失败: ${error.message}`)
    }
  }

  // 根据类型获取菜单
  static async findByType(type) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data.map(menu => new Menu(menu))
    } catch (error) {
      throw new Error(`获取菜单失败: ${error.message}`)
    }
  }

  // 更新菜单
  async update(updateData) {
    try {
      const { data, error } = await supabase
        .from('menus')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single()

      if (error) throw error
      
      // 更新当前实例
      Object.assign(this, data)
      return this
    } catch (error) {
      throw new Error(`更新菜单失败: ${error.message}`)
    }
  }

  // 删除菜单
  async delete() {
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', this.id)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(`删除菜单失败: ${error.message}`)
    }
  }

  // 增加查看次数
  async incrementViewCount() {
    try {
      const { data, error } = await supabase
        .from('menus')
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

  // 批量更新排序
  static async updateSortOrder(menus) {
    try {
      const updates = menus.map(menu => ({
        id: menu.id,
        sort_order: menu.sort_order
      }))

      const { error } = await supabase
        .from('menus')
        .upsert(updates)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(`更新排序失败: ${error.message}`)
    }
  }

  // 转换为JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      type: this.type,
      content: this.content,
      cover_image: this.cover_image,
      tags: this.tags,
      sort_order: this.sort_order,
      is_active: this.is_active,
      view_count: this.view_count,
      created_by: this.created_by,
      updated_by: this.updated_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}