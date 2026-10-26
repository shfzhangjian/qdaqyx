<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑隐患排查标准' : '新增隐患排查标准' }}</h2>
      <div class="header-actions">
        <el-button @click="handleBack">返回</el-button>
        <el-button type="success" @click="handleSubmit">保存</el-button>
      </div>
    </div>

    <!-- 表单内容 -->
    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="standard-form"
      >
        <el-divider content-position="left">基本信息</el-divider>
        
        <!-- 隐患排查内容 -->
        <el-form-item label="隐患排查内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="3"
            placeholder="请输入隐患排查内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">排查配置</el-divider>

        <!-- 排查方法 -->
        <el-form-item label="排查方法" prop="method">
          <el-select v-model="formData.method" placeholder="请选择排查方法" style="width: 100%">
            <el-option label="现场检查" value="site_inspection" />
            <el-option label="查阅记录" value="record_review" />
            <el-option label="应急演练" value="drill" />
            <el-option label="数据分析" value="data_analysis" />
            <el-option label="事件分析" value="incident_analysis" />
          </el-select>
        </el-form-item>

        <!-- 重要度 -->
        <el-form-item label="重要度" prop="importance">
          <el-radio-group v-model="formData.importance">
            <el-radio label="key">重点事项</el-radio>
            <el-radio label="normal">常规事项</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 标准状态 -->
        <el-form-item label="标准状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
            <el-radio label="pending">审批</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 排查岗位 -->
        <el-form-item label="排查岗位" prop="position">
          <el-select v-model="formData.position" placeholder="请选择排查岗位" style="width: 100%">
            <el-option label="设备检修工" value="maintenance" />
            <el-option label="工程车运维" value="engineering" />
            <el-option label="站务员" value="station" />
            <el-option label="调度员" value="dispatcher" />
          </el-select>
        </el-form-item>

        <!-- 设备关联 -->
        <el-form-item label="设备关联" prop="equipmentLinked">
          <el-switch v-model="formData.equipmentLinked" active-text="关联" inactive-text="不关联" />
          <el-button v-if="formData.equipmentLinked" type="primary" size="small" style="margin-left: 16px">
            选择设备
          </el-button>
        </el-form-item>

        <!-- 标准添加人 -->
        <el-form-item label="标准添加人" prop="addUser">
          <el-input v-model="formData.addUser" placeholder="请输入添加人姓名" />
        </el-form-item>

        <!-- 默认登录人 -->
        <el-form-item label="默认登录人" prop="defaultUser">
          <el-input v-model="formData.defaultUser" placeholder="请输入默认登录人姓名" />
        </el-form-item>

        <!-- 排查周期 -->
        <el-form-item label="排查周期" prop="cycle">
          <el-select v-model="formData.cycle" placeholder="请选择排查周期" style="width: 100%">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="每季度" value="quarterly" />
            <el-option label="每年" value="yearly" />
          </el-select>
        </el-form-item>

        <!-- 作业关联 -->
        <el-form-item label="作业关联" prop="operationLinked">
          <el-switch v-model="formData.operationLinked" active-text="关联" inactive-text="不关联" />
          <el-button v-if="formData.operationLinked" type="primary" size="small" style="margin-left: 16px">
            选择作业
          </el-button>
        </el-form-item>

        <!-- 标准审核人 -->
        <el-form-item label="标准审核人" prop="auditUser">
          <el-input v-model="formData.auditUser" placeholder="请输入审核人姓名" />
        </el-form-item>

        <!-- 审批完成后反写 -->
        <el-form-item label="审批完成后反写" prop="auditWriteback">
          <el-switch v-model="formData.auditWriteback" active-text="是" inactive-text="否" />
        </el-form-item>

        <el-divider content-position="left">附件上传</el-divider>

        <!-- 附件上传 -->
        <el-form-item label="附件上传" prop="attachments">
          <el-upload
            class="upload-container"
            :action="uploadUrl"
            :file-list="formData.attachments"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            multiple
            :limit="10"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              点击上传
            </el-button>
            <template #tip>
              <div class="upload-tip">
                支持上传 PDF、Word、Excel、图片等格式，单个文件不超过 10MB，最多上传 10 个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-divider content-position="left">高级配置</el-divider>

        <!-- 是否筛选/查询 -->
        <el-form-item label="是否筛选/查询" prop="filterable">
          <el-switch v-model="formData.filterable" active-text="是" inactive-text="否" />
        </el-form-item>

        <!-- 是否排序 -->
        <el-form-item label="是否排序" prop="sortable">
          <el-switch v-model="formData.sortable" active-text="是" inactive-text="否" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 判断是否为编辑模式
