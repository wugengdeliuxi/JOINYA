<template>
  <div class="menus-page">
    <div class="page-header">
      <h2>菜单管理</h2>
      <el-button type="primary" @click="handleCreateMenu">
        <el-icon><Plus /></el-icon>
        创建菜单
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="searchForm.keyword" placeholder="搜索菜单名称" clearable @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.type" placeholder="菜单类型" clearable>
            <el-option label="公路车" value="road-bikes" />
            <el-option label="砾石车" value="gravel-bikes" />
            <el-option label="山地车" value="mountain-bikes" />
            <el-option label="电动自行车" value="e-bikes" />
            <el-option label="装备" value="gear" />
            <el-option label="服务" value="service" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.isActive" placeholder="状态" clearable>
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 菜单列表 -->
    <div class="menus-table">
      <el-table :data="menus" v-loading="loading" stripe>
        <el-table-column prop="name" label="菜单名称" min-width="120" />
        <el-table-column prop="slug" label="URL标识" min-width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content.zh.title" label="中文标题" min-width="150" />
        <el-table-column prop="content.en.title" label="英文标题" min-width="150" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="查看次数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editMenu(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteMenu(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建/编辑菜单对话框 -->
    <el-dialog v-model="showCreateDialog" :title="editingMenu ? '编辑菜单' : '创建菜单'" width="80%" :close-on-click-modal="false">
      <el-form ref="menuFormRef" :model="menuForm" :rules="menuRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="URL标识" prop="slug">
              <el-input v-model="menuForm.slug" placeholder="请输入URL标识（如：road-bikes）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-select v-model="menuForm.type" placeholder="请选择菜单类型">
                <el-option label="公路车" value="road-bikes" />
                <el-option label="砾石车" value="gravel-bikes" />
                <el-option label="山地车" value="mountain-bikes" />
                <el-option label="电动自行车" value="e-bikes" />
                <el-option label="装备" value="gear" />
                <el-option label="服务" value="service" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="menuForm.sortOrder" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图片">
          <el-input v-model="menuForm.coverImage" placeholder="请输入封面图片URL（可选）" />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="menuForm.tags" multiple filterable allow-create placeholder="请输入标签">
            <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="menuForm.isActive" />
        </el-form-item>

        <!-- 中文内容 -->
        <el-divider content-position="left">中文内容</el-divider>
        <el-form-item label="中文标题" prop="content.zh.title">
          <el-input v-model="menuForm.content.zh.title" placeholder="请输入中文标题" />
        </el-form-item>
        <el-form-item label="中文描述" prop="content.zh.description">
          <el-input v-model="menuForm.content.zh.description" type="textarea" :rows="3" placeholder="请输入中文描述" />
        </el-form-item>
        <el-form-item label="中文内容" prop="content.zh.body">
          <div class="rich-editor">
            <div ref="zhEditorRef" style="height: 300px"></div>
          </div>
        </el-form-item>
        <el-form-item label="SEO标题" prop="content.zh.metaTitle">
          <el-input v-model="menuForm.content.zh.metaTitle" placeholder="请输入SEO标题" />
        </el-form-item>
        <el-form-item label="SEO描述" prop="content.zh.metaDescription">
          <el-input v-model="menuForm.content.zh.metaDescription" type="textarea" :rows="2" placeholder="请输入SEO描述" />
        </el-form-item>

        <!-- 英文内容 -->
        <el-divider content-position="left">英文内容</el-divider>
        <el-form-item label="英文标题" prop="content.en.title">
          <el-input v-model="menuForm.content.en.title" placeholder="请输入英文标题" />
        </el-form-item>
        <el-form-item label="英文描述" prop="content.en.description">
          <el-input v-model="menuForm.content.en.description" type="textarea" :rows="3" placeholder="请输入英文描述" />
        </el-form-item>
        <el-form-item label="英文内容" prop="content.en.body">
          <div class="rich-editor">
            <div ref="enEditorRef" style="height: 300px"></div>
          </div>
        </el-form-item>
        <el-form-item label="SEO标题" prop="content.en.metaTitle">
          <el-input v-model="menuForm.content.en.metaTitle" placeholder="请输入SEO标题" />
        </el-form-item>
        <el-form-item label="SEO描述" prop="content.en.metaDescription">
          <el-input v-model="menuForm.content.en.metaDescription" type="textarea" :rows="2" placeholder="请输入SEO描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveMenu" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { apiClient } from '@/api'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const menus = ref<any[]>([])
const showCreateDialog = ref(false)
const editingMenu = ref<any>(null)
const menuFormRef = ref()
const zhEditorRef = ref()
const enEditorRef = ref()
let zhEditor: Quill | null = null
let enEditor: Quill | null = null

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  isActive: null
})

