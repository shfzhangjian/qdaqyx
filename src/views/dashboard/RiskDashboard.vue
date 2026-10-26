<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="logo-area">
          <div class="logo-icon">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#00d4ff" stroke-width="2"/>
              <path d="M12 28 L20 8 L28 28 M15 22 h10" stroke="#00d4ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="company-name">青岛地铁集团有限公司</span>
        </div>
      </div>
      <h1 class="dashboard-title">
        <span class="title-decorator left"></span>
        隐患风险监测驾驶舱
        <span class="title-decorator right"></span>
      </h1>
      <div class="header-right">
        <div class="datetime-display">
          <span class="date">{{ currentDate }}</span>
          <span class="weekday">{{ currentWeekday }}</span>
          <span class="time">{{ currentTime }}</span>
        </div>
      </div>
    </header>

    <!-- 滚动通知栏 -->
    <div class="notice-bar">
      <div class="notice-icon">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#ffa502">
          <path d="M3 10h2v8H3zM19 10h2v8h-2zM5 18h14v2H5zM8 4l-3 6h14l-3-6z"/>
        </svg>
      </div>
      <div class="notice-scroll-wrapper">
        <div class="notice-scroll" :style="{ animationDuration: noticeScrollDuration }">
          <span v-for="(notice, idx) in notices" :key="idx" class="notice-item">
            <span v-if="notice.isNew" class="notice-badge">NEW</span>
            <span :class="['notice-level', 'level-' + notice.level]">{{ notice.levelText }}</span>
            {{ notice.content }}
          </span>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="dashboard-body">
      <!-- 左侧面板 -->
      <div class="panel-left">
        <!-- 风险等级分布 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="title-icon"></span>
            今日风险等级分布
          </div>
          <div class="risk-level-grid">
            <div v-for="level in riskLevels" :key="level.label"
                 :class="['risk-level-item', level.class]"
                 @click="showRiskDetail(level)">
              <div class="risk-count">{{ level.count }}</div>
              <div class="risk-label">{{ level.label }}</div>
            </div>
          </div>
        </div>

        <!-- 关键指标监测 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="title-icon"></span>
            关键指标实时监测
          </div>
          <div class="indicator-list">
            <div v-for="ind in indicators" :key="ind.id"
                 :class="['indicator-item', { 'indicator-alert': ind.status === 'alert', 'indicator-warning': ind.status === 'warning' }]">
              <div class="indicator-name">{{ ind.name }}</div>
              <div class="indicator-value-row">
                <span class="indicator-value" :class="'status-' + ind.status">{{ ind.value }}</span>
                <span class="indicator-unit">{{ ind.unit }}</span>
                <span class="indicator-threshold">阈值: {{ ind.threshold }}{{ ind.unit }}</span>
              </div>
              <div class="indicator-bar">
                <div class="indicator-bar-fill"
                     :style="{ width: Math.min(ind.value / ind.threshold * 100, 100) + '%' }"
                     :class="'bar-' + ind.status"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 隐患整改跟踪 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="title-icon"></span>
            隐患整改问题跟踪
          </div>
          <div class="hazard-stats-grid">
            <div class="hazard-stat-item stat-total">
              <div class="stat-number">{{ hazardStats.total }}</div>
              <div class="stat-label">总计</div>
            </div>
            <div class="hazard-stat-item stat-pending">
              <div class="stat-number">{{ hazardStats.pending }}</div>
              <div class="stat-label">待整改隐患</div>
            </div>
            <div class="hazard-stat-item stat-overdue">
              <div class="stat-number">{{ hazardStats.overdue }}</div>
              <div class="stat-label">超期未整改</div>
            </div>
            <div class="hazard-stat-item stat-resolved">
              <div class="stat-number">{{ hazardStats.resolved }}</div>
              <div class="stat-label">已整改隐患</div>
            </div>
          </div>
          <!-- 排查进度 -->
          <div class="inspection-progress">
            <div class="progress-label">
              <span>隐患排查总任务</span>
              <span class="progress-value">{{ hazardStats.inspectionDone }}/{{ hazardStats.inspectionTotal }}</span>
            </div>
            <div class="progress-bar-outer">
              <div class="progress-bar-inner" :style="{ width: inspectionPercent + '%' }">
                {{ inspectionPercent }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间面板 -->
      <div class="panel-center">
        <!-- 顶部Tab -->
        <div class="center-tabs">
          <div v-for="tab in centerTabs" :key="tab.key"
               :class="['tab-item', { active: activeTab === tab.key }]"
               @click="activeTab = tab.key">
            {{ tab.label }}
          </div>
        </div>

        <!-- 线路图区域 -->
        <div class="metro-map-area" v-show="activeTab === 'monitor'">
          <div class="map-container">
            <!-- 线路SVG -->
            <svg class="metro-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
              <!-- 网格背景 -->
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(44,119,209,0.08)" stroke-width="0.5"/>
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow-strong">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="800" height="500" fill="url(#grid)"/>

              <!-- 1号线 (蓝色 - 南北向) -->
              <polyline :points="line1Points" fill="none" stroke="#4fc3f7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
              <!-- 2号线 (橙色 - 东西向) -->
              <polyline :points="line2Points" fill="none" stroke="#ffb74d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
              <!-- 3号线 (绿色) -->
              <polyline :points="line3Points" fill="none" stroke="#81c784" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>

              <!-- 站点标记 -->
              <g v-for="station in allStations" :key="station.id"
                 class="station-group"
                 @click="handleStationClick(station)"
                 :style="{ cursor: 'pointer' }">
                <!-- 异常站点脉冲效果 -->
                <circle v-if="station.riskLevel === 'high' || station.riskLevel === 'major'"
                        :cx="station.x" :cy="station.y" r="16"
                        :fill="station.riskLevel === 'major' ? 'rgba(255,71,87,0.3)' : 'rgba(255,165,2,0.3)'"
                        class="pulse-ring"/>
                <!-- 站点圆点 -->
                <circle :cx="station.x" :cy="station.y" r="8"
                        :fill="getStationColor(station.riskLevel)"
                        stroke="#fff" stroke-width="2"
                        filter="url(#glow)"/>
                <!-- 站点名称 -->
                <text :x="station.x + (station.labelOffset?.x || 12)"
                      :y="station.y + (station.labelOffset?.y || -10)"
                      fill="#c8d6e5" font-size="11"
                      :text-anchor="station.labelOffset?.anchor || 'start'">
                  {{ station.name }}
                </text>
              </g>

              <!-- 线路标签 -->
              <g transform="translate(30, 470)">
                <rect x="0" y="0" width="12" height="12" rx="2" fill="#4fc3f7"/>
                <text x="18" y="11" fill="#c8d6e5" font-size="11">1号线</text>
                <rect x="70" y="0" width="12" height="12" rx="2" fill="#ffb74d"/>
                <text x="88" y="11" fill="#c8d6e5" font-size="11">2号线</text>
                <rect x="140" y="0" width="12" height="12" rx="2" fill="#81c784"/>
                <text x="158" y="11" fill="#c8d6e5" font-size="11">3号线</text>
              </g>
            </svg>

            <!-- 站点信息弹窗 -->
            <div v-if="selectedStation" class="station-popup" :style="stationPopupStyle">
              <div class="popup-header">
                <span class="popup-title">{{ selectedStation.name }}</span>
                <span class="popup-close" @click="selectedStation = null">&times;</span>
              </div>
              <div class="popup-body">
                <div class="popup-row">
                  <span class="popup-label">所属线路</span>
                  <span class="popup-value">{{ selectedStation.line }}</span>
                </div>
                <div class="popup-row">
                  <span class="popup-label">风险等级</span>
                  <span :class="['popup-value', 'risk-tag', 'tag-' + selectedStation.riskLevel]">
                    {{ getRiskLevelText(selectedStation.riskLevel) }}
                  </span>
                </div>
                <div class="popup-row" v-if="selectedStation.riskDesc">
                  <span class="popup-label">风险描述</span>
                  <span class="popup-value">{{ selectedStation.riskDesc }}</span>
                </div>
                <div class="popup-row" v-if="selectedStation.measures">
                  <span class="popup-label">管控措施</span>
                  <span class="popup-value">{{ selectedStation.measures }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 预警清单 -->
        <div class="warning-list-area" v-show="activeTab === 'warning'">
          <div class="warning-table">
            <table>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>预警时间</th>
                  <th>指标名称</th>
                  <th>当前值</th>
                  <th>阈值</th>
                  <th>风险等级</th>
                  <th>预警区域</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(warn, idx) in warningList" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ warn.time }}</td>
                  <td>{{ warn.indicator }}</td>
                  <td class="value-cell">{{ warn.currentValue }}</td>
                  <td>{{ warn.threshold }}</td>
                  <td>
                    <span :class="['level-badge', 'badge-' + warn.level]">{{ warn.levelText }}</span>
                  </td>
                  <td>{{ warn.area }}</td>
                  <td>
                    <span :class="['status-badge', warn.handled ? 'badge-handled' : 'badge-pending']">
                      {{ warn.handled ? '已处理' : '待处理' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 隐患排查 -->
        <div class="inspection-area" v-show="activeTab === 'inspection'">
          <div class="inspection-summary">
            <div class="summary-card" v-for="s in inspectionSummary" :key="s.label">
              <div class="summary-number" :style="{ color: s.color }">{{ s.value }}</div>
              <div class="summary-label">{{ s.label }}</div>
            </div>
          </div>
          <div class="warning-table">
            <table>
              <thead>
                <tr>
                  <th>序号</th>
                  <th>任务状态</th>
                  <th>隐患级别</th>
                  <th>隐患名称</th>
                  <th>隐患场所</th>
                  <th>所属线路</th>
                  <th>隐患分类</th>
                  <th>是否停运</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in inspectionList" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <span :class="['status-dot', item.done ? 'dot-done' : 'dot-pending']"></span>
                    {{ item.done ? '已完成' : '未完成' }}
                  </td>
                  <td>
                    <span :class="['level-badge', 'badge-' + item.level]">{{ item.levelText }}</span>
                  </td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.location }}</td>
                  <td>{{ item.line }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.shutdown ? '是' : '否' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="panel-right">
        <!-- 安全生产全要素 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="title-icon"></span>
            安全生产全要素
          </div>
          <div class="legend-row">
            <span class="legend-item"><span class="legend-dot dot-red"></span>风险</span>
            <span class="legend-item"><span class="legend-dot dot-orange"></span>异常</span>
            <span class="legend-item"><span class="legend-dot dot-green"></span>正常</span>
          </div>
          <div class="safety-elements">
            <div v-for="elem in safetyElements" :key="elem.name"
                 :class="['element-item', 'elem-' + elem.status]"
                 @click="handleElementClick(elem)">
              <span class="element-icon">{{ elem.icon }}</span>
              <span class="element-name">{{ elem.name }}</span>
            </div>
          </div>
        </div>

        <!-- 预警规则概览 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="title-icon"></span>
            预警规则概览
          </div>
          <div class="rule-flow">
            <div class="rule-step">
              <div class="step-box step-input">采集关键指标</div>
              <div class="step-arrow">▼</div>
            </div>
            <div class="rule-step">
              <div class="step-box step-check">实时阈值比对</div>
              <div class="step-arrow">▼</div>
            </div>
            <div class="rule-step">
              <div class="step-box step-judge">可能性判定模型</div>
              <div class="step-arrow">▼</div>
            </div>
            <div class="rule-branches">
              <div class="branch branch-major">重大风险 → 公司总经理</div>
              <div class="branch branch-significant">较大风险 → 中心总经理</div>
              <div class="branch branch-general">一般风险 → 部门经理</div>
            </div>
          </div>
        </div>

        <!-- 实时预警日志 -->
        <div class="panel-card flex-grow">
          <div class="card-title">
            <span class="title-icon"></span>
            实时预警日志
            <span class="log-count">{{ alertLogs.length }}</span>
          </div>
          <div class="alert-log-list">
            <div v-for="(log, idx) in alertLogs" :key="idx"
                 :class="['log-item', 'log-' + log.level]">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-content">{{ log.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部监控数据栏 -->
    <div class="dashboard-footer">
      <div class="footer-section monitor-section">
        <div class="section-title">各线路实时监控数据</div>
        <div class="monitor-cards">
          <div v-for="line in lineMonitorData" :key="line.name" class="monitor-card">
            <div class="monitor-card-title">
              <span class="line-dot" :style="{ background: line.color }"></span>
              {{ line.name }}
            </div>
            <div class="monitor-values">
              <div v-for="metric in line.metrics" :key="metric.label" class="metric-item">
                <span class="metric-label">{{ metric.label }}</span>
                <span :class="['metric-value', { 'metric-alert': metric.alert }]">{{ metric.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-section supply-section">
        <div class="section-title">应急物资配备</div>
        <div class="supply-cards">
          <div v-for="supply in emergencySupplies" :key="supply.name" class="supply-card">
            <div class="supply-name">{{ supply.name }}</div>
            <div class="supply-count">
              <span class="supply-number">{{ supply.count }}</span>
              <span :class="['supply-change', supply.change >= 0 ? 'change-up' : 'change-down']">
                {{ supply.change >= 0 ? '+' : '' }}{{ supply.change }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警弹窗 -->
    <transition name="alert-fade">
      <div v-if="activeAlert" class="alert-overlay" @click.self="dismissAlert">
        <div class="alert-dialog">
          <div class="alert-dialog-header">
            <div class="alert-flash"></div>
            <span class="alert-dialog-title">⚠ 指标异常预警</span>
            <span class="alert-dialog-close" @click="dismissAlert">&times;</span>
          </div>
          <div class="alert-dialog-body">
            <div class="alert-info-grid">
              <div class="alert-info-row">
                <span class="alert-label">预警指标</span>
                <span class="alert-value">{{ activeAlert.indicator }}</span>
              </div>
              <div class="alert-info-row">
                <span class="alert-label">当前值</span>
                <span class="alert-value alert-danger">{{ activeAlert.currentValue }}{{ activeAlert.unit }}</span>
              </div>
              <div class="alert-info-row">
                <span class="alert-label">预警阈值</span>
                <span class="alert-value">{{ activeAlert.threshold }}{{ activeAlert.unit }}</span>
              </div>
              <div class="alert-info-row">
                <span class="alert-label">风险等级</span>
                <span :class="['alert-value', 'alert-level-' + activeAlert.level]">{{ activeAlert.levelText }}</span>
              </div>
              <div class="alert-info-row">
                <span class="alert-label">预警区域</span>
                <span class="alert-value">{{ activeAlert.area }}</span>
              </div>
              <div class="alert-info-row">
                <span class="alert-label">潜在后果</span>
                <span class="alert-value">{{ activeAlert.consequence }}</span>
              </div>
            </div>
            <div class="alert-measures">
              <div class="measures-title">控制措施</div>
              <div class="measures-content">{{ activeAlert.measures }}</div>
            </div>
            <div class="alert-next-task">
              <div class="next-task-title">下一步任务</div>
              <div class="next-task-content">{{ activeAlert.nextTask }}</div>
            </div>
          </div>
          <div class="alert-dialog-footer">
            <button class="alert-btn btn-handle" @click="handleAlert">立即处理</button>
            <button class="alert-btn btn-defer" @click="deferAlert">稍后处理</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============ 时间显示 ============
const currentDate = ref('')
const currentTime = ref('')
const currentWeekday = ref('')
const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
let timeTimer = null

function updateTime() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${y}-${m}-${d}`
  currentWeekday.value = weekdays[now.getDay()]
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${h}:${min}:${s}`
}

// ============ 通知栏 ============
const notices = ref([
  { content: '1号线青岛北站车门闭锁机构检测异常，请相关部门及时排查', isNew: true, level: 'high', levelText: '较大风险' },
  { content: '关于开展全线网岗位风险隐患排查培训的通知', isNew: false, level: 'info', levelText: '通知' },
  { content: '3号线五四广场站消防设备月度巡检已完成', isNew: false, level: 'normal', levelText: '正常' },
  { content: '2号线李村公园站轨道缺陷检出2处，已安排整改', isNew: true, level: 'medium', levelText: '一般风险' },
])
const noticeScrollDuration = computed(() => (notices.value.length * 8) + 's')

// ============ 风险等级分布 ============
const riskLevels = ref([
  { label: '重大风险', count: 0, class: 'level-major' },
  { label: '较大风险', count: 2, class: 'level-significant' },
  { label: '一般风险', count: 6, class: 'level-general' },
  { label: '较小风险', count: 9, class: 'level-minor' },
  { label: '极小风险', count: 14, class: 'level-minimal' },
])

// ============ 关键指标监测 ============
const indicators = ref([
  { id: 1, name: '车门闭锁机构失效', unit: '次', value: 2, threshold: 3, status: 'warning' },
  { id: 2, name: '信号系统故障', unit: '次', value: 1, threshold: 3, status: 'normal' },
  { id: 3, name: '供电系统异常', unit: '次', value: 0, threshold: 2, status: 'normal' },
  { id: 4, name: '轨道缺陷检出', unit: '处', value: 2, threshold: 5, status: 'normal' },
  { id: 5, name: '站台门故障', unit: '次', value: 1, threshold: 2, status: 'normal' },
  { id: 6, name: '电扶梯异常', unit: '次', value: 0, threshold: 3, status: 'normal' },
])

// ============ 隐患统计 ============
const hazardStats = ref({
  total: 86,
  pending: 18,
  overdue: 2,
  resolved: 66,
  inspectionDone: 52,
  inspectionTotal: 80,
})
const inspectionPercent = computed(() =>
  Math.round(hazardStats.value.inspectionDone / hazardStats.value.inspectionTotal * 100)
)

// ============ 中间Tab ============
const centerTabs = [
  { key: 'monitor', label: '风险监测总览' },
  { key: 'warning', label: '预警清单' },
  { key: 'inspection', label: '隐患排查' },
]
const activeTab = ref('monitor')

// ============ 地铁线路站点数据 ============
const line1Points = '120,60 120,140 150,200 150,340 180,400 180,460'
const line2Points = '80,250 200,250 350,250 500,250 650,250 750,250'
const line3Points = '400,60 400,140 420,200 500,280 580,340 650,400 700,460'

const allStations = ref([
  // 1号线站点
  { id: 's1-1', name: '青岛北站', line: '1号线', x: 120, y: 60, riskLevel: 'normal', labelOffset: { x: 14, y: 5 } },
  { id: 's1-2', name: '海泊桥', line: '1号线', x: 120, y: 140, riskLevel: 'low', labelOffset: { x: 14, y: 5 } },
  { id: 's1-3', name: '台东', line: '1号线', x: 150, y: 200, riskLevel: 'high', labelOffset: { x: -40, y: -10 },
    riskDesc: '车门闭锁机构近一年累计失效2次，接近阈值', measures: '加强车门系统日检，安排专项巡检' },
  { id: 's1-4', name: '中山路', line: '1号线', x: 150, y: 340, riskLevel: 'normal', labelOffset: { x: -50, y: 5 } },
  { id: 's1-5', name: '团岛', line: '1号线', x: 180, y: 400, riskLevel: 'normal', labelOffset: { x: -40, y: -10 } },
  { id: 's1-6', name: '黄岛', line: '1号线', x: 180, y: 460, riskLevel: 'low', labelOffset: { x: 14, y: 5 } },
  // 2号线站点
  { id: 's2-1', name: '李村公园', line: '2号线', x: 80, y: 250, riskLevel: 'medium', labelOffset: { x: -10, y: -14 },
    riskDesc: '轨道缺陷检出2处', measures: '已安排夜间维修作业' },
  { id: 's2-2', name: '双山', line: '2号线', x: 200, y: 250, riskLevel: 'normal', labelOffset: { x: -10, y: -14 } },
  { id: 's2-3', name: '五四广场', line: '2号线', x: 350, y: 250, riskLevel: 'normal', labelOffset: { x: -20, y: -14 } },
  { id: 's2-4', name: '燕儿岛路', line: '2号线', x: 500, y: 250, riskLevel: 'low', labelOffset: { x: -20, y: -14 } },
  { id: 's2-5', name: '麦岛', line: '2号线', x: 650, y: 250, riskLevel: 'normal', labelOffset: { x: -10, y: -14 } },
  { id: 's2-6', name: '苗岭路', line: '2号线', x: 750, y: 250, riskLevel: 'normal', labelOffset: { x: -10, y: -14 } },
  // 3号线站点
  { id: 's3-1', name: '青岛站', line: '3号线', x: 400, y: 60, riskLevel: 'normal', labelOffset: { x: 14, y: 5 } },
  { id: 's3-2', name: '人民会堂', line: '3号线', x: 400, y: 140, riskLevel: 'normal', labelOffset: { x: 14, y: 5 } },
  { id: 's3-3', name: '汇泉广场', line: '3号线', x: 420, y: 200, riskLevel: 'low', labelOffset: { x: 14, y: 5 } },
  { id: 's3-4', name: '太平角公园', line: '3号线', x: 500, y: 280, riskLevel: 'normal', labelOffset: { x: 14, y: -8 } },
  { id: 's3-5', name: '延安三路', line: '3号线', x: 580, y: 340, riskLevel: 'normal', labelOffset: { x: 14, y: 5 } },
  { id: 's3-6', name: '清江路', line: '3号线', x: 650, y: 400, riskLevel: 'low', labelOffset: { x: 14, y: 5 } },
  { id: 's3-7', name: '双山站', line: '3号线', x: 700, y: 460, riskLevel: 'normal', labelOffset: { x: 14, y: 5 } },
])

const selectedStation = ref(null)
const stationPopupStyle = computed(() => {
  if (!selectedStation.value) return {}
  const mapEl = document.querySelector('.map-container')
  if (!mapEl) return {}
  const rect = mapEl.getBoundingClientRect()
  const svgEl = document.querySelector('.metro-svg')
  if (!svgEl) return {}
  const svgRect = svgEl.getBoundingClientRect()
  const scaleX = svgRect.width / 800
  const scaleY = svgRect.height / 500
  const left = svgRect.left - rect.left + selectedStation.value.x * scaleX + 20
  const top = svgRect.top - rect.top + selectedStation.value.y * scaleY - 40
  return {
    left: Math.min(left, rect.width - 300) + 'px',
    top: Math.max(top, 10) + 'px',
  }
})

function getStationColor(level) {
  const colors = { major: '#ff4757', high: '#ff6348', medium: '#ffa502', low: '#70a1ff', normal: '#2ed573' }
  return colors[level] || '#2ed573'
}
function getRiskLevelText(level) {
  const texts = { major: '重大风险', high: '较大风险', medium: '一般风险', low: '较小风险', normal: '正常' }
  return texts[level] || '正常'
}
function handleStationClick(station) {
  selectedStation.value = selectedStation.value?.id === station.id ? null : station
}

// ============ 预警清单数据 ============
const warningList = ref([
  { time: '10:25:03', indicator: '车门闭锁机构失效', currentValue: '2次', threshold: '3次', level: 'high', levelText: '较大风险', area: '1号线 台东站', handled: false },
  { time: '09:48:21', indicator: '轨道缺陷检出', currentValue: '2处', threshold: '5处', level: 'medium', levelText: '一般风险', area: '2号线 李村公园站', handled: true },
  { time: '09:15:40', indicator: '站台门故障', currentValue: '1次', threshold: '2次', level: 'low', levelText: '较小风险', area: '3号线 汇泉广场站', handled: true },
  { time: '08:30:12', indicator: '电扶梯异常', currentValue: '1次', threshold: '3次', level: 'low', levelText: '较小风险', area: '1号线 青岛北站', handled: true },
  { time: '昨日 17:45', indicator: '信号系统故障', currentValue: '1次', threshold: '3次', level: 'low', levelText: '较小风险', area: '2号线 五四广场站', handled: true },
])

// ============ 隐患排查数据 ============
const inspectionSummary = computed(() => [
  { label: '任务总数', value: hazardStats.value.inspectionTotal, color: '#00d4ff' },
  { label: '已完成', value: hazardStats.value.inspectionDone, color: '#2ed573' },
  { label: '未完成', value: hazardStats.value.inspectionTotal - hazardStats.value.inspectionDone, color: '#ffa502' },
  { label: '超期', value: hazardStats.value.overdue, color: '#ff4757' },
])
const inspectionList = ref([
  { done: true, level: 'high', levelText: '1级', name: '电缆裸露，开关破损', location: '台东站配电室', line: '1号线', category: '设备设施', shutdown: false },
  { done: true, level: 'medium', levelText: '3级', name: '消防通道堆放杂物', location: '李村公园站', line: '2号线', category: '环境安全', shutdown: false },
  { done: false, level: 'high', levelText: '1级', name: '应急照明灯故障', location: '五四广场站', line: '2号线', category: '消防安全', shutdown: false },
  { done: false, level: 'medium', levelText: '3级', name: '防火门闭合器损坏', location: '青岛站', line: '3号线', category: '消防安全', shutdown: false },
])

// ============ 安全生产全要素 ============
const safetyElements = ref([
  { name: '人员风险管控', icon: '👥', status: 'risk' },
  { name: '设备安全管控', icon: '⚙', status: 'warning' },
  { name: '环境安全管控', icon: '🌡', status: 'normal' },
  { name: '行车安全监测', icon: '🚇', status: 'risk' },
  { name: '职业健康监测', icon: '💊', status: 'normal' },
  { name: '安全培训管理', icon: '📋', status: 'normal' },
  { name: '隐患排查治理', icon: '⚠', status: 'warning' },
  { name: '危险源管控', icon: '☢', status: 'normal' },
  { name: '消防安全管控', icon: '🧯', status: 'normal' },
  { name: '风险评估管理', icon: '📊', status: 'normal' },
])

// ============ 预警日志 ============
const alertLogs = ref([
  { time: '10:25', content: '1号线台东站车门闭锁机构失效次数达到2次', level: 'high' },
  { time: '09:48', content: '2号线李村公园站轨道缺陷检出已处理', level: 'normal' },
  { time: '09:15', content: '3号线汇泉广场站站台门故障已修复', level: 'normal' },
  { time: '08:30', content: '1号线青岛北站电扶梯异常已恢复', level: 'normal' },
  { time: '08:00', content: '系统启动，全线网指标监测正常', level: 'info' },
])

// ============ 底部监控数据 ============
const lineMonitorData = ref([
  {
    name: '1号线', color: '#4fc3f7',
    metrics: [
      { label: '隧道温度', value: '28.5°C', alert: false },
      { label: '湿度', value: '62%', alert: false },
      { label: '烟雾浓度', value: '0.02%', alert: false },
      { label: 'CO浓度', value: '12ppm', alert: false },
    ]
  },
  {
    name: '2号线', color: '#ffb74d',
    metrics: [
      { label: '隧道温度', value: '29.1°C', alert: false },
      { label: '湿度', value: '65%', alert: false },
      { label: '烟雾浓度', value: '0.01%', alert: false },
      { label: 'CO浓度', value: '8ppm', alert: false },
    ]
  },
  {
    name: '3号线', color: '#81c784',
    metrics: [
      { label: '隧道温度', value: '27.8°C', alert: false },
      { label: '湿度', value: '58%', alert: false },
      { label: '烟雾浓度', value: '0.03%', alert: false },
      { label: 'CO浓度', value: '15ppm', alert: false },
    ]
  },
])

const emergencySupplies = ref([
  { name: '灭火器', count: 156, change: 0 },
  { name: '防毒面具', count: 88, change: 2 },
  { name: '应急灯', count: 210, change: -3 },
  { name: '急救箱', count: 64, change: 0 },
  { name: '防护服', count: 42, change: 0 },
  { name: '应急水源', count: 120, change: 5 },
])

// ============ 预警弹窗逻辑 ============
const activeAlert = ref(null)
const alertQueue = ref([])

function triggerAlert(alertData) {
  alertQueue.value.push(alertData)
  if (!activeAlert.value) {
    showNextAlert()
  }
}
function showNextAlert() {
  if (alertQueue.value.length > 0) {
    activeAlert.value = alertQueue.value.shift()
  }
}
function dismissAlert() {
  activeAlert.value = null
  showNextAlert()
}
function handleAlert() {
  if (activeAlert.value) {
    alertLogs.value.unshift({
      time: currentTime.value.slice(0, 5),
      content: `${activeAlert.value.area} ${activeAlert.value.indicator} 已安排处理`,
      level: 'normal'
    })
  }
  dismissAlert()
}
function deferAlert() {
  if (activeAlert.value) {
    alertLogs.value.unshift({
      time: currentTime.value.slice(0, 5),
      content: `${activeAlert.value.area} ${activeAlert.value.indicator} 延后处理`,
      level: 'warning'
    })
  }
  dismissAlert()
}

// ============ 模拟实时数据更新 & 预警触发 ============
let dataTimer = null
function simulateDataUpdate() {
  const idx = Math.floor(Math.random() * indicators.value.length)
  const ind = indicators.value[idx]
  const change = Math.random() > 0.7 ? 1 : (Math.random() > 0.5 ? 0 : -0.5)
  ind.value = Math.max(0, Math.round((ind.value + change) * 10) / 10)

  if (ind.value >= ind.threshold) {
    ind.status = 'alert'
    const ratio = ind.value / ind.threshold
    let level, levelText
    if (ratio >= 2) { level = 'major'; levelText = '重大风险' }
    else if (ratio >= 1.5) { level = 'high'; levelText = '较大风险' }
    else { level = 'medium'; levelText = '一般风险' }

    triggerAlert({
      indicator: ind.name,
      currentValue: ind.value,
      unit: ind.unit,
      threshold: ind.threshold,
      level,
      levelText,
      area: getRandomArea(),
      consequence: getConsequence(ind.name),
      measures: getMeasures(ind.name),
      nextTask: getNextTask(ind.name, levelText),
    })

    alertLogs.value.unshift({
      time: currentTime.value.slice(0, 5),
      content: `${ind.name}达到${ind.value}${ind.unit}，超过阈值${ind.threshold}${ind.unit}`,
      level: level
    })
    if (alertLogs.value.length > 20) alertLogs.value.pop()

    warningList.value.unshift({
      time: currentTime.value,
      indicator: ind.name,
      currentValue: ind.value + ind.unit,
      threshold: ind.threshold + ind.unit,
      level,
      levelText,
      area: getRandomArea(),
      handled: false,
    })
  } else if (ind.value >= ind.threshold * 0.7) {
    ind.status = 'warning'
  } else {
    ind.status = 'normal'
  }
}

function getRandomArea() {
  const areas = ['1号线 台东站', '1号线 青岛北站', '2号线 李村公园站', '2号线 五四广场站', '3号线 汇泉广场站', '3号线 青岛站']
  return areas[Math.floor(Math.random() * areas.length)]
}
function getConsequence(name) {
  const map = {
    '车门闭锁机构失效': '车门异常打开乘客坠轨可能导致人员伤亡',
    '信号系统故障': '列车运行安全受影响，可能导致追尾或脱轨',
    '供电系统异常': '列车停运，乘客滞留隧道，存在安全隐患',
    '轨道缺陷检出': '列车脱轨风险，影响行车安全',
    '站台门故障': '乘客坠入轨道区域风险',
    '电扶梯异常': '乘客摔倒受伤风险',
  }
  return map[name] || '存在安全隐患'
}
function getMeasures(name) {
  const map = {
    '车门闭锁机构失效': '立即安排车辆段专项检修，加强运营期间车门状态监控，必要时更换闭锁机构',
    '信号系统故障': '启动信号降级运行方案，安排信号专业人员现场排查，加密行车间隔监控',
    '供电系统异常': '切换备用供电回路，通知调度中心做好限速或停运准备',
    '轨道缺陷检出': '对缺陷区段设置限速，安排夜间天窗维修作业',
    '站台门故障': '安排站台岗加强瞭望，维修人员到场排查，必要时停用故障门',
    '电扶梯异常': '立即停机检查，设置安全围挡，引导乘客使用楼梯',
  }
  return map[name] || '安排相关部门排查处理'
}
function getNextTask(name, levelText) {
  if (levelText === '重大风险') {
    return '1. 立即上报公司总经理；2. 启动应急预案；3. 成立专项检查组；4. 24小时内提交处理报告'
  } else if (levelText === '较大风险') {
    return '1. 上报中心总经理；2. 安排专业人员现场处置；3. 48小时内完成整改并复查'
  }
  return '1. 通知部门经理；2. 安排计划性维修；3. 一周内完成整改'
}

function showRiskDetail(level) {
  activeTab.value = 'warning'
}
function handleElementClick(elem) {
  if (elem.status !== 'normal') {
    activeTab.value = 'warning'
  }
}

// ============ 生命周期 ============
onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  dataTimer = setInterval(simulateDataUpdate, 12000)
})
onUnmounted(() => {
  clearInterval(timeTimer)
  clearInterval(dataTimer)
})
</script>

<style scoped>
/* ============ 全局容器 ============ */
.dashboard-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #0a1628 100%);
  color: #c8d6e5;
  font-family: 'Microsoft YaHei', 'PingFang SC', -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ============ 顶部标题 ============ */
.dashboard-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: linear-gradient(180deg, rgba(6,30,65,0.95) 0%, rgba(6,30,65,0.7) 100%);
  border-bottom: 1px solid rgba(0,180,255,0.25);
  position: relative;
  z-index: 10;
}
.header-left { display: flex; align-items: center; }
.logo-area { display: flex; align-items: center; gap: 10px; }
.company-name { color: #e8f0fe; font-size: 15px; letter-spacing: 1px; }
.dashboard-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 6px;
  background: linear-gradient(180deg, #ffffff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}
.title-decorator {
  display: inline-block;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff);
}
.title-decorator.right { background: linear-gradient(90deg, #00d4ff, transparent); }
.header-right { display: flex; align-items: center; }
.datetime-display { display: flex; gap: 12px; align-items: baseline; }
.datetime-display .date { color: #a0c4e8; font-size: 16px; }
.datetime-display .weekday { color: #6bb3e0; font-size: 14px; }
.datetime-display .time { color: #00d4ff; font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* ============ 通知栏 ============ */
.notice-bar {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: rgba(0,60,120,0.3);
  border-bottom: 1px solid rgba(0,180,255,0.1);
  overflow: hidden;
}
.notice-icon { margin-right: 8px; flex-shrink: 0; }
.notice-scroll-wrapper { flex: 1; overflow: hidden; white-space: nowrap; }
.notice-scroll {
  display: inline-block;
  animation: scrollNotice linear infinite;
  white-space: nowrap;
}
@keyframes scrollNotice {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.notice-item { margin-right: 80px; font-size: 13px; }
.notice-badge {
  background: #ff4757;
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  margin-right: 6px;
  font-weight: 700;
}
.notice-level {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  margin-right: 6px;
}
.notice-level.level-high { background: rgba(255,99,72,0.3); color: #ff6348; }
.notice-level.level-medium { background: rgba(255,165,2,0.3); color: #ffa502; }
.notice-level.level-info { background: rgba(0,180,255,0.2); color: #00b4ff; }
.notice-level.level-normal { background: rgba(46,213,115,0.2); color: #2ed573; }

/* ============ 主体三列布局 ============ */
.dashboard-body {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
  min-height: 0;
}
.panel-left { width: 22%; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.panel-center { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.panel-right { width: 22%; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }

/* ============ 面板卡片 ============ */
.panel-card {
  background: rgba(6,30,65,0.7);
  border: 1px solid rgba(44,119,209,0.25);
  border-radius: 6px;
  padding: 12px;
  position: relative;
}
.panel-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00b4ff, transparent);
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #00d4ff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.title-icon {
  width: 3px;
  height: 14px;
  background: #00b4ff;
  border-radius: 2px;
}

/* ============ 风险等级分布 ============ */
.risk-level-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.risk-level-item {
  text-align: center;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}
.risk-level-item:hover { transform: scale(1.05); }
.risk-count { font-size: 24px; font-weight: 700; }
.risk-label { font-size: 11px; margin-top: 4px; opacity: 0.9; }
.level-major { background: rgba(255,0,0,0.25); color: #ff4757; border: 1px solid rgba(255,0,0,0.4); }
.level-significant { background: rgba(255,107,0,0.2); color: #ff6b35; border: 1px solid rgba(255,107,0,0.35); }
.level-general { background: rgba(255,200,0,0.15); color: #ffc800; border: 1px solid rgba(255,200,0,0.3); }
.level-minor { background: rgba(0,140,255,0.15); color: #4fc3f7; border: 1px solid rgba(0,140,255,0.3); }
.level-minimal { background: rgba(46,213,115,0.15); color: #2ed573; border: 1px solid rgba(46,213,115,0.3); }

/* ============ 关键指标监测 ============ */
.indicator-list { display: flex; flex-direction: column; gap: 8px; }
.indicator-item {
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(44,119,209,0.15);
  transition: all 0.3s;
}
.indicator-alert {
  border-color: rgba(255,71,87,0.5) !important;
  background: rgba(255,71,87,0.08) !important;
  animation: alertPulse 1.5s ease-in-out infinite;
}
.indicator-warning {
  border-color: rgba(255,165,2,0.4) !important;
  background: rgba(255,165,2,0.06) !important;
}
@keyframes alertPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,71,87,0); }
  50% { box-shadow: 0 0 12px 2px rgba(255,71,87,0.3); }
}
.indicator-name { font-size: 12px; color: #a0c4e8; margin-bottom: 4px; }
.indicator-value-row { display: flex; align-items: baseline; gap: 4px; }
.indicator-value { font-size: 20px; font-weight: 700; }
.indicator-value.status-normal { color: #2ed573; }
.indicator-value.status-warning { color: #ffa502; }
.indicator-value.status-alert { color: #ff4757; }
.indicator-unit { font-size: 11px; color: #6bb3e0; }
.indicator-threshold { font-size: 11px; color: #556b8a; margin-left: auto; }
.indicator-bar {
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}
.indicator-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
.bar-normal { background: #2ed573; }
.bar-warning { background: #ffa502; }
.bar-alert { background: #ff4757; }

/* ============ 隐患整改跟踪 ============ */
.hazard-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.hazard-stat-item {
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(44,119,209,0.2);
}
.stat-number { font-size: 28px; font-weight: 700; }
.stat-label { font-size: 11px; margin-top: 2px; opacity: 0.7; }
.stat-total { border-color: rgba(0,180,255,0.3); }
.stat-total .stat-number { color: #00d4ff; }
.stat-pending { border-color: rgba(255,165,2,0.3); }
.stat-pending .stat-number { color: #ffa502; }
.stat-overdue { border-color: rgba(255,71,87,0.3); }
.stat-overdue .stat-number { color: #ff4757; }
.stat-resolved { border-color: rgba(46,213,115,0.3); }
.stat-resolved .stat-number { color: #2ed573; }

.inspection-progress { margin-top: 4px; }
.progress-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
.progress-value { color: #00d4ff; font-weight: 600; }
.progress-bar-outer {
  height: 20px;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  overflow: hidden;
}
.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #00b4ff, #00d4ff);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
  font-weight: 600;
  transition: width 0.5s;
}

/* ============ 中间Tab ============ */
.center-tabs {
  display: flex;
  gap: 0;
  background: rgba(6,30,65,0.5);
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  cursor: pointer;
  color: #6bb3e0;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  position: relative;
}
.tab-item:hover { color: #00d4ff; background: rgba(0,180,255,0.05); }
.tab-item.active {
  color: #00d4ff;
  font-weight: 600;
  border-bottom-color: #00d4ff;
  background: rgba(0,180,255,0.1);
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 30%; right: 30%;
  height: 2px;
  background: #00d4ff;
  box-shadow: 0 0 8px #00d4ff;
}

/* ============ 地铁线路图 ============ */
.metro-map-area {
  flex: 1;
  background: rgba(6,30,65,0.7);
  border: 1px solid rgba(44,119,209,0.2);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  position: relative;
}
.map-container { width: 100%; height: 100%; position: relative; }
.metro-svg { width: 100%; height: 100%; }
.station-group { cursor: pointer; }
.pulse-ring { animation: stationPulse 2s ease-in-out infinite; }
@keyframes stationPulse {
  0% { r: 10; opacity: 0.8; }
  100% { r: 24; opacity: 0; }
}

/* 站点弹窗 */
.station-popup {
  position: absolute;
  width: 260px;
  background: rgba(10,30,60,0.95);
  border: 1px solid rgba(0,180,255,0.4);
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 20;
  overflow: hidden;
}
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0,100,200,0.2);
  border-bottom: 1px solid rgba(0,180,255,0.2);
}
.popup-title { font-weight: 600; color: #00d4ff; font-size: 13px; }
.popup-close { cursor: pointer; color: #6bb3e0; font-size: 18px; line-height: 1; }
.popup-close:hover { color: #ff4757; }
.popup-body { padding: 10px 12px; }
.popup-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.popup-label { color: #6bb3e0; }
.popup-value { color: #e8f0fe; max-width: 150px; text-align: right; }
.risk-tag { padding: 1px 8px; border-radius: 3px; font-size: 11px; }
.tag-major { background: rgba(255,0,0,0.3); color: #ff4757; }
.tag-high { background: rgba(255,99,72,0.3); color: #ff6348; }
.tag-medium { background: rgba(255,165,2,0.3); color: #ffa502; }
.tag-low { background: rgba(0,140,255,0.2); color: #4fc3f7; }
.tag-normal { background: rgba(46,213,115,0.2); color: #2ed573; }

/* ============ 预警清单表格 & 隐患排查表格 ============ */
.warning-list-area, .inspection-area {
  flex: 1;
  background: rgba(6,30,65,0.7);
  border: 1px solid rgba(44,119,209,0.2);
  border-radius: 0 0 6px 6px;
  padding: 12px;
  overflow-y: auto;
}
.inspection-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}
.summary-card {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(44,119,209,0.2);
  border-radius: 6px;
}
.summary-number { font-size: 28px; font-weight: 700; }
.summary-label { font-size: 12px; color: #6bb3e0; margin-top: 4px; }
.warning-table { width: 100%; overflow-x: auto; }
.warning-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.warning-table th {
  background: rgba(0,60,120,0.4);
  color: #a0c4e8;
  padding: 10px 12px;
  text-align: left;
  font-weight: 500;
  border-bottom: 1px solid rgba(44,119,209,0.3);
  white-space: nowrap;
}
.warning-table td {
  padding: 9px 12px;
  border-bottom: 1px solid rgba(44,119,209,0.1);
  white-space: nowrap;
}
.warning-table tr:hover td { background: rgba(0,100,200,0.08); }
.value-cell { color: #ffa502; font-weight: 600; }
.level-badge {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}
.badge-major { background: rgba(255,0,0,0.3); color: #ff4757; }
.badge-high { background: rgba(255,99,72,0.3); color: #ff6348; }
.badge-medium { background: rgba(255,165,2,0.3); color: #ffa502; }
.badge-low { background: rgba(0,140,255,0.2); color: #4fc3f7; }
.status-badge {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
}
.badge-handled { background: rgba(46,213,115,0.2); color: #2ed573; }
.badge-pending { background: rgba(255,165,2,0.2); color: #ffa502; }
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.dot-done { background: #2ed573; }
.dot-pending { background: #ffa502; }

/* ============ 安全生产全要素 ============ */
.legend-row { display: flex; gap: 14px; margin-bottom: 10px; justify-content: flex-end; }
.legend-item { font-size: 11px; display: flex; align-items: center; gap: 4px; }
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-red { background: #ff4757; }
.dot-orange { background: #ffa502; }
.dot-green { background: #2ed573; }
.safety-elements { display: flex; flex-direction: column; gap: 6px; }
.element-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.element-item:hover { background: rgba(255,255,255,0.05); }
.element-icon { font-size: 16px; width: 24px; text-align: center; }
.elem-normal { border-left: 3px solid #2ed573; }
.elem-warning { border-left: 3px solid #ffa502; color: #ffa502; }
.elem-risk { border-left: 3px solid #ff4757; color: #ff4757; }

/* ============ 预警规则概览 ============ */
.rule-flow { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.rule-step { display: flex; flex-direction: column; align-items: center; }
.step-box {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  border: 1px solid rgba(0,180,255,0.3);
}
.step-input { background: rgba(0,180,255,0.1); color: #00d4ff; }
.step-check { background: rgba(255,165,2,0.1); color: #ffa502; border-color: rgba(255,165,2,0.3); }
.step-judge { background: rgba(129,199,132,0.1); color: #81c784; border-color: rgba(129,199,132,0.3); }
.step-arrow { color: #4a6785; font-size: 12px; line-height: 1.2; }
.rule-branches {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin-top: 4px;
}
.branch {
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 11px;
  text-align: center;
}
.branch-major { background: rgba(255,71,87,0.15); color: #ff4757; border: 1px solid rgba(255,71,87,0.3); }
.branch-significant { background: rgba(255,165,2,0.12); color: #ffa502; border: 1px solid rgba(255,165,2,0.25); }
.branch-general { background: rgba(0,180,255,0.1); color: #4fc3f7; border: 1px solid rgba(0,180,255,0.2); }

/* ============ 预警日志 ============ */
.flex-grow { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.log-count {
  margin-left: auto;
  background: rgba(255,71,87,0.2);
  color: #ff4757;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.alert-log-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.log-item {
  padding: 6px 8px;
  border-radius: 3px;
  font-size: 11px;
  display: flex;
  gap: 8px;
  border-left: 2px solid;
}
.log-time { color: #556b8a; white-space: nowrap; min-width: 40px; }
.log-content { flex: 1; }
.log-high { border-color: #ff4757; background: rgba(255,71,87,0.05); }
.log-medium { border-color: #ffa502; background: rgba(255,165,2,0.05); }
.log-warning { border-color: #ffa502; background: rgba(255,165,2,0.05); }
.log-normal { border-color: #2ed573; background: rgba(46,213,115,0.05); }
.log-info { border-color: #4fc3f7; background: rgba(79,195,247,0.05); }
.log-major { border-color: #ff4757; background: rgba(255,71,87,0.08); }

/* ============ 底部栏 ============ */
.dashboard-footer {
  display: flex;
  gap: 12px;
  padding: 0 12px 10px 12px;
  flex-shrink: 0;
}
.footer-section {
  background: rgba(6,30,65,0.7);
  border: 1px solid rgba(44,119,209,0.2);
  border-radius: 6px;
  padding: 10px 14px;
}
.monitor-section { flex: 3; }
.supply-section { flex: 2; }
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #00d4ff;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0,180,255,0.15);
}
.monitor-cards { display: flex; gap: 12px; }
.monitor-card {
  flex: 1;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(44,119,209,0.15);
  border-radius: 4px;
  padding: 8px 10px;
}
.monitor-card-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0c4e8;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.line-dot { width: 10px; height: 10px; border-radius: 2px; }
.monitor-values { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.metric-item { display: flex; justify-content: space-between; font-size: 11px; padding: 2px 0; }
.metric-label { color: #556b8a; }
.metric-value { color: #e8f0fe; font-weight: 500; }
.metric-alert { color: #ff4757 !important; font-weight: 700; }
.supply-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.supply-card {
  text-align: center;
  padding: 8px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(44,119,209,0.15);
  border-radius: 4px;
}
.supply-name { font-size: 11px; color: #6bb3e0; margin-bottom: 4px; }
.supply-count { display: flex; justify-content: center; align-items: baseline; gap: 4px; }
.supply-number { font-size: 22px; font-weight: 700; color: #00d4ff; }
.supply-change { font-size: 12px; font-weight: 600; }
.change-up { color: #2ed573; }
.change-down { color: #ff4757; }

/* ============ 预警弹窗 ============ */
.alert-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.alert-dialog {
  width: 520px;
  background: linear-gradient(135deg, #0d2137 0%, #162d50 100%);
  border: 1px solid rgba(255,71,87,0.5);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(255,71,87,0.2);
  animation: dialogAppear 0.3s ease-out;
}
@keyframes dialogAppear {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.alert-dialog-header {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: rgba(255,71,87,0.12);
  border-bottom: 1px solid rgba(255,71,87,0.3);
  position: relative;
  overflow: hidden;
}
.alert-flash {
  position: absolute;
  top: 0; left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,71,87,0.1), transparent);
  animation: flashSweep 2s linear infinite;
}
@keyframes flashSweep {
  0% { left: -50%; }
  100% { left: 150%; }
}
.alert-dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: #ff4757;
  position: relative;
}
.alert-dialog-close {
  margin-left: auto;
  cursor: pointer;
  color: #6bb3e0;
  font-size: 22px;
  line-height: 1;
  position: relative;
}
.alert-dialog-close:hover { color: #ff4757; }
.alert-dialog-body { padding: 18px; }
.alert-info-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.alert-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 4px;
  font-size: 13px;
}
.alert-label { color: #6bb3e0; }
.alert-value { color: #e8f0fe; font-weight: 500; }
.alert-danger { color: #ff4757 !important; font-weight: 700; font-size: 16px; }
.alert-level-major { color: #ff4757 !important; font-weight: 700; }
.alert-level-high { color: #ff6348 !important; font-weight: 700; }
.alert-level-medium { color: #ffa502 !important; font-weight: 700; }
.alert-measures, .alert-next-task {
  background: rgba(0,60,120,0.2);
  border: 1px solid rgba(0,180,255,0.15);
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.measures-title, .next-task-title {
  font-size: 12px;
  color: #00d4ff;
  font-weight: 600;
  margin-bottom: 6px;
}
.measures-content, .next-task-content { font-size: 12px; line-height: 1.8; color: #c8d6e5; }
.alert-dialog-footer {
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  border-top: 1px solid rgba(44,119,209,0.2);
  justify-content: flex-end;
}
.alert-btn {
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-handle {
  background: linear-gradient(135deg, #ff4757, #ff6348);
  color: #fff;
}
.btn-handle:hover { box-shadow: 0 0 16px rgba(255,71,87,0.4); }
.btn-defer {
  background: rgba(255,255,255,0.08);
  color: #a0c4e8;
  border: 1px solid rgba(44,119,209,0.3);
}
.btn-defer:hover { background: rgba(255,255,255,0.12); }

/* ============ 过渡动画 ============ */
.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity 0.3s; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; }

/* ============ 滚动条美化 ============ */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.3); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,180,255,0.5); }
</style>
