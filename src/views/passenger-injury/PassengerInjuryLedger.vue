<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">客伤信息台账</h2>
    </div>

    <el-card>
      <!-- 顶部：视图切换 + 搜索 -->
      <div class="ledger-toolbar">
        <div class="ledger-search">
          <el-select v-model="searchForm.center" placeholder="所属中心" clearable style="width: 150px">
            <el-option v-for="c in centerDict" :key="c" :label="c" :value="c" />
          </el-select>
          <el-select v-model="searchForm.line" placeholder="所属线路" clearable style="width: 150px">
            <el-option v-for="l in lineDict" :key="l" :label="l" :value="l" />
          </el-select>
          <el-date-picker
            v-model="searchForm.occurTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
          <el-button type="success" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
        <div class="ledger-actions">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <div class="view-toggle">
            <div
              :class="['view-toggle-btn', { active: viewMode === 'card' }]"
              title="卡片视图"
              @click="viewMode = 'card'"
            >
              <el-icon><Grid /></el-icon>
            </div>
            <div
              :class="['view-toggle-btn', { active: viewMode === 'list' }]"
              title="列表视图"
              @click="viewMode = 'list'"
            >
              <el-icon><List /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 台账统计 -->
      <div class="ledger-stats">
        <span class="stat-item">客伤记录：<b>{{ filteredData.length }}</b> 起</span>
        <span class="stat-divider"></span>
        <span class="stat-item">覆盖线路：<b>{{ lineCount }}</b> 条</span>
        <span class="stat-divider"></span>
        <span class="stat-item">覆盖中心：<b>{{ centerCount }}</b> 个</span>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'">
        <el-empty v-if="paginatedData.length === 0" description="暂无审批通过的客伤记录" />
        <div v-else class="card-grid">
          <div
            v-for="row in paginatedData"
            :key="row.id"
            class="injury-card"
            @click="handleView(row)"
          >
            <div class="card-top">
              <div class="card-record-no">
                <span class="record-icon">📄</span>
                {{ row.recordNo }}
              </div>
              <el-tag type="warning" size="small" effect="plain">{{ row.line }}</el-tag>
            </div>
            <div class="card-main">
              <div class="card-line-badge">{{ row.line }}</div>
              <div class="card-info">
                <div class="card-row">
                  <span class="card-label">所属中心</span>
                  <span class="card-value">{{ row.center }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">发生地点</span>
                  <span class="card-value">{{ row.location }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">发生时间</span>
                  <span class="card-value">{{ row.occurTime }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">伤者信息</span>
                  <span class="card-value">{{ row.name }}（{{ row.gender }}，{{ row.age }}岁）</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="card-muted">{{ row.position }} · {{ row.bodyPart }}受伤</span>
              <span class="card-detail">查看详情 ></span>
            </div>
          </div>
        </div>
        <div class="pagination-container">
          <span class="total-text">共 {{ filteredData.length }} 项</span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            layout="prev, pager, next"
          />
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else>
        <el-empty v-if="paginatedData.length === 0" description="暂无审批通过的客伤记录" />
        <el-table v-else :data="paginatedData" style="width: 100%" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="recordNo" label="记录编号" width="140" sortable />
          <el-table-column prop="center" label="所属中心" width="120" sortable />
          <el-table-column prop="line" label="所属线路" width="100" align="center" sortable />
          <el-table-column prop="location" label="发生地点" min-width="150" show-overflow-tooltip sortable />
          <el-table-column prop="occurTime" label="发生时间" width="150" sortable />
          <el-table-column prop="name" label="伤者姓名" width="100" />
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <span class="total-text">共 {{ filteredData.length }} 项</span>
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredData.length"
            layout="prev, pager, next"
          />
        </div>
      </div>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="viewVisible" title="客伤信息详情" width="720px" destroy-on-close>
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
          <el-tag type="success">{{ viewData.approvalStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="事情经过" :span="2">{{ viewData.incident }}</el-descriptions-item>
        <el-descriptions-item label="原因分析" :span="2">{{ viewData.cause }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { approvedInjuryRecords, centerDict, lineDict } from '@/stores/passengerInjury'

const viewMode = ref('card')

const searchForm = reactive({
  center: '',
  line: '',
  occurTime: ''
})

const filteredData = computed(() => {
  let list = [...approvedInjuryRecords.value]
  if (searchForm.center) list = list.filter(r => r.center === searchForm.center)
  if (searchForm.line) list = list.filter(r => r.line === searchForm.line)
  if (searchForm.occurTime && searchForm.occurTime.length === 2) {
    const [start, end] = searchForm.occurTime
    list = list.filter(r => {
      const d = r.occurTime.slice(0, 10)
      return d >= start && d <= end
    })
  }
  return list
})

const lineCount = computed(() => new Set(filteredData.value.map(r => r.line)).size)
const centerCount = computed(() => new Set(filteredData.value.map(r => r.center)).size)

const currentPage = ref(1)
const pageSize = ref(9)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  Object.assign(searchForm, { center: '', line: '', occurTime: '' })
  currentPage.value = 1
}
const handleExport = () => ElMessage.info('导出功能开发中...')

const viewVisible = ref(false)
const viewData = reactive({})
const handleView = (row) => {
  Object.assign(viewData, { ...row })
  viewVisible.value = true
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

  .ledger-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-md;
    margin-bottom: $spacing-md;

    .ledger-search {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      flex-wrap: wrap;
    }

    .ledger-actions {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .view-toggle {
        display: flex;
        border: 1px solid $border-color;
        border-radius: $border-radius-sm;
        overflow: hidden;

        .view-toggle-btn {
          padding: 6px 12px;
          cursor: pointer;
          color: $text-regular;
          background: #fff;
          transition: all 0.2s;

          &.active {
            background: $primary-color;
            color: #fff;
          }

          &:hover:not(.active) {
            background: $content-bg;
          }
        }
      }
    }
  }

  .ledger-stats {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
    padding: 12px 16px;
    margin-bottom: $spacing-md;
    background: linear-gradient(135deg, #eaf5f2, #f5faf8);
    border-radius: $border-radius-md;
    border: 1px solid #d8ece6;

    .stat-item {
      font-size: 14px;
      color: $text-regular;

      b {
        color: $primary-color;
        font-size: 18px;
        font-weight: 700;
      }
    }

    .stat-divider {
      width: 1px;
      height: 20px;
      background: $border-light;
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-md;

    .injury-card {
      background: #fff;
      border: 1px solid $border-light;
      border-radius: $border-radius-lg;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: $shadow-light;

      &:hover {
        box-shadow: 0 4px 16px rgba(45, 122, 110, 0.15);
        border-color: $primary-color;
        transform: translateY(-2px);
      }

      .card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid $border-light;

        .card-record-no {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 700;
          color: $text-primary;

          .record-icon {
            font-size: 16px;
          }
        }
      }

      .card-main {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .card-line-badge {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: $border-radius-md;
          background: linear-gradient(135deg, $primary-color, $primary-light);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-info {
          flex: 1;
          min-width: 0;

          .card-row {
            display: flex;
            align-items: center;
            margin-bottom: 6px;

            .card-label {
              flex-shrink: 0;
              font-size: 12px;
              color: $text-secondary;
              width: 56px;
            }

            .card-value {
              font-size: 13px;
              color: $text-primary;
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid $border-light;

        .card-muted {
          font-size: 12px;
          color: $text-secondary;
        }

        .card-detail {
          font-size: 12px;
          color: $primary-color;
          font-weight: 500;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: $spacing-md;
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $border-light;

    .total-text {
      color: $text-secondary;
      font-size: 14px;
    }
  }
}
</style>
