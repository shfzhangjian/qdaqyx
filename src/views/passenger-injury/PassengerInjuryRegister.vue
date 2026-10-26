<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">客伤信息登记管理</h2>
    </div>

    <el-card>
      <!-- 搜索表单 -->
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="关键字">
              <el-input v-model="searchForm.keyword" placeholder="姓名 / 记录编号 / 发生地点" clearable @keyup.enter="handleSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属中心">
              <el-select v-model="searchForm.center" placeholder="请选择" clearable style="width: 100%">
                <el-option v-for="c in centerDict" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属线路">
              <el-select v-model="searchForm.line" placeholder="请选择" clearable style="width: 100%">
                <el-option v-for="l in lineDict" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="发生时间">
              <el-date-picker
                v-model="searchForm.occurTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="审批状态">
              <el-select v-model="searchForm.approvalStatus" placeholder="请选择" clearable style="width: 100%">
                <el-option v-for="s in approvalStatusDict" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="success" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="success" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <div class="toolbar-tip">审批通过的记录将自动纳入「客伤信息台账」</div>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="paginatedData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="50" fixed />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="recordNo" label="记录编号" width="130" sortable />
        <el-table-column prop="name" label="姓名" width="90" sortable />
        <el-table-column prop="gender" label="性别" width="70" align="center" />
        <el-table-column prop="age" label="年龄" width="70" align="center" sortable />
        <el-table-column prop="location" label="发生地点" min-width="140" show-overflow-tooltip sortable />
        <el-table-column prop="occurTime" label="发生时间" width="130" sortable />
        <el-table-column prop="position" label="发生位置" width="90" align="center" />
        <el-table-column prop="weather" label="天气情况" width="90" align="center" />
        <el-table-column prop="center" label="所属中心" width="110" align="center" sortable />
        <el-table-column prop="line" label="所属线路" width="90" align="center" sortable />
        <el-table-column prop="bodyPart" label="受伤部位" width="90" align="center" />
        <el-table-column prop="approvalStatus" label="审批状态" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag :type="getApprovalTagType(row.approvalStatus)">{{ row.approvalStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="warning" size="small" :disabled="row.approvalStatus !== '待审批'" @click="handleApprove(row)">审批</el-button>
            <el-dropdown style="margin-left: 8px" @command="(cmd) => handleMore(cmd, row)">
              <el-button size="small">更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit" :disabled="row.approvalStatus === '审批通过'">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <span>共 {{ filteredData.length }} 项数据</span>
        </div>
        <div class="pagination-right">
          <el-select v-model="pageSize" placeholder="每页条数" size="small" style="width: 100px">
            <el-option label="10 条/页" :value="10" />
            <el-option label="20 条/页" :value="20" />
            <el-option label="50 条/页" :value="50" />
          </el-select>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
          <span class="jump-text">跳至</span>
          <el-input-number v-model="jumpPage" :min="1" :max="totalPages" size="small" @change="handleJump" />
          <span class="jump-text">/ {{ totalPages }} 页</span>
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增客伤登记' : '编辑客伤登记'"
      width="760px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="记录编号" prop="recordNo">
              <el-input v-model="formData.recordNo" placeholder="自动生成" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="formData.gender" placeholder="请选择" style="width: 100%">
                <el-option v-for="g in genderDict" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="formData.age" :min="0" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="发生地点" prop="location">
              <el-input v-model="formData.location" placeholder="请输入发生地点" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发生时间" prop="occurTime">
              <el-date-picker
                v-model="formData.occurTime"
                type="datetime"
                placeholder="请选择发生时间"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="发生位置" prop="position">
              <el-select v-model="formData.position" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in positionDict" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="天气情况" prop="weather">
              <el-select v-model="formData.weather" placeholder="请选择" style="width: 100%">
                <el-option v-for="w in weatherDict" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属中心" prop="center">
              <el-select v-model="formData.center" placeholder="请选择" style="width: 100%">
                <el-option v-for="c in centerDict" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属线路" prop="line">
              <el-select v-model="formData.line" placeholder="请选择" style="width: 100%">
                <el-option v-for="l in lineDict" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="受伤部位" prop="bodyPart">
              <el-select v-model="formData.bodyPart" placeholder="请选择" style="width: 100%">
                <el-option v-for="b in bodyPartDict" :key="b" :label="b" :value="b" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否登记" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio value="是">是</el-radio>
                <el-radio value="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="事情经过" prop="incident">
          <el-input v-model="formData.incident" type="textarea" :rows="3" placeholder="请输入客伤事件经过" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="原因分析" prop="cause">
          <el-input v-model="formData.cause" type="textarea" :rows="3" placeholder="请输入客伤原因分析" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="success" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewVisible" title="客伤登记详情" width="720px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编号">{{ viewData.recordNo }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ viewData.gender }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ viewData.age }}</el-descriptions-item>
        <el-descriptions-item label="发生地点">{{ viewData.location }}</el-descriptions-item>
        <el-descriptions-item label="发生时间">{{ viewData.occurTime }}</el-descriptions-item>
        <el-descriptions-item label="发生位置">{{ viewData.position }}</el-descriptions-item>
        <el-descriptions-item label="天气情况">{{ viewData.weather }}</el-descriptions-item>
        <el-descriptions-item label="所属中心">{{ viewData.center }}</el-descriptions-item>
        <el-descriptions-item label="所属线路">{{ viewData.line }}</el-descriptions-item>
        <el-descriptions-item label="受伤部位">{{ viewData.bodyPart }}</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <el-tag :type="getApprovalTagType(viewData.approvalStatus)">{{ viewData.approvalStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="事情经过" :span="2">{{ viewData.incident }}</el-descriptions-item>
        <el-descriptions-item label="原因分析" :span="2">{{ viewData.cause }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog v-model="approveVisible" title="客伤登记审批" width="520px" destroy-on-close>
      <div class="approve-info">
        <p>记录编号：<b>{{ approveData.recordNo }}</b></p>
        <p>伤者姓名：<b>{{ approveData.name }}</b></p>
        <p>发生地点：<b>{{ approveData.location }}</b></p>
      </div>
      <el-form label-width="80px">
        <el-form-item label="审批结果">
          <el-radio-group v-model="approveForm.result">
            <el-radio value="审批通过">审批通过</el-radio>
            <el-radio value="已驳回">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审批意见" maxlength="300" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="success" @click="handleApproveSubmit">确认审批</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  injuryRecords, genRecordNo,
  genderDict, centerDict, lineDict, positionDict, weatherDict, bodyPartDict, approvalStatusDict
} from '@/stores/passengerInjury'

// ==================== 搜索 ====================
const searchForm = reactive({
  keyword: '',
  center: '',
  line: '',
  occurTime: '',
  approvalStatus: ''
})

const filteredData = computed(() => {
  let list = [...injuryRecords]
  if (searchForm.keyword) {
    const kw = searchForm.keyword.trim()
    list = list.filter(r =>
      r.name.includes(kw) || r.recordNo.includes(kw) || r.location.includes(kw)
    )
  }
  if (searchForm.center) list = list.filter(r => r.center === searchForm.center)
  if (searchForm.line) list = list.filter(r => r.line === searchForm.line)
  if (searchForm.approvalStatus) list = list.filter(r => r.approvalStatus === searchForm.approvalStatus)
  if (searchForm.occurTime && searchForm.occurTime.length === 2) {
    const [start, end] = searchForm.occurTime
    list = list.filter(r => {
      const d = r.occurTime.slice(0, 10)
      return d >= start && d <= end
    })
  }
  return list
})

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / pageSize.value)))
const jumpPage = ref(1)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const handleSearch = () => { currentPage.value = 1; ElMessage.success('查询完成') }
const handleReset = () => {
  Object.assign(searchForm, { keyword: '', center: '', line: '', occurTime: '', approvalStatus: '' })
  currentPage.value = 1
  handleSearch()
}
const handlePageChange = (page) => { currentPage.value = page }
const handleJump = () => { currentPage.value = jumpPage.value }

// ==================== 选择与批量操作 ====================
const selectedRows = ref([])
const handleSelectionChange = (selection) => { selectedRows.value = selection }
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      const idx = injuryRecords.findIndex(r => r.id === row.id)
      if (idx > -1) injuryRecords.splice(idx, 1)
    })
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleImport = () => ElMessage.info('导入功能开发中...')
const handleExport = () => ElMessage.info('导出功能开发中...')