// 分页信息
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 菜单表单
const menuForm = reactive({
  name: '',
  slug: '',
  type: '',
  sortOrder: 0,
  isActive: true,
  coverImage: '',
  tags: [],
  content: {
    zh: {
      title: '',
      description: '',
      body: '',
      metaTitle: '',
      metaDescription: ''
    },
    en: {
      title: '',
      description: '',
      body: '',
      metaTitle: '',
      metaDescription: ''
    }
  }
})

// 表单验证规则
const menuRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入URL标识', trigger: 'blur' }],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  'content.zh.title': [{ required: true, message: '请输入中文标题', trigger: 'blur' }],
  'content.zh.body': [{ required: true, message: '请输入中文内容', trigger: 'blur' }],
  'content.en.title': [{ required: true, message: '请输入英文标题', trigger: 'blur' }],
  'content.en.body': [{ required: true, message: '请输入英文内容', trigger: 'blur' }]
}

// 常用标签
const commonTags = ref(['公路车', '砾石车', '山地车', '电动自行车', '装备', '服务', '高性能', '轻量化', '舒适性', '耐用性', '创新技术'])

// 获取菜单列表
const fetchMenus = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }

    const response = (await apiClient.get('/menus', params)) as any
    if (response.success) {
      menus.value = response.data as any[]
      pagination.total = response.pagination?.total || 0
    }
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchMenus()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.isActive = null
  pagination.page = 1
  fetchMenus()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchMenus()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchMenus()
}

// 初始化富文本编辑器
const initEditors = async () => {
  await nextTick()

  // 如果编辑器已存在，先销毁
  if (zhEditor) {
    zhEditor = null
  }
  if (enEditor) {
    enEditor = null
  }

  // 清空编辑器容器（包括工具栏）
  if (zhEditorRef.value) {
    zhEditorRef.value.innerHTML = ''
  }
  if (enEditorRef.value) {
    enEditorRef.value.innerHTML = ''
  }

  // 重新初始化编辑器
  if (zhEditorRef.value) {
    zhEditor = new Quill(zhEditorRef.value, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            image: function () {
              const input = document.createElement('input')
              input.setAttribute('type', 'file')
              input.setAttribute('accept', 'image/*')
              input.click()

              input.onchange = () => {
                const file = input.files?.[0]
                if (file) {
                  // 创建FileReader来读取文件
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const result = e.target?.result as string
                    if (result) {
                      // 获取当前光标位置
                      const range = zhEditor?.getSelection()
                      if (range) {
                        // 插入图片
                        zhEditor?.insertEmbed(range.index, 'image', result)
                        // 移动光标到图片后面
                        zhEditor?.setSelection(range.index + 1)
                      }
                    }
                  }
                  reader.readAsDataURL(file)
                }
              }
            }
          }
        }
      }
    })

    zhEditor.on('text-change', () => {
      menuForm.content.zh.body = zhEditor?.root.innerHTML || ''
    })
  }

  if (enEditorRef.value) {
    enEditor = new Quill(enEditorRef.value, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            image: function () {
              const input = document.createElement('input')
              input.setAttribute('type', 'file')
              input.setAttribute('accept', 'image/*')
              input.click()

              input.onchange = () => {
                const file = input.files?.[0]
                if (file) {
                  // 创建FileReader来读取文件
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    const result = e.target?.result as string
                    if (result) {
                      // 获取当前光标位置
                      const range = enEditor?.getSelection()
                      if (range) {
                        // 插入图片
                        enEditor?.insertEmbed(range.index, 'image', result)
                        // 移动光标到图片后面
                        enEditor?.setSelection(range.index + 1)
                      }
                    }
                  }
                  reader.readAsDataURL(file)
                }
              }
            }
          }
        }
      }
    })

    enEditor.on('text-change', () => {
      menuForm.content.en.body = enEditor?.root.innerHTML || ''
    })
  }
}

// 编辑菜单
const editMenu = async (menu: any) => {
  editingMenu.value = menu

  // 填充表单数据
  Object.assign(menuForm, {
    name: menu.name,
    slug: menu.slug,
    type: menu.type,
    sortOrder: menu.sortOrder,
    isActive: menu.isActive,
    coverImage: menu.coverImage || '',
    tags: menu.tags || [],
    content: {
      zh: {
        title: menu.content.zh.title,
        description: menu.content.zh.description || '',
        body: menu.content.zh.body,
        metaTitle: menu.content.zh.metaTitle || '',
        metaDescription: menu.content.zh.metaDescription || ''
      },
      en: {
        title: menu.content.en.title,
        description: menu.content.en.description || '',
        body: menu.content.en.body,
        metaTitle: menu.content.en.metaTitle || '',
        metaDescription: menu.content.en.metaDescription || ''
      }
    }
  })

  showCreateDialog.value = true

  // 等待编辑器初始化后再设置内容
  await nextTick()
  await initEditors()

  // 等待编辑器完全初始化后再设置内容
  setTimeout(() => {
    if (zhEditor) {
      zhEditor.root.innerHTML = menuForm.content.zh.body
    }
    if (enEditor) {
      enEditor.root.innerHTML = menuForm.content.en.body
    }
  }, 100)
}

