<template>
  <div class="daily-inspection-task">
    <!-- 标题栏 -->
    <div class="page-header">
      <h2 class="page-title">隐患日常排查任务</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="排查任务">
          <el-input v-model="searchForm.task" placeholder="请输入排查任务" clearable />
        </el-form-item>
        <el-form-item label="排查任务状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="未完成" value="未完成"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="重要度">
          <el-select v-model="searchForm.importance" placeholder="请选择重要度" clearable style="width: 120px">
            <el-option label="重点事项" value="重点事项"></el-option>
            <el-option label="常规事项" value="常规事项"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排查中心">
          <el-tree-select
            v-model="searchForm.center"
            :data="departmentTreeData"
            placeholder="请选择排查中心"
            check-strictly
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="排查部门">
          <el-tree-select
            v-model="searchForm.department"
            :data="departmentTreeData"
            placeholder="请选择排查部门"
            check-strictly
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="排查班组">
          <el-tree-select
            v-model="searchForm.team"
            :data="teamTreeData"
            placeholder="请选择排查班组"
            check-strictly
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="排查岗位">
          <el-select v-model="searchForm.position" placeholder="请选择排查岗位" clearable style="width: 120px">
            <el-option label="设备检修工" value="设备检修工"></el-option>
            <el-option label="站务员" value="站务员"></el-option>
            <el-option label="工程车运维" value="工程车运维"></el-option>
            <el-option label="电力调度" value="电力调度"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排查线路">
          <el-select v-model="searchForm.line" placeholder="请选择排查线路" clearable style="width: 150px">
            <el-option label="1 号线" value="1 号线"></el-option>
            <el-option label="2 号线" value="2 号线"></el-option>
            <el-option label="3 号线" value="3 号线"></el-option>
            <el-option label="4 号线" value="4 号线"></el-option>
            <el-option label="6 号线" value="6 号线"></el-option>
            <el-option label="8 号线" value="8 号线"></el-option>
            <el-option label="蓝谷快线" value="蓝谷快线"></el-option>
            <el-option label="西海岸快线" value="西海岸快线"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排查日期">
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="排查人">
          <el-input v-model="searchForm.person" placeholder="请输入排查人" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="排查人工号">
          <el-input v-model="searchForm.personId" placeholder="请输入工号" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <i class="el-icon-search"></i>
            查询
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <el-button type="success" @click="handleAdd">
          <i class="el-icon-plus"></i>
          新增
        </el-button>
        <el-button @click="handleImport">
          <i class="el-icon-upload"></i>
          导入
        </el-button>
        <el-button @click="handleExport">
          <i class="el-icon-download"></i>
          导出
        </el-button>
        <el-button type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          <i class="el-icon-delete"></i>
          批量删除
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="tableData"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
        <el-table-column prop="task" label="排查任务" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="排查任务状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="importance" label="重要度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.importance === '重点事项' ? 'danger' : 'info'" size="small">
              {{ row.importance }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="center" label="排查中心" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="department" label="排查部门" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="team" label="排查班组" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="position" label="排查岗位" width="100" align="center"></el-table-column>
        <el-table-column prop="line" label="排查线路" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="location" label="排查位置" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="person" label="排查人" width="100" align="center"></el-table-column>
        <el-table-column prop="personId" label="排查人工号" width="100" align="center"></el-table-column>
        <el-table-column prop="date" label="排查日期" width="120" align="center" sortable></el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              type="info" 
              size="small" 
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button 
              v-if="row.status === '未完成'" 
              type="primary" 
              size="small" 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="row.status === '未完成'" 
              type="danger" 
              size="small" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情/编辑弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="isEditMode ? (formData.id ? '编辑日常排查任务' : '新增日常排查任务') : '查看日常排查任务'"
      width="900px"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div class="detail-content">
        <!-- Banner -->
        <div class="detail-banner">
          <span class="banner-title">基本信息</span>
        </div>

        <!-- 第一行 -->
        <div class="form-row">
          <div class="form-item full-width">
            <div class="form-label">排查任务</div>
            <div class="form-value">
              <el-input
                v-model="formData.task"
                type="textarea"
                :rows="3"
                placeholder="请输入排查任务"
                maxlength="500"
                show-word-limit
                :disabled="!isEditMode"
              ></el-input>
            </div>
          </div>
        </div>

        <!-- 第二行 -->
        <div class="form-row">
          <div class="form-item">
            <div class="form-label">排查任务状态</div>
            <div class="form-value">
              <el-select v-model="formData.status" placeholder="请选择状态" :disabled="!isEditMode" style="width: 100%">
                <el-option label="未完成" value="未完成"></el-option>
                <el-option label="已完成" value="已完成"></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">重要度</div>
            <div class="form-value">
              <el-select v-model="formData.importance" placeholder="请选择重要度" :disabled="!isEditMode" style="width: 100%">
                <el-option label="重点事项" value="重点事项"></el-option>
                <el-option label="常规事项" value="常规事项"></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查位置</div>
            <div class="form-value">
              <el-input v-model="formData.location" placeholder="请输入排查位置" :disabled="!isEditMode"></el-input>
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查线路</div>
            <div class="form-value">
              <el-select v-model="formData.line" placeholder="请选择排查线路" :disabled="!isEditMode" style="width: 100%">
                <el-option label="1 号线" value="1 号线"></el-option>
                <el-option label="2 号线" value="2 号线"></el-option>
                <el-option label="3 号线" value="3 号线"></el-option>
                <el-option label="4 号线" value="4 号线"></el-option>
                <el-option label="6 号线" value="6 号线"></el-option>
                <el-option label="8 号线" value="8 号线"></el-option>
                <el-option label="蓝谷快线" value="蓝谷快线"></el-option>
                <el-option label="西海岸快线" value="西海岸快线"></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查人</div>
            <div class="form-value">
              <el-input v-model="formData.person" placeholder="请输入排查人" :disabled="!isEditMode"></el-input>
            </div>
          </div>
        </div>

        <!-- 第三行 -->
        <div class="form-row">
          <div class="form-item">
            <div class="form-label">排查中心</div>
            <div class="form-value">
              <el-tree-select
                v-model="formData.center"
                :data="departmentTreeData"
                placeholder="请选择排查中心"
                check-strictly
                clearable
                :disabled="!isEditMode"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查部门</div>
            <div class="form-value">
              <el-tree-select
                v-model="formData.department"
                :data="departmentTreeData"
                placeholder="请选择排查部门"
                check-strictly
                clearable
                :disabled="!isEditMode"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查班组</div>
            <div class="form-value">
              <el-tree-select
                v-model="formData.team"
                :data="teamTreeData"
                placeholder="请选择排查班组"
                check-strictly
                clearable
                :disabled="!isEditMode"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查岗位</div>
            <div class="form-value">
              <el-select v-model="formData.position" placeholder="请选择排查岗位" :disabled="!isEditMode" style="width: 100%">
                <el-option label="设备检修工" value="设备检修工"></el-option>
                <el-option label="站务员" value="站务员"></el-option>
                <el-option label="工程车运维" value="工程车运维"></el-option>
                <el-option label="电力调度" value="电力调度"></el-option>
              </el-select>
            </div>
          </div>
          <div class="form-item">
            <div class="form-label">排查人工号</div>
            <div class="form-value">
              <el-input v-model="formData.personId" placeholder="请输入工号" :disabled="!isEditMode"></el-input>
            </div>
          </div>
        </div>

        <!-- 第四行 -->
        <div class="form-row">
          <div class="form-item">
            <div class="form-label">排查日期</div>
            <div class="form-value">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                :disabled="!isEditMode"
                style="width: 100%"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">返回</el-button>
          <el-button v-if="isEditMode" type="success" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 搜索表单
const searchForm = reactive({
  task: '',
  status: '',
  importance: '',
  center: '',
  department: '',
  team: '',
  position: '',
  line: '',
  date: '',
  person: '',
  personId: ''
});

// 表格数据
const tableData = ref([
  {
    id: 1,
    task: '检查消防设施是否完好有效',
    status: '未完成',
    importance: '重点事项',
    center: '运营中心',
    department: '设备部',
    team: '检修一班',
    position: '设备检修工',
    line: '1 号线',
    location: '站台层',
    person: '张三',
    personId: '001',
    date: '2024-01-20'
  },
  {
    id: 2,
    task: '检查电气线路是否有老化破损现象',
    status: '已完成',
    importance: '重点事项',
    center: '运营中心',
    department: '设备部',
    team: '检修二班',
    position: '电力调度',
    line: '2 号线',
    location: '设备区',
    person: '李四',
    personId: '002',
    date: '2024-01-21'
  },
  {
    id: 3,
    task: '检查安全出口是否畅通无阻',
    status: '未完成',
    importance: '常规事项',
    center: '站务中心',
    department: '站务部',
    team: '站务一班',
    position: '站务员',
    line: '3 号线',
    location: '站厅层',
    person: '王五',
    personId: '003',
    date: '2024-01-22'
  },
  {
    id: 4,
    task: '检查作业人员是否按规定佩戴劳动防护用品',
    status: '已完成',
    importance: '重点事项',
    center: '维修中心',
    department: '维修部',
    team: '维修班',
    position: '工程车运维',
    line: '4 号线',
    location: '车辆段',
    person: '赵六',
    personId: '004',
    date: '2024-01-23'
  },
  {
    id: 5,
    task: '检查作业现场是否有易燃易爆物品',
    status: '未完成',
    importance: '重点事项',
    center: '运营中心',
    department: '安全部',
    team: '安全班',
    position: '安全员',
    line: '蓝谷快线',
    location: '作业现场',
    person: '孙七',
    personId: '005',
    date: '2024-01-24'
  }
]);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(5);

// 详情弹窗
const detailVisible = ref(false);
const isEditMode = ref(false);
const formData = reactive({
  id: null,
  task: '',
  status: '',
  importance: '',
  center: '',
  department: '',
  team: '',
  position: '',
  line: '',
  location: '',
  person: '',
  personId: '',
  date: ''
});

// 树形数据
const departmentTreeData = [
  {
    value: '运营中心',
    label: '运营中心',
    children: [
      {
        value: '设备部',
        label: '设备部',
        children: [
          { value: '检修一班', label: '检修一班' },
          { value: '检修二班', label: '检修二班' }
        ]
      },
      {
        value: '站务部',
        label: '站务部',
        children: [
          { value: '站务一班', label: '站务一班' },
          { value: '站务二班', label: '站务二班' }
        ]
      }
    ]
  },
  {
    value: '维修中心',
    label: '维修中心',
    children: [
      {
        value: '维修部',
        label: '维修部',
        children: [
          { value: '维修班', label: '维修班' }
        ]
      }
    ]
  }
];

const teamTreeData = [
  {
    value: '检修一班',
    label: '检修一班'
  },
  {
    value: '检修二班',
    label: '检修二班'
  },
  {
    value: '站务一班',
    label: '站务一班'
  },
  {
    value: '站务二班',
    label: '站务二班'
  },
  {
    value: '维修班',
    label: '维修班'
  },
  {
    value: '安全班',
    label: '安全班'
  }
];

// 加载状态
const loading = ref(false);
const selectedRows = ref([]);

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '未完成':
      return 'warning';
    case '已完成':
      return 'success';
    default:
      return 'info';
  }
};