// ==================== 新增 / 编辑 ====================
const dialogVisible = ref(false)
const dialogMode = ref('add')
const formRef = ref(null)
const formData = reactive({
  id: null, recordNo: '', name: '', gender: '', age: null,
  location: '', occurTime: '', position: '', weather: '',
  center: '', line: '', bodyPart: '', incident: '', cause: '', status: '是', approvalStatus: '待审批'
})

const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'change' }],
  location: [{ required: true, message: '请输入发生地点', trigger: 'blur' }],
  occurTime: [{ required: true, message: '请选择发生时间', trigger: 'change' }],
  position: [{ required: true, message: '请选择发生位置', trigger: 'change' }],
  center: [{ required: true, message: '请选择所属中心', trigger: 'change' }],
  line: [{ required: true, message: '请选择所属线路', trigger: 'change' }],
  bodyPart: [{ required: true, message: '请选择受伤部位', trigger: 'change' }],
  incident: [{ required: true, message: '请输入事情经过', trigger: 'blur' }],
  cause: [{ required: true, message: '请输入原因分析', trigger: 'blur' }]
}

const handleAdd = () => {
  dialogMode.value = 'add'
  Object.assign(formData, {
    id: null, recordNo: genRecordNo(), name: '', gender: '', age: null,
    location: '', occurTime: '', position: '', weather: '',
    center: '', line: '', bodyPart: '', incident: '', cause: '', status: '是', approvalStatus: '待审批'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该条登记记录吗？', '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = injuryRecords.findIndex(r => r.id === row.id)
    if (idx > -1) injuryRecords.splice(idx, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleMore = (cmd, row) => {
  if (cmd === 'edit') handleEdit(row)
  if (cmd === 'delete') handleDelete(row)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) { ElMessage.error('请完善必填信息'); return }
    if (dialogMode.value === 'add') {
      injuryRecords.unshift({ ...formData, id: Date.now() })
      ElMessage.success('新增成功')
    } else {
      const idx = injuryRecords.findIndex(r => r.id === formData.id)
      if (idx > -1) {
        // 编辑时若原记录已审批通过，保持审批状态不变
        const prevApproval = injuryRecords[idx].approvalStatus
        injuryRecords[idx] = { ...formData, approvalStatus: prevApproval }
      }
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false
  })
}

// ==================== 查看 ====================
const viewVisible = ref(false)
const viewData = reactive({})
const handleView = (row) => {
  Object.assign(viewData, { ...row })
  viewVisible.value = true
}

// ==================== 审批 ====================
const approveVisible = ref(false)
const approveData = reactive({})
const approveForm = reactive({ result: '审批通过', comment: '' })

const handleApprove = (row) => {
  Object.assign(approveData, { ...row })
  approveForm.result = '审批通过'
  approveForm.comment = ''
  approveVisible.value = true
}

const handleApproveSubmit = () => {
  const idx = injuryRecords.findIndex(r => r.id === approveData.id)
  if (idx > -1) {
    injuryRecords[idx].approvalStatus = approveForm.result
    injuryRecords[idx].approveComment = approveForm.comment
    ElMessage.success(approveForm.result === '审批通过' ? '审批通过，已纳入客伤台账' : '已驳回该记录')
  }
  approveVisible.value = false
}

// ==================== 工具 ====================
const getApprovalTagType = (s) => {
  if (s === '审批通过') return 'success'
  if (s === '待审批') return 'warning'
  if (s === '已驳回') return 'danger'
  return 'info'
}
</script>

<style lang="scss" scoped>
.page-container {
  .page-header {
    margin-bottom: $spacing-lg;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
    }
  }

  .search-form {
    margin-bottom: $spacing-md;

    .el-form-item {
      margin-bottom: $spacing-md;
      width: 100%;

      :deep(.el-form-item__label) {
        color: $text-regular;
      }
    }

    .el-button {
      margin-left: $spacing-sm;
    }
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;

    .toolbar-tip {
      margin-left: auto;
      font-size: 13px;
      color: $text-secondary;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $border-light;

    .pagination-left {
      color: $text-secondary;
      font-size: 14px;
    }

    .pagination-right {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .jump-text {
        color: $text-secondary;
        font-size: 14px;
      }
    }
  }

  .approve-info {
    padding: 12px 16px;
    margin-bottom: 16px;
    background: $content-bg;
    border-radius: $border-radius-md;

    p {
      margin: 6px 0;
      font-size: 14px;
      color: $text-regular;

      b {
        color: $text-primary;
      }
    }
  }
}
</style>
