<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">个人劳动防护用品管理（含借用）</h2>
    </div>

    <!-- Sheet 页签 -->
    <el-card class="tab-card">
      <el-tabs v-model="activeSheet" class="sheet-tabs" @tab-change="handleTabChange">
        <!-- ==================== Sheet1: 领用/更换管理 ==================== -->
        <el-tab-pane label="领用/更换管理" name="collect">
          <!-- 搜索表单 -->
          <el-form :model="searchForm1" :inline="true" class="search-form">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="物资名称">
                  <el-input v-model="searchForm1.materialName" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="物资分类">
                  <el-select v-model="searchForm1.materialCategory" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="安全帽" value="helmet" />
                    <el-option label="防护手套" value="gloves" />
                    <el-option label="防护鞋" value="shoes" />
                    <el-option label="防护服" value="suit" />
                    <el-option label="防护眼镜" value="glasses" />
                    <el-option label="耳塞" value="earplugs" />
                    <el-option label="口罩" value="mask" />
                    <el-option label="安全带" value="belt" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="物资编码">
                  <el-input v-model="searchForm1.materialCode" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="操作类型">
                  <el-select v-model="searchForm1.operationType" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="领用" value="collect" />
                    <el-option label="更换" value="replace" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="发放时间">
                  <el-date-picker
                    v-model="searchForm1.distributionDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="分配人">
                  <el-input v-model="searchForm1.distributor" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="领用状态">
                  <el-select v-model="searchForm1.collectionStatus" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="已领用" value="collected" />
                    <el-option label="待领用" value="pending" />
                    <el-option label="已更换" value="replaced" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="success" @click="handleSearch1">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="handleReset1">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <!-- 操作按钮 -->
          <div class="toolbar">
            <el-button type="success" @click="handleAdd1">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button @click="handleImport1">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
            <el-button @click="handleExport1">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button type="danger" :disabled="selectedRows1.length === 0" @click="handleBatchDelete1">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>

          <!-- 数据表格 -->
          <el-table
            :data="tableData1"
            style="width: 100%"
            @selection-change="handleSelectionChange1"
            border
            stripe
          >
            <el-table-column type="selection" width="55" fixed />
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="materialName" label="物资名称" min-width="150" show-overflow-tooltip sortable />
            <el-table-column prop="materialCategory" label="物资分类" width="120" sortable>
              <template #default="{ row }">
                <span>{{ formatCategory(row.materialCategory) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="materialCode" label="物资编码" width="130" sortable />
            <el-table-column prop="operationType" label="操作类型" width="100" align="center" sortable>
              <template #default="{ row }">
                <el-tag :type="row.operationType === 'collect' ? 'success' : 'warning'">
                  {{ row.operationType === 'collect' ? '领用' : '更换' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="distributionDate" label="发放时间" width="120" sortable />
            <el-table-column prop="distributor" label="分配人" width="100" sortable />
            <el-table-column prop="collectionStatus" label="领用状态" width="100" align="center" sortable>
              <template #default="{ row }">
                <el-tag :type="getStatusTagType1(row.collectionStatus)">
                  {{ formatStatus1(row.collectionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="signature" label="签字确认" width="100" align="center">
              <template #default="{ row }">
                <el-image
                  v-if="row.signature"
                  :src="row.signature"
                  :preview-src-list="[row.signature]"
                  style="width: 40px; height: 40px"
                  fit="contain"
                />
                <span v-else class="text-placeholder">未签字</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit1(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete1(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <div class="pagination-left">
              <span>共 {{ total1 }} 项数据</span>
            </div>
            <div class="pagination-right">
              <el-select v-model="pageSize1" placeholder="每页条数" size="small" style="width: 100px">
                <el-option label="10 条/页" :value="10" />
                <el-option label="20 条/页" :value="20" />
                <el-option label="50 条/页" :value="50" />
                <el-option label="100 条/页" :value="100" />
              </el-select>
              <el-pagination
                v-model:current-page="currentPage1"
                :page-size="pageSize1"
                :total="total1"
                layout="prev, pager, next"
                @current-change="handlePageChange1"
              />
              <span class="jump-text">跳至</span>
              <el-input-number v-model="jumpPage1" :min="1" :max="totalPages1" size="small" @change="handleJump1" />
              <span class="jump-text">/ {{ totalPages1 }} 页</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- ==================== Sheet2: 借用管理 ==================== -->
        <el-tab-pane label="借用管理" name="borrow">
          <!-- 搜索表单 -->
          <el-form :model="searchForm2" :inline="true" class="search-form">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="物资名称">
                  <el-input v-model="searchForm2.materialName" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="物资编码">
                  <el-input v-model="searchForm2.materialCode" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="借用人">
                  <el-input v-model="searchForm2.borrower" placeholder="请输入" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="借用状态">
                  <el-select v-model="searchForm2.borrowStatus" placeholder="请选择" clearable style="width: 100%">
                    <el-option label="借用中" value="borrowing" />
                    <el-option label="已归还" value="returned" />
                    <el-option label="逾期未还" value="overdue" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="借用日期">
                  <el-date-picker
                    v-model="searchForm2.borrowDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="归还日期">
                  <el-date-picker
                    v-model="searchForm2.returnDate"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <el-button type="success" @click="handleSearch2">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                  <el-button @click="handleReset2">
                    <el-icon><Refresh /></el-icon>
                    重置
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <!-- 操作按钮 -->
          <div class="toolbar">
            <el-button type="success" @click="handleAdd2">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button @click="handleImport2">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
            <el-button @click="handleExport2">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button type="danger" :disabled="selectedRows2.length === 0" @click="handleBatchDelete2">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </div>

          <!-- 数据表格 -->
          <el-table
            :data="tableData2"
            style="width: 100%"
            @selection-change="handleSelectionChange2"
            border
            stripe
          >
            <el-table-column type="selection" width="55" fixed />
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="materialName" label="物资名称" min-width="150" show-overflow-tooltip sortable />
            <el-table-column prop="materialCode" label="物资编码" width="130" sortable />
            <el-table-column prop="borrowDate" label="借用日期" width="120" sortable />
            <el-table-column prop="returnDate" label="归还日期" width="120" sortable />
            <el-table-column prop="borrower" label="借用人" width="100" sortable />
            <el-table-column prop="borrowStatus" label="借用状态" width="100" align="center" sortable>
              <template #default="{ row }">
                <el-tag :type="getBorrowStatusTagType(row.borrowStatus)">
                  {{ formatBorrowStatus(row.borrowStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit2(row)">编辑</el-button>
                <el-button
                  v-if="row.borrowStatus !== 'returned'"
                  type="success"
                  size="small"
                  @click="handleReturn(row)"
                >
                  归还
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete2(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <div class="pagination-left">
              <span>共 {{ total2 }} 项数据</span>
            </div>
            <div class="pagination-right">
              <el-select v-model="pageSize2" placeholder="每页条数" size="small" style="width: 100px">
                <el-option label="10 条/页" :value="10" />
                <el-option label="20 条/页" :value="20" />
                <el-option label="50 条/页" :value="50" />
                <el-option label="100 条/页" :value="100" />
              </el-select>
              <el-pagination
                v-model:current-page="currentPage2"
                :page-size="pageSize2"
                :total="total2"
                layout="prev, pager, next"
                @current-change="handlePageChange2"
              />
              <span class="jump-text">跳至</span>
              <el-input-number v-model="jumpPage2" :min="1" :max="totalPages2" size="small" @change="handleJump2" />
              <span class="jump-text">/ {{ totalPages2 }} 页</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ==================== Sheet1 新增/编辑弹窗 ==================== -->
    <el-dialog
      v-model="dialogVisible1"
      :title="dialogMode1 === 'add' ? '新增领用/更换记录' : '编辑领用/更换记录'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef1"
        :model="formData1"
        :rules="formRules1"
        label-width="120px"
      >
        <el-form-item label="物资名称" prop="materialName">
          <el-input v-model="formData1.materialName" placeholder="请输入物资名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="物资分类" prop="materialCategory">
          <el-select v-model="formData1.materialCategory" placeholder="请选择物资分类" style="width: 100%">
            <el-option label="安全帽" value="helmet" />
            <el-option label="防护手套" value="gloves" />
            <el-option label="防护鞋" value="shoes" />
            <el-option label="防护服" value="suit" />
            <el-option label="防护眼镜" value="glasses" />
            <el-option label="耳塞" value="earplugs" />
            <el-option label="口罩" value="mask" />
            <el-option label="安全带" value="belt" />
          </el-select>
        </el-form-item>
        <el-form-item label="物资编码" prop="materialCode">
          <el-input v-model="formData1.materialCode" placeholder="请输入物资编码" />
        </el-form-item>
        <el-form-item label="操作类型" prop="operationType">
          <el-radio-group v-model="formData1.operationType">
            <el-radio value="collect">领用</el-radio>
            <el-radio value="replace">更换</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发放时间" prop="distributionDate">
          <el-date-picker
            v-model="formData1.distributionDate"
            type="date"
            placeholder="请选择发放时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分配人" prop="distributor">
          <el-input v-model="formData1.distributor" placeholder="请输入分配人" />
        </el-form-item>
        <el-form-item label="领用状态" prop="collectionStatus">
          <el-radio-group v-model="formData1.collectionStatus">
            <el-radio value="collected">已领用</el-radio>
            <el-radio value="pending">待领用</el-radio>
            <el-radio value="replaced">已更换</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="签字确认">
          <div class="signature-upload">
            <el-upload
              class="signature-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleSignatureSuccess"
              :before-upload="handleBeforeSignatureUpload"
              accept=".jpg,.jpeg,.png"
            >
              <img v-if="formData1.signature" :src="formData1.signature" class="signature-image" />
              <el-icon v-else class="signature-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持 JPG、PNG 格式，不超过 2MB</div>
            <el-button v-if="formData1.signature" type="danger" size="small" style="margin-top: 8px" @click="formData1.signature = ''">
              删除签字
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible1 = false">取消</el-button>
        <el-button type="success" @click="handleSubmit1">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== Sheet2 新增/编辑弹窗 ==================== -->
    <el-dialog
      v-model="dialogVisible2"
      :title="dialogMode2 === 'add' ? '新增借用记录' : '编辑借用记录'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef2"
        :model="formData2"
        :rules="formRules2"
        label-width="120px"
      >
        <el-form-item label="物资名称" prop="materialName">
          <el-input v-model="formData2.materialName" placeholder="请输入物资名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="物资编码" prop="materialCode">
          <el-input v-model="formData2.materialCode" placeholder="请输入物资编码" />
        </el-form-item>
        <el-form-item label="借用日期" prop="borrowDate">
          <el-date-picker
            v-model="formData2.borrowDate"
            type="date"
            placeholder="请选择借用日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="归还日期" prop="returnDate">
          <el-date-picker
            v-model="formData2.returnDate"
            type="date"
            placeholder="请选择归还日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="借用人" prop="borrower">
          <el-input v-model="formData2.borrower" placeholder="请输入借用人" />
        </el-form-item>
        <el-form-item label="借用状态" prop="borrowStatus">
          <el-radio-group v-model="formData2.borrowStatus">
            <el-radio value="borrowing">借用中</el-radio>
            <el-radio value="returned">已归还</el-radio>
            <el-radio value="overdue">逾期未还</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData2.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="success" @click="handleSubmit2">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ==================== Sheet 切换 ====================
const activeSheet = ref('collect')
const handleTabChange = (tab) => {
  console.log('切换 Sheet:', tab)
}

// ==================== Sheet1: 领用/更换管理 ====================

// 搜索表单
const searchForm1 = reactive({
  materialName: '',
  materialCategory: '',
  materialCode: '',
  operationType: '',
  distributionDate: '',
  distributor: '',
  collectionStatus: ''
})

// 表格数据
const tableData1 = ref([
  {
    id: 1,
    materialName: '安全帽（白色）',
    materialCategory: 'helmet',
    materialCode: 'PPE-2026-001',
    operationType: 'collect',
    distributionDate: '2026-06-01',
    distributor: '张三',
    collectionStatus: 'collected',
    signature: ''
  },
  {
    id: 2,
    materialName: '防护手套（绝缘）',
    materialCategory: 'gloves',
    materialCode: 'PPE-2026-002',
    operationType: 'collect',
    distributionDate: '2026-06-05',
    distributor: '张三',
    collectionStatus: 'collected',
    signature: ''
  },
  {
    id: 3,
    materialName: '防护鞋（防砸）',
    materialCategory: 'shoes',
    materialCode: 'PPE-2026-003',
    operationType: 'replace',
    distributionDate: '2026-06-10',
    distributor: '李四',
    collectionStatus: 'replaced',
    signature: ''
  },
  {
    id: 4,
    materialName: '防护服（阻燃）',
    materialCategory: 'suit',
    materialCode: 'PPE-2026-004',
    operationType: 'collect',
    distributionDate: '2026-06-15',
    distributor: '王五',
    collectionStatus: 'pending',
    signature: ''
  },
  {
    id: 5,
    materialName: '防护眼镜',
    materialCategory: 'glasses',
    materialCode: 'PPE-2026-005',
    operationType: 'collect',
    distributionDate: '2026-06-18',
    distributor: '赵六',
    collectionStatus: 'collected',
    signature: ''
  }
])

const selectedRows1 = ref([])
const currentPage1 = ref(1)
const pageSize1 = ref(10)
const total1 = ref(58)
const totalPages1 = computed(() => Math.ceil(total1.value / pageSize1.value))
const jumpPage1 = ref(1)

// 弹窗
const dialogVisible1 = ref(false)
const dialogMode1 = ref('add')
const formRef1 = ref(null)
const uploadUrl = '/api/upload'
const formData1 = reactive({
  materialName: '',
  materialCategory: '',
  materialCode: '',
  operationType: 'collect',
  distributionDate: '',
  distributor: '',
  collectionStatus: 'pending',
  signature: ''
})

const formRules1 = {
  materialName: [
    { required: true, message: '请输入物资名称', trigger: 'blur' },
    { max: 100, message: '物资名称不能超过 100 个字', trigger: 'blur' }
  ],
  materialCategory: [{ required: true, message: '请选择物资分类', trigger: 'change' }],
  materialCode: [{ required: true, message: '请输入物资编码', trigger: 'blur' }],
  operationType: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
  distributionDate: [{ required: true, message: '请选择发放时间', trigger: 'change' }],
  distributor: [{ required: true, message: '请输入分配人', trigger: 'blur' }],
  collectionStatus: [{ required: true, message: '请选择领用状态', trigger: 'change' }]
}

// 格式化分类
const formatCategory = (category) => {
  const map = {
    'helmet': '安全帽', 'gloves': '防护手套', 'shoes': '防护鞋',
    'suit': '防护服', 'glasses': '防护眼镜', 'earplugs': '耳塞',
    'mask': '口罩', 'belt': '安全带'
  }
  return map[category] || category
}

const formatStatus1 = (status) => {
  const map = { 'collected': '已领用', 'pending': '待领用', 'replaced': '已更换' }
  return map[status] || status
}

const getStatusTagType1 = (status) => {
  if (status === 'collected') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'replaced') return 'info'
  return ''
}

const handleSearch1 = () => {
  console.log('Sheet1 搜索:', searchForm1)
  ElMessage.success('搜索功能开发中...')
}

const handleReset1 = () => {
  Object.assign(searchForm1, {
    materialName: '', materialCategory: '', materialCode: '',
    operationType: '', distributionDate: '', distributor: '', collectionStatus: ''
  })
  handleSearch1()
}

const handleAdd1 = () => {
  dialogMode1.value = 'add'
  Object.assign(formData1, {
    materialName: '', materialCategory: '', materialCode: '',
    operationType: 'collect', distributionDate: '', distributor: '',
    collectionStatus: 'pending', signature: ''
  })
  dialogVisible1.value = true
}

const handleEdit1 = (row) => {
  dialogMode1.value = 'edit'
  Object.assign(formData1, { ...row })
  dialogVisible1.value = true
}

const handleDelete1 = (row) => {
  ElMessageBox.confirm('确定要删除该条记录吗？', '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete1 = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows1.value.length} 条记录吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleImport1 = () => { ElMessage.info('导入功能开发中...') }
const handleExport1 = () => { ElMessage.info('导出功能开发中...') }

const handleSelectionChange1 = (selection) => { selectedRows1.value = selection }
const handlePageChange1 = (page) => { console.log('Sheet1 当前页:', page) }
const handleJump1 = () => { currentPage1.value = jumpPage1.value; handlePageChange1(currentPage1.value) }

const handleSubmit1 = async () => {
  if (!formRef1.value) return
  await formRef1.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogMode1.value === 'add' ? '新增成功' : '保存成功')
      dialogVisible1.value = false
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}

const handleBeforeSignatureUpload = (file) => {
  const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) { ElMessage.error('只能上传 JPG/PNG 格式的图片'); return false }
  if (!isLt2M) { ElMessage.error('图片大小不能超过 2MB'); return false }
  return true
}

const handleSignatureSuccess = (response) => {
  formData1.signature = response.url || ''
  ElMessage.success('签字上传成功')
}

// ==================== Sheet2: 借用管理 ====================

const searchForm2 = reactive({
  materialName: '',
  materialCode: '',
  borrower: '',
  borrowStatus: '',
  borrowDate: '',
  returnDate: ''
})

const tableData2 = ref([
  {
    id: 1,
    materialName: '安全帽（白色）',
    materialCode: 'PPE-2026-001',
    borrowDate: '2026-06-10',
    returnDate: '2026-06-20',
    borrower: '孙书星',
    borrowStatus: 'borrowing',
    remark: '临时借用，用于现场施工'
  },
  {
    id: 2,
    materialName: '防护手套（绝缘）',
    materialCode: 'PPE-2026-002',
    borrowDate: '2026-06-08',
    returnDate: '2026-06-18',
    borrower: '李四',
    borrowStatus: 'returned',
    remark: '已按期归还'
  },
  {
    id: 3,
    materialName: '防护服（阻燃）',
    materialCode: 'PPE-2026-004',
    borrowDate: '2026-06-01',
    returnDate: '2026-06-15',
    borrower: '王五',
    borrowStatus: 'overdue',
    remark: '逾期未还，已催还'
  },
  {
    id: 4,
    materialName: '防护眼镜',
    materialCode: 'PPE-2026-005',
    borrowDate: '2026-06-15',
    returnDate: '2026-06-25',
    borrower: '赵六',
    borrowStatus: 'borrowing',
    remark: ''
  },
  {
    id: 5,
    materialName: '安全带',
    materialCode: 'PPE-2026-008',
    borrowDate: '2026-06-12',
    returnDate: '2026-06-22',
    borrower: '钱七',
    borrowStatus: 'borrowing',
    remark: '高空作业借用'
  }
])

const selectedRows2 = ref([])
const currentPage2 = ref(1)
const pageSize2 = ref(10)
const total2 = ref(32)
const totalPages2 = computed(() => Math.ceil(total2.value / pageSize2.value))
const jumpPage2 = ref(1)

// 弹窗
const dialogVisible2 = ref(false)
const dialogMode2 = ref('add')
const formRef2 = ref(null)
const formData2 = reactive({
  materialName: '',
  materialCode: '',
  borrowDate: '',
  returnDate: '',
  borrower: '',
  borrowStatus: 'borrowing',
  remark: ''
})

const formRules2 = {
  materialName: [
    { required: true, message: '请输入物资名称', trigger: 'blur' },
    { max: 100, message: '物资名称不能超过 100 个字', trigger: 'blur' }
  ],
  materialCode: [{ required: true, message: '请输入物资编码', trigger: 'blur' }],
  borrowDate: [{ required: true, message: '请选择借用日期', trigger: 'change' }],
  returnDate: [{ required: true, message: '请选择归还日期', trigger: 'change' }],
  borrower: [{ required: true, message: '请输入借用人', trigger: 'blur' }],
  borrowStatus: [{ required: true, message: '请选择借用状态', trigger: 'change' }]
}

const formatBorrowStatus = (status) => {
  const map = { 'borrowing': '借用中', 'returned': '已归还', 'overdue': '逾期未还' }
  return map[status] || status
}

const getBorrowStatusTagType = (status) => {
  if (status === 'borrowing') return 'warning'
  if (status === 'returned') return 'success'
  if (status === 'overdue') return 'danger'
  return ''
}

const handleSearch2 = () => {
  console.log('Sheet2 搜索:', searchForm2)
  ElMessage.success('搜索功能开发中...')
}

const handleReset2 = () => {
  Object.assign(searchForm2, {
    materialName: '', materialCode: '', borrower: '',
    borrowStatus: '', borrowDate: '', returnDate: ''
  })
  handleSearch2()
}

const handleAdd2 = () => {
  dialogMode2.value = 'add'
  Object.assign(formData2, {
    materialName: '', materialCode: '', borrowDate: '',
    returnDate: '', borrower: '', borrowStatus: 'borrowing', remark: ''
  })
  dialogVisible2.value = true
}

const handleEdit2 = (row) => {
  dialogMode2.value = 'edit'
  Object.assign(formData2, { ...row })
  dialogVisible2.value = true
}

const handleReturn = (row) => {
  ElMessageBox.confirm(`确认物资「${row.materialName}」已归还？`, '归还确认', {
    confirmButtonText: '确认归还', cancelButtonText: '取消', type: 'success'
  }).then(() => {
    row.borrowStatus = 'returned'
    row.returnDate = new Date().toISOString().split('T')[0]
    ElMessage.success('归还成功')
  }).catch(() => {})
}

const handleDelete2 = (row) => {
  ElMessageBox.confirm('确定要删除该条借用记录吗？', '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDelete2 = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows2.value.length} 条记录吗？`, '警告', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

const handleImport2 = () => { ElMessage.info('导入功能开发中...') }
const handleExport2 = () => { ElMessage.info('导出功能开发中...') }

const handleSelectionChange2 = (selection) => { selectedRows2.value = selection }
const handlePageChange2 = (page) => { console.log('Sheet2 当前页:', page) }
const handleJump2 = () => { currentPage2.value = jumpPage2.value; handlePageChange2(currentPage2.value) }

const handleSubmit2 = async () => {
  if (!formRef2.value) return
  await formRef2.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogMode2.value === 'add' ? '新增成功' : '保存成功')
      dialogVisible2.value = false
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
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

  .tab-card {
    :deep(.el-tabs__header) {
      margin-bottom: $spacing-md;
    }

    :deep(.el-tabs__item) {
      font-size: 15px;
      font-weight: 500;
      padding: 0 $spacing-lg;
      height: 44px;
      line-height: 44px;

      &.is-active {
        color: $primary-color;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: $primary-color;
      height: 3px;
    }

    .search-form {
      margin-bottom: $spacing-md;

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

    .toolbar {
      display: flex;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
    }

    .text-placeholder {
      color: $text-placeholder;
      font-size: 12px;
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

    // 签字上传样式
    .signature-upload {
      .signature-uploader {
        border: 1px dashed $border-color;
        border-radius: $border-radius-sm;
        cursor: pointer;
        overflow: hidden;
        width: 200px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: $primary-light;
        }

        .signature-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .signature-uploader-icon {
          font-size: 28px;
          color: $text-placeholder;
        }
      }

      .upload-tip {
        color: $text-secondary;
        font-size: 12px;
        margin-top: $spacing-xs;
      }
    }
  }
}
</style>