// 搜索
const handleSearch = () => {
  console.log('搜索条件:', searchForm);
  ElMessage.success('搜索功能待实现');
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    task: '',
    status: '',
    importance: '',
    center: '',
    department: '',
    team: '',
    position: '',
    line: '',
    date: '',
    person: '',
    personId: ''
  });
};

// 新增
const handleAdd = () => {
  isEditMode.value = true;
  Object.assign(formData, {
    id: null,
    task: '',
    status: '未完成',
    importance: '常规事项',
    center: '',
    department: '',
    team: '',
    position: '',
    line: '',
    location: '',
    person: '',
    personId: '',
    date: new Date().toISOString().split('T')[0]
  });
  detailVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  isEditMode.value = true;
  Object.assign(formData, { ...row });
  detailVisible.value = true;
};

// 查看详情
const handleViewDetail = (row) => {
  isEditMode.value = false;
  Object.assign(formData, { ...row });
  detailVisible.value = true;
};

// 保存
const handleSave = () => {
  if (!formData.task) {
    ElMessage.error('排查任务为必填项');
    return;
  }
  if (!formData.status) {
    ElMessage.error('排查任务状态为必填项');
    return;
  }
  if (!formData.importance) {
    ElMessage.error('重要度为必填项');
    return;
  }
  if (!formData.line) {
    ElMessage.error('排查线路为必填项');
    return;
  }
  if (!formData.date) {
    ElMessage.error('排查日期为必填项');
    return;
  }
  
  console.log('保存数据:', formData);
  ElMessage.success('保存成功');
  detailVisible.value = false;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('删除', row);
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('批量删除', selectedRows.value);
    ElMessage.success('批量删除成功');
  }).catch(() => {});
};

