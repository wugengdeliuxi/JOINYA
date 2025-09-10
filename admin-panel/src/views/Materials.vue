<template>
  <div class="materials-page">
    <div class="page-header">
      <h2>素材管理</h2>
      <el-button type="primary" @click="showUploadDialog = true">
        <el-icon><Upload /></el-icon>
        上传素材
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="searchForm.keyword" placeholder="搜索素材名称" clearable @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.type" placeholder="素材类型" clearable>
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="文档" value="document" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.category" placeholder="分类" clearable>
            <el-option label="产品图" value="product" />
            <el-option label="背景图" value="background" />
            <el-option label="Logo" value="logo" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 素材列表 -->
    <div class="materials-grid">
      <el-row :gutter="20">
        <el-col v-for="material in materials" :key="material.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <div class="material-card">
            <div class="material-preview">
              <img v-if="material.type === 'image'" :src="material.url" :alt="material.name" @click="previewMaterial(material)" />
              <video v-else-if="material.type === 'video'" :src="material.url" controls @click="previewMaterial(material)" />
              <div v-else class="document-preview">
                <el-icon size="48"><Document /></el-icon>
                <span>{{ material.name }}</span>
              </div>
            </div>

            <div class="material-info">
              <h4>{{ material.name }}</h4>
              <p class="material-meta">
                <el-tag size="small" :type="getTypeTagType(material.type)">
                  {{ getTypeLabel(material.type) }}
                </el-tag>
                <span class="size">{{ formatFileSize(material.size) }}</span>
              </p>
              <p class="material-description">{{ material.description || '暂无描述' }}</p>

              <div class="material-actions">
                <el-button size="small" @click="copyUrl(material.url)">
                  <el-icon><Link /></el-icon>
                  复制链接
                </el-button>
                <el-button size="small" type="danger" @click="deleteMaterial(material.id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传素材" width="500px" @close="resetUploadForm">
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="80px">
        <el-form-item label="素材名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入素材名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="uploadForm.category" placeholder="选择分类">
            <el-option label="产品图" value="product" />
            <el-option label="背景图" value="background" />
            <el-option label="Logo" value="logo" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="请输入素材描述" />
        </el-form-item>

        <el-form-item label="标签">
          <el-input v-model="uploadForm.tags" placeholder="请输入标签，用逗号分隔" />
        </el-form-item>

        <el-form-item label="文件" prop="file">
          <el-upload ref="uploadRef" :auto-upload="false" :on-change="handleFileChange" :limit="1" accept="image/*,video/*,.pdf,.doc,.docx">
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持图片、视频、文档格式，文件大小不超过50MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" :loading="uploading" @click="handleUpload"> 上传 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, UploadFile } from 'element-plus'
import { apiClient } from '@/api'
import type { Material, Pagination, SearchFilters } from '@/types'

// 响应式数据
const materials = ref<Material[]>([])
const showUploadDialog = ref(false)
const uploading = ref(false)
const uploadFormRef = ref<FormInstance>()
const uploadRef = ref()

const pagination = reactive<Pagination>({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0
})

const searchForm = reactive<SearchFilters>({
  keyword: '',
  type: '',
  category: ''
})

const uploadForm = reactive({
  name: '',
  category: '',
  description: '',
  tags: '',
  file: null as File | null
})

const uploadRules = {
  name: [{ required: true, message: '请输入素材名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  file: [{ required: true, message: '请选择文件', trigger: 'change' }]
}

// 获取素材列表
const fetchMaterials = async () => {
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }

    const response = await apiClient.getPaginated<Material>('/materials', params)

    if (response.success) {
      materials.value = response.data || []
      // 直接访问分页信息
      pagination.total = response.pagination?.total || 0
      pagination.totalPages = response.pagination?.totalPages || 0
    }
  } catch (error: any) {
    ElMessage.error('获取素材列表失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchMaterials()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    type: '',
    category: ''
  })
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchMaterials()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchMaterials()
}

// 文件上传
const handleFileChange = (file: UploadFile) => {
  uploadForm.file = file.raw || null
}

const handleUpload = async () => {
  if (!uploadFormRef.value || !uploadForm.file) return

  try {
    await uploadFormRef.value.validate()
    uploading.value = true

    // 调试信息
    console.log('上传文件信息:', uploadForm.file)
    console.log('文件类型:', uploadForm.file?.type)
    console.log('文件大小:', uploadForm.file?.size)

    const formData = new FormData()
    formData.append('file', uploadForm.file)
    formData.append('name', uploadForm.name)
    formData.append('category', uploadForm.category)
    formData.append('description', uploadForm.description)
    formData.append('tags', uploadForm.tags)

    // 调试FormData
    console.log('FormData内容:')
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value)
    }

    const response = await apiClient.post<Material>('/materials/upload', formData)

    if (response.success) {
      ElMessage.success('上传成功')
      showUploadDialog.value = false
      fetchMaterials()
    } else {
      ElMessage.error(response.message || '上传失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 删除素材
const deleteMaterial = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个素材吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await apiClient.delete(`/materials/${id}`)

    if (response.success) {
      ElMessage.success('删除成功')
      fetchMaterials()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 复制链接
const copyUrl = (url: string) => {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

// 预览素材
const previewMaterial = (material: Material) => {
  // 这里可以实现预览功能
  console.log('预览素材:', material)
}

// 重置上传表单
const resetUploadForm = () => {
  Object.assign(uploadForm, {
    name: '',
    category: '',
    description: '',
    tags: '',
    file: null
  })
  uploadRef.value?.clearFiles()
}

// 工具函数
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    image: '图片',
    video: '视频',
    document: '文档'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    image: 'success',
    video: 'warning',
    document: 'info'
  }
  return typeMap[type] || 'info'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 初始化
onMounted(() => {
  fetchMaterials()
})
</script>

<style scoped>
.materials-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.search-bar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.materials-grid {
  margin-bottom: 20px;
}

.material-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.material-preview {
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.material-preview img,
.material-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.document-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
}

.material-info {
  padding: 15px;
}

.material-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.size {
  font-size: 12px;
  color: #666;
}

.material-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-actions {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
