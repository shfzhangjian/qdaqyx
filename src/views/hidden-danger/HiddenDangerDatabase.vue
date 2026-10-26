<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">隐患排查标准库</h2>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="隐患排查内容">
              <el-input v-model="searchForm.content" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="排查方法">
              <el-select v-model="searchForm.method" placeholder="请选择" clearable style="width: 100%">
                <el-option label="现场检查" value="site_inspection" />
                <el-option label="查阅记录" value="record_review" />
                <el-option label="应急演练" value="drill" />
                <el-option label="数据分析" value="data_analysis" />
                <el-option label="事件分析" value="incident_analysis" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="排查周期">
              <el-select v-model="searchForm.cycle" placeholder="请选择" clearable style="width: 100%">
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="每季度" value="quarterly" />
                <el-option label="每年" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="排查岗位">
              <el-select v-model="searchForm.position" placeholder="请选择" clearable style="width: 100%">
                <el-option label="设备检修工" value="maintenance" />
                <el-option label="工程车运维" value="engineering" />
                <el-option label="站务员" value="station" />
                <el-option label="调度员" value="dispatcher" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="作业关联">
              <el-select v-model="searchForm.operation" placeholder="请选择" clearable style="width: 100%">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="设备关联">
              <el-select v-model="searchForm.equipment" placeholder="请选择" clearable style="width: 100%">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="重要度">
              <el-select v-model="searchForm.importance" placeholder="请选择" clearable style="width: 100%">
                <el-option label="重点事项" value="key" />
                <el-option label="常规事项" value="normal" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标准状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 100%">
                <el-option label="启用" value="active" />
                <el-option label="停用" value="inactive" />
                <el-option label="审批" value="pending" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="标准添加人">
              <el-input v-model="searchForm.addUser" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="标准审核人">
              <el-input v-model="searchForm.auditUser" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否筛选/查询">
              <el-select v-model="searchForm.filterable" placeholder="请选择" clearable style="width: 100%">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否排序">
              <el-select v-model="searchForm.sortable" placeholder="请选择" clearable style="width: 100%">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
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
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="toolbar-card">
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
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="content" label="隐患排查内容" min-width="200" show-overflow-tooltip sortable />
        <el-table-column prop="method" label="排查方法" width="120" sortable>
          <template #default="{ row }">
            <span>{{ formatMethod(row.method) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cycle" label="排查周期" width="100" sortable>
          <template #default="{ row }">
            <span>{{ formatCycle(row.cycle) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="排查岗位" width="120" sortable />
        <el-table-column prop="operationLinked" label="作业关联" width="90" align="center" sortable>
          <template #default="{ row }">
            <el-tag v-if="row.operationLinked" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="equipmentLinked" label="设备关联" width="90" align="center" sortable>
          <template #default="{ row }">
            <el-tag v-if="row.equipmentLinked" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="importance" label="重要度" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag :type="row.importance === 'key' ? 'warning' : ''">
              {{ row.importance === 'key' ? '重点事项' : '常规事项' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="标准状态" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="addUser" label="标准添加人" width="120" sortable />
        <el-table-column prop="auditUser" label="标准审核人" width="120" sortable />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <span>共 {{ total }} 项数据</span>
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
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
          <span class="jump-text">跳至</span>
          <el-input-number v-model="jumpPage" :min="1" :max="totalPages" size="small" @change="handleJump" />
          <span class="jump-text">/ {{ totalPages }} 页</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  content: '',
  method: '',
  cycle: '',
  position: '',
  operation: '',
  equipment: '',
  importance: '',
  status: '',
  addUser: '',
  auditUser: '',
  filterable: '',
  sortable: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    content: '设备使用前后及修程内检查设备状态是否良好',
    method: 'site_inspection',
    cycle: 'monthly',
    position: '设备检修工',
    operationLinked: true,
    equipmentLinked: true,
    importance: 'key',
    status: 'active',
    addUser: '张三',
    auditUser: '李四'
  },
  {
    id: 2,
    content: '设备修程时是否检查各部件状态',
    method: 'site_inspection',
    cycle: 'monthly',
    position: '设备检修工',
    operationLinked: true,
    equipmentLinked: true,
    importance: 'key',
    status: 'active',
    addUser: '张三',
    auditUser: '李四'
  },
  {
    id: 3,
    content: '设备使用前后是否及时检查确认',
    method: 'record_review',
    cycle: 'weekly',
    position: '工程车运维',
    operationLinked: false,
    equipmentLinked: true,
    importance: 'normal',
    status: 'active',
    addUser: '王五',
    auditUser: '赵六'
  },
  {
    id: 4,
    content: '受流器各部件尺寸数据是否符合要求',
    method: 'data_analysis',
    cycle: 'quarterly',
    position: '设备检修工',
    operationLinked: true,
    equipmentLinked: true,
    importance: 'key',
    status: 'pending',
    addUser: '孙七',
    auditUser: '周八'
  },
  {
    id: 5,
    content: '检查生产、办公环境是否符合安全要求',
    method: 'site_inspection',
    cycle: 'daily',
    position: '站务员',
    operationLinked: false,
    equipmentLinked: false,
    importance: 'normal',
    status: 'active',
    addUser: '吴九',
    auditUser: '郑十'
  }
])

// 选中行
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(101)

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 跳转页码
const jumpPage = ref(1)

// 格式化排查方法
const formatMethod = (method) => {
  const methodMap = {
    'site_inspection': '现场检查',
    'record_review': '查阅记录',
    'drill': '应急演练',
    'data_analysis': '数据分析',
    'incident_analysis': '事件分析'
  }
  return methodMap[method] || method
}

// 格式化排查周期
const formatCycle = (cycle) => {
  const cycleMap = {
    'daily': '每日',
    'weekly': '每周',
    'monthly': '每月',
    'quarterly': '每季度',
    'yearly': '每年'
  }
  return cycleMap[cycle] || cycle
}

// 格式化状态
const formatStatus = (status) => {
  const statusMap = {
    'active': '启用',
    'inactive': '停用',
    'pending': '审批'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'info'
  if (status === 'pending') return 'warning'
  return ''
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm)
  ElMessage.success('搜索功能开发中...')
  // TODO: 调用后端 API
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    content: '',
    method: '',
    cycle: '',
    position: '',
    operation: '',
    equipment: '',
    importance: '',
    status: '',
    addUser: '',
    auditUser: '',
    filterable: '',
    sortable: ''
  })
  handleSearch()
}

// 新增
const handleAdd = () => {
  console.log('新增')
  // TODO: 跳转到新增页面或打开弹窗
}

// 编辑
const handleEdit = (row) => {
  console.log('编辑:', row)
  // TODO: 跳转到编辑页面或打开弹窗
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该条标准吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    console.log('删除:', row.id)
    ElMessage.success('删除成功')
    // TODO: 调用后端 API
  }).catch(() => {
    // 取消删除
  })
}

// 导入
const handleImport = () => {
  console.log('导入')
  // TODO: 打开导入弹窗
}

// 导出
const handleExport = () => {
  console.log('导出')
  // TODO: 调用导出 API
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条标准吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    console.log('批量删除:', selectedRows.value.map(item => item.id))
    ElMessage.success('批量删除成功')
    // TODO: 调用后端 API
  }).catch(() => {
    // 取消删除
  })
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 页码变化
const handlePageChange = (page) => {
  console.log('当前页:', page)
  // TODO: 调用后端 API
}

// 跳转
const handleJump = () => {
  currentPage.value = jumpPage.value
  handlePageChange(currentPage.value)
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

  .search-card {
    margin-bottom: $spacing-md;

    .search-form {
      .el-form-item {
        margin-bottom: $spacing-md;
        width: 100%;

        :deep(.el-form-item__label) {
          width: 120px;
          color: $text-regular;
        }

        :deep(.el-form-item__content) {
          width: calc(100% - 120px);
        }
      }

      .el-button {
        margin-left: $spacing-sm;
      }
    }
  }

  .toolbar-card {
    margin-bottom: $spacing-md;

    .toolbar {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .table-card {
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
  }
}
</style>