// 导入
const handleImport = () => {
  ElMessage.info('导入功能待实现');
};

// 导出
const handleExport = () => {
  ElMessage.info('导出功能待实现');
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  console.log('当前页:', page);
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  console.log('每页大小:', size);
};
</script>

<style scoped lang="scss">
.daily-inspection-task {
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  min-height: 100vh;

  .page-header {
    margin-bottom: var(--spacing-md);

    .page-title {
      font-size: var(--font-size-title);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      margin: 0;
    }
  }

  .search-card {
    margin-bottom: var(--spacing-md);
    border-radius: var(--border-radius-card);
    box-shadow: var(--shadow-sm);

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);

      :deep(.el-form-item) {
        margin-bottom: var(--spacing-sm);
      }
    }
  }

  .toolbar-card {
    margin-bottom: var(--spacing-md);
    border-radius: var(--border-radius-card);
    box-shadow: var(--shadow-sm);

    .toolbar {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .table-card {
    border-radius: var(--border-radius-card);
    box-shadow: var(--shadow-sm);

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--spacing-md);
    }
  }

  .detail-dialog {
    :deep(.el-dialog__header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius-card) var(--border-radius-card) 0 0;

      .el-dialog__title {
        color: #fff;
        font-size: var(--font-size-section);
        font-weight: var(--font-weight-bold);
      }

      .el-dialog__headerbtn {
        .el-dialog__close {
          color: #fff;

          &:hover {
            color: #fff;
          }
        }
      }
    }

    :deep(.el-dialog__body) {
      padding: 0;
    }

    :deep(.el-dialog__footer) {
      padding: var(--spacing-md) var(--spacing-lg);
      border-top: 1px solid var(--border-color-light);
    }
  }

  .detail-content {
    padding: var(--spacing-lg);

    .detail-banner {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: var(--border-radius-base);
      padding: var(--spacing-md) var(--spacing-lg);
      margin-bottom: var(--spacing-lg);

      .banner-title {
        font-size: var(--font-size-section);
        font-weight: var(--font-weight-bold);
        color: var(--primary-green);
      }
    }

    .form-row {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);

      &:last-child {
        margin-bottom: 0;
      }

      .form-item {
        flex: 1;
        display: flex;
        align-items: flex-start;

        &.full-width {
          flex-basis: 100%;
        }

        .form-label {
          width: 120px;
          flex-shrink: 0;
          font-weight: var(--font-weight-medium);
          color: var(--text-regular);
          font-size: var(--font-size-body);
          padding-right: var(--spacing-xs);
          padding-top: 8px;
        }

        .form-value {
          flex: 1;
          min-width: 0;

          :deep(.el-input__wrapper),
          :deep(.el-select__wrapper),
          :deep(.el-textarea__inner) {
            border-radius: var(--border-radius-base);
          }

          :deep(.el-textarea__inner) {
            resize: vertical;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
  }
}
</style>