// 保存菜单
const saveMenu = async () => {
  try {
    await menuFormRef.value.validate()

    saving.value = true

    const data = {
      ...menuForm,
      content: {
        zh: {
          ...menuForm.content.zh,
          body: zhEditor?.root.innerHTML || menuForm.content.zh.body
        },
        en: {
          ...menuForm.content.en,
          body: enEditor?.root.innerHTML || menuForm.content.en.body
        }
      }
    }

    let response
    if (editingMenu.value) {
      response = await apiClient.put(`/menus/${(editingMenu.value as any)._id}`, data)
    } else {
      response = await apiClient.post('/menus', data)
    }

    if (response.success) {
      ElMessage.success(editingMenu.value ? '菜单更新成功' : '菜单创建成功')
      showCreateDialog.value = false
      resetForm()
      fetchMenus()
    }
  } catch (error) {
    console.error('保存菜单失败:', error)
    ElMessage.error('保存菜单失败')
  } finally {
    saving.value = false
  }
}

// 删除菜单
const deleteMenu = async (menu: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个菜单吗？', '确认删除', {
      type: 'warning'
    })

    const response = await apiClient.delete(`/menus/${menu._id}`)
    if (response.success) {
      ElMessage.success('菜单删除成功')
      fetchMenus()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除菜单失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  editingMenu.value = null
  Object.assign(menuForm, {
    name: '',
    slug: '',
    type: '',
    sortOrder: 0,
    isActive: true,
    coverImage: '',
    tags: [],
    content: {
      zh: {
        title: '',
        description: '',
        body: '',
        metaTitle: '',
        metaDescription: ''
      },
      en: {
        title: '',
        description: '',
        body: '',
        metaTitle: '',
        metaDescription: ''
      }
    }
  })

  if (zhEditor) {
    zhEditor.root.innerHTML = ''
  }
  if (enEditor) {
    enEditor.root.innerHTML = ''
  }
}

// 获取类型标签样式
const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    'road-bikes': 'primary',
    'gravel-bikes': 'success',
    'mountain-bikes': 'warning',
    'e-bikes': 'info',
    gear: 'danger',
    service: '',
    custom: 'info'
  }
  return typeMap[type] || ''
}

// 获取类型标签文本
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'road-bikes': '公路车',
    'gravel-bikes': '砾石车',
    'mountain-bikes': '山地车',
    'e-bikes': '电动自行车',
    gear: '装备',
    service: '服务',
    custom: '自定义'
  }
  return typeMap[type] || type
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 创建菜单
const handleCreateMenu = async () => {
  resetForm()
  showCreateDialog.value = true
  // 编辑器会在 watch 中自动初始化
}

// 监听对话框显示状态
const handleDialogOpen = () => {
  if (showCreateDialog.value) {
    initEditors()
  }
}

// 监听对话框显示状态
watch(showCreateDialog, async (newVal) => {
  if (newVal) {
    await nextTick()
    await initEditors()
  }
})

// 组件挂载
onMounted(() => {
  fetchMenus()
})
</script>

<style scoped>
.menus-page {
  padding: 20px;
}

/* 富文本编辑器样式优化 */
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.rich-editor :deep(.ql-toolbar) {
  border-bottom: 1px solid #dcdfe6;
  background: #fafafa;
}

.rich-editor :deep(.ql-container) {
  border: none;
  font-size: 14px;
}

/* 颜色选择器样式优化 */
.rich-editor :deep(.ql-color .ql-picker-options),
.rich-editor :deep(.ql-background .ql-picker-options) {
  z-index: 9999;
  position: absolute;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.rich-editor :deep(.ql-color .ql-picker-item),
.rich-editor :deep(.ql-background .ql-picker-item) {
  width: 20px;
  height: 20px;
  margin: 2px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
}

/* 图片上传样式 */
.rich-editor :deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.menus-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.rich-editor :deep(.ql-toolbar) {
  border-top: none;
  border-left: none;
  border-right: none;
}

.rich-editor :deep(.ql-container) {
  border: none;
}
</style>