const isEdit = computed(() => !!route.query.id)

// 表单引用
const formRef = ref(null)

// 上传地址
const uploadUrl = '/api/upload'

// 表单数据
const formData = reactive({
  content: '',
  method: '',
  importance: 'normal',
  status: 'pending',
  position: '',
  equipmentLinked: false,
  addUser: '',
  defaultUser: '',
  cycle: '',
  operationLinked: false,
  auditUser: '',
  auditWriteback: false,
  filterable: true,
  sortable: true,
  attachments: []
})

// 表单验证规则
const formRules = {
  content: [
    { required: true, message: '请输入隐患排查内容', trigger: 'blur' },
    { max: 500, message: '内容不能超过 500 个字', trigger: 'blur' }
  ],
  method: [
    { required: true, message: '请选择排查方法', trigger: 'change' }
  ],
  importance: [
    { required: true, message: '请选择重要度', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择标准状态', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择排查岗位', trigger: 'change' }
  ],
  cycle: [
    { required: true, message: '请选择排查周期', trigger: 'change' }
  ],
  addUser: [
    { required: true, message: '请输入标准添加人', trigger: 'blur' }
  ]
}

// 文件上传前处理
const handleBeforeUpload = (file) => {
  const fileSize = file.size / 1024 / 1024
  if (fileSize > 10) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

// 文件变化处理
const handleFileChange = (file, fileList) => {
  formData.attachments = fileList
}

// 文件移除处理
const handleFileRemove = (file, fileList) => {
  formData.attachments = fileList
}

// 上传成功处理
const handleUploadSuccess = (response, file, fileList) => {
  ElMessage.success('上传成功')
  formData.attachments = fileList
}

// 上传失败处理
const handleUploadError = () => {
  ElMessage.error('上传失败，请重试')
}

// 返回
const handleBack = () => {
  router.back()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交数据:', formData)
      ElMessage.success(isEdit.value ? '保存成功' : '新增成功')
      router.back()
      // TODO: 调用后端 API
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}

// 加载编辑数据
const loadEditData = () => {
  if (isEdit.value) {
    console.log('加载编辑数据，ID:', route.query.id)
    // TODO: 调用后端 API 获取数据
    // 模拟数据
    setTimeout(() => {
      Object.assign(formData, {
        content: '设备使用前后及修程内检查设备状态是否良好',
        method: 'site_inspection',
        importance: 'key',
        status: 'active',
        position: 'maintenance',
        equipmentLinked: true,
        addUser: '张三',
        defaultUser: '张三',
        cycle: 'monthly',
        operationLinked: true,
        auditUser: '李四',
        auditWriteback: true,
        filterable: true,
        sortable: true,
        attachments: []
      })
    }, 500)
  }
}

// 初始化
loadEditData()
</script>

<style lang="scss" scoped>
.page-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .form-card {
    .standard-form {
      max-width: 800px;
      margin: 0 auto;

      .el-divider {
        margin: $spacing-lg 0;
        background-color: $primary-light;
        
        :deep(.el-divider__text) {
          font-weight: 600;
          color: $primary-color;
        }
      }

      .upload-container {
        width: 100%;

        .upload-tip {
          color: $text-secondary;
          font-size: 12px;
          margin-top: $spacing-xs;
        }
      }
    }
  }
}
</style>
