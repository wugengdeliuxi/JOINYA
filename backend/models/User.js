import { supabase } from '../lib/supabase.js'
import bcrypt from 'bcryptjs'

export class User {
  constructor(data) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.password_hash = data.password_hash
    this.role = data.role
    this.is_active = data.is_active
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }

  // 创建用户
  static async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) throw error
      return new User(data)
    } catch (error) {
      throw new Error(`创建用户失败: ${error.message}`)
    }
  }

  // 根据用户名或邮箱查找用户
  static async findByUsernameOrEmail(identifier) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${identifier},email.eq.${identifier}`)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? new User(data) : null
    } catch (error) {
      throw new Error(`查找用户失败: ${error.message}`)
    }
  }

  // 根据ID查找用户
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? new User(data) : null
    } catch (error) {
      throw new Error(`查找用户失败: ${error.message}`)
    }
  }

  // 更新用户
  async update(updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single()

      if (error) throw error
      
      // 更新当前实例
      Object.assign(this, data)
      return this
    } catch (error) {
      throw new Error(`更新用户失败: ${error.message}`)
    }
  }

  // 删除用户
  async delete() {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', this.id)

      if (error) throw error
      return true
    } catch (error) {
      throw new Error(`删除用户失败: ${error.message}`)
    }
  }

  // 获取用户列表
  static async findMany(options = {}) {
    try {
      const { page = 1, limit = 10, search } = options
      const offset = (page - 1) * limit

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        data: data.map(user => new User(user)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    } catch (error) {
      throw new Error(`获取用户列表失败: ${error.message}`)
    }
  }

  // 验证密码
  async comparePassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash)
    } catch (error) {
      throw new Error(`密码验证失败: ${error.message}`)
    }
  }

  // 更新最后登录时间
  async updateLastLogin() {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', this.id)
        .select()
        .single()

      if (error) throw error
      return this
    } catch (error) {
      throw new Error(`更新最后登录时间失败: ${error.message}`)
    }
  }

  // 转换为JSON
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}