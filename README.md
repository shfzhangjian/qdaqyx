# 智慧运营一体化管理平台 · 安全生产管理（qdaqyx）

青岛地铁「智慧运营一体化管理平台」**安全生产管理**模块。当前仓库包含**两套并行的实现**：

1. **`index.html`（主入口，可直接运行）** —— 约 6.15 万行、4.1 MB 的**单文件高保真原型**，覆盖 17 个菜单域、77 个页面，框架全部走 CDN，**无需任何构建工具**即可打开。
2. **`src/`（工程化重构，暂不可运行）** —— 把原型逐页迁成 Vue 3 单文件组件的工程版，目前**缺少工程配置**（`package.json` / `vite.config.js` / 工程版 HTML 入口均缺失，历史上由 `npm run build` 构建），需补齐后才能编译，见 §5。

**后期开发的主线 = 以 `index.html` 为需求原型基线，把各页面持续迁入 `src/` 工程。** 本文档即交接说明。

---

## 1. 目录结构

```
qdaqyx/
├─ index.html        主入口：单文件原型（77 页，CDN 驱动，双击/静态服务器即可运行）
├─ serve.mjs         零依赖本地静态服务器（node serve.mjs → http://127.0.0.1:5173/）
└─ src/              Vue3 工程版（重构中，缺工程配置，暂不可编译运行）
   ├─ main.js        入口：注册 Element Plus（zh-cn）、全部图标、Pinia、Router
   ├─ App.vue        根组件（router-view）
   ├─ router/
   │  └─ index.js    路由表：'/' → 重定向 /risk-dashboard；
   │                 '/app' → MainLayout 布局 + 8 个业务子路由；
   │                 '/risk-dashboard' 全屏大屏独立于布局
   ├─ layouts/
   │  └─ MainLayout.vue  管理台框架：绿色顶栏 + 侧边 el-menu + 内容区 router-view
   ├─ stores/
   │  └─ passengerInjury.js  客伤跨页共享状态（详见 §4.13，非 Pinia，reactive 单例）
   ├─ styles/
   │  ├─ variables.scss  设计变量（绿色主题 #2d7a6e / #3faa9a，尺寸、间距、阴影）
   │  └─ index.scss      全局重置 + Element Plus 覆盖（成功按钮、卡片、表格）
   └─ views/         页面组件（与原型页一一对应，仅实现了第一批）
      ├─ dashboard/RiskDashboard.vue                    隐患风险监测驾驶舱（全屏大屏）
      ├─ hidden-danger/HiddenDangerDatabase.vue         隐患排查标准库（已注册路由，未接菜单）
      ├─ hidden-danger/HiddenDangerForm.vue             隐患排查标准 新增/编辑表单
      ├─ hidden-danger/HiddenDangerLedger.vue           隐患台账（占位 el-empty）
      ├─ hidden-danger/InspectionTask.vue               排查任务台账（占位）
      ├─ hidden-danger/MyTasks.vue                      我的排查任务（占位）
      ├─ daily-inspection/DailyInspectionTask.vue       隐患日常排查任务（未接路由/菜单）
      ├─ labor-protection/PersonalProtectiveEquipment.vue 个人劳动防护用品（领用/更换 + 借用）
      └─ passenger-injury/PassengerInjuryRegister.vue   客伤信息登记管理（登记→审批闭环）
         passenger-injury/PassengerInjuryLedger.vue     客伤信息台账（卡片/列表双视图）
```

**已知缺失的资源文件**（原型自带就缺）：`AI.png`（智能体分析头像，被引用 18 处）、`登乘.jpg`（登乘证预览背景，1 处）。当前效果为破图/空白背景，不影响功能。

---

## 2. 如何运行

**运行原型（当前唯一可直接运行的形态）：**

```bash
node serve.mjs          # 启动零依赖静态服务器
# 浏览器打开 http://127.0.0.1:5173/
```

或直接双击 `index.html` 以 `file://` 打开（大部分页面正常；个别依赖打印弹窗/blob 预览的功能在 file:// 下可能受限，建议用服务器方式）。

**⚠️ 必须联网**：`index.html` 的框架全部来自 CDN（jsdelivr）——
`vue@3.5.13` 全局构建、`element-plus@2.9.1`（index.full.js + index.css + zh-cn 语言包）、`echarts@5.6.0`。离线打开为白屏。

**运行 src/ 工程版**：当前不可运行，见 §5「接手第一步」。

---

## 3. `index.html` 原型的内部结构（改原型必读）

单文件内共 5 段：

| 段 | 行号范围（约） | 内容 |
|---|---|---|
| ① `<style>` | 55–1875 | 全部页面样式（绿色主题，含 el-* 覆盖） |
| ② 布局壳 | 1876–2124 | 顶栏 + `<aside>` 侧边菜单（17 个 el-sub-menu）+ `<main class="app-content">` |
| ③ 页面区 | 2126–24390 | 77 个 `<div v-if/v-else-if="currentPage === 'xxx'">`，按 §4 菜单顺序排列 |
| ④ 打印模板区 | ~24400–33240 | 告知书/调查报告书/信息卡等 A4 打印 HTML（部分页专属） |
| ⑤ `<script>` | 33241–61508 | **单个 `createApp({ setup() })`**：`currentPage = ref('home')` 驱动页面切换；77 个页面的全部 ref/reactive/computed/handler 与 mock 数据**全部平铺在同一个 setup() 里**，最后巨型 `return {...}` 暴露；`app.use(ElementPlus, { locale: ElementPlusLocaleZhCn }).mount('#app')` |

**⚠️ 单文件维护风险**：所有页面状态共享一个作用域，**变量命名即命名空间**（惯例：页面前缀，如 `lprForm`＝劳保、`zc*`＝中心监察、`si*`＝公司监察、`ain*`＝事故事件、`fchk*`＝消防检查、`sc*`＝承诺书、`stb*`＝责任书）。改任何一段前先全局搜索前缀，避免命名冲突。

**当前用户**（无登录，写死，L33247）：`currentUser = { username: '孙书星', role: 'admin', department: '运营中心/安全部', center: '运营一中心', userId: '001' }`。

**默认页**：`currentPage = ref('home')`，但 `home` 无对应分支 → 内容区初始为**空白**，需点菜单进入。

**页面跳转机制**：菜单 `@select="handleMenuSelect"` → `currentPage.value = index`；页内跳转直接给 `currentPage.value` 赋值（如消防管理 ↔ 消防器材周期配置联动，L49887）。

**ECharts 渲染**：`Vue.watch(currentPage, ...)` 在切页后 `nextTick + setTimeout` 按需调用 `renderXxxCharts()`（L55358、L56633 两段 watch）。

---

## 4. 左侧导航菜单全量清单（17 域 · 77 页）

> **状态图例**（对照 `src/views/` 迁移进度）：
> ✅ 已有 `.vue` 且已接路由/菜单（不代表原型一致性或功能验收） · 🔶 已有 `.vue` 但未接路由或菜单 · ⬜ 未迁移（仅原型）
> 「禁用」= 菜单项带 `disabled`；「骨架页」= 页面存在但仅标题+提示。

### 4.1 首页（home-menu）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 首页概览 | `home` | 无分支 | ⬜ | 初始 currentPage，内容区空白待实现 |
| 员工模块 | `employee-module` | 14106 | ⬜ | 员工信息列表 |

### 4.2 风险管理（risk）
子菜单**无任何页面**——展开为空，整个域待规划实现。⬜

### 4.3 隐患管理（hidden-danger）—— 业务核心域
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 异常问题管理 | `abnormal-problem` | 13941 | ⬜ | 异常问题登记/跟踪 |
| 隐患治理管理 | `hidden-danger-governance` | 2792 | ⬜ | 隐患整改治理流程 |
| 隐患延期申请 | `hidden-danger-extension` | 3004 | ⬜ | 整改超期延期审批 |
| **隐患排查标准库** | `hidden-danger-database` | 2126 | 🔶 | 已接路由但未接菜单；5 条件搜索 + 表格 CRUD + 分页（`HiddenDangerDatabase.vue`；新增/编辑独立表单页 `HiddenDangerForm.vue`，路由 `/hidden-danger/form`） |
| 日常排查任务 | `hidden-danger-daily-task` | 2346 | 🔶 | 任务/状态/重要度/中心部门树搜索，14 列，新增·编辑·详情共用弹窗（`DailyInspectionTask.vue` 已写好，**未接路由和菜单**） |
| 专项排查任务 | `hidden-danger-special-task` | 2569 | ⬜ | 专项排查任务管理 |
| 隐患排查奖励（禁用） | `hidden-danger-reward` | 3120 | ⬜ | 菜单 disabled，页面骨架已有 |
| 隐患举报（禁用） | `hidden-danger-report` | 3242 | ⬜ | 菜单 disabled，页面骨架已有 |
| 隐患排查治理记录台账 | `hidden-danger-ledger` | 3355 | 🔶 | 治理记录汇总台账（`HiddenDangerLedger.vue` 为 el-empty 占位，路由 `/hidden-danger/ledger`） |

### 4.4 劳动防护用品管理（labor-protection）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 劳动防护用品管理台账 | `labor-protection-account` | 3589 | 🔶 | `PersonalProtectiveEquipment.vue` 实现了「领用/更换 + 借用」双 Sheet 含电子签名上传，**已接路由和菜单，尚未验收原型一致性** |
| 公用物资台账 | `public-materials-account` | 4854 | ⬜ | 公用物资管理（含批量转移/设人等，前缀 fm/bp） |
| 公用物资报废台账 | `public-materials-scrap` | 5201 | ⬜ | 报废申请与记录 |
| 公用物资借用台账 | `public-materials-borrow` | 5392 | ⬜ | 借用/归还流程（借用人默认 currentUser） |
| 特殊劳动防护用品 | `special-labor-protection` | 5814 | ⬜ | 特种劳保管理 |
| 我的劳动防护用品 | `personal-labor-protection` | 6696 | ⬜ | 个人名下劳保查询 |
| 个人领用登记 | `personal-receive-record` | 7319 | ⬜ | 个人领用登记 |
| 统计分析 | `labor-protection-statistics` | 7829 | ⬜ | 劳保统计图表 |

### 4.5 职业卫生管理（occupational-health）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 职业卫生三同时管理 | `occ-three-simultaneous` | 7944 | ⬜ | 建设项目三同时档案 |
| 职业卫生档案管理 | `occ-archive` | 8301 | ⬜ | 职业卫生档案 |
| 职业危害因素监测与检测评价档案 | `occ-detection` | 8497 | ⬜ | 危害因素检测评价 |
| ~~健康监护规划档案~~ | `occ-monitor` | 8854 | ⬜ | **菜单已注释隐藏**，页面分支仍在（与 occ-monitor-result 角标互跳） |
| 职业健康监护管理 | `occ-monitor-result` | 9593 | ⬜ | 监护计划管理，右上角角标可跳规划档案页 |
| 劳动者个人职业健康监护档案 | `occ-personal-archive` | 9046 | ⬜ | 个人档案 + **可打印「个人职业健康监护信息卡」**（新窗口打印） |

### 4.6 安全教育培训（training）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 安全培训管理 | `safety-training-manage` | 10273 | ⬜ | 培训记录；支持打印「员工安全培训教育卡」 |
| 安全培训统计 | `safety-training-stats` | 10622 | ⬜ | 培训统计 |

### 4.7 安全责任制管理（safety-responsibility）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 安全责任清单 | `safety-duty-list` | 11128 | ⬜ | 责任清单；右侧悬浮 AI 智能体分析浮窗（引用缺失的 `AI.png`） |
| 履职清单 | `safety-duty-perform` | 11863 | ⬜ | 履职记录 |
| 安全目标责任书 | `safety-target-book` | 12451 | ⬜ | 责任书 A4 批量打印（前缀 stb） |
| 安全承诺书 | `safety-commitment` | 13221 | ⬜ | 承诺书预览/A4 打印（前缀 sc） |

### 4.8 安全监察管理（safety-supervision）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 问题录入 | `si-problem-entry` | 14949 | ⬜ | 公司级监察问题录入（前缀 si） |
| 中心监察问题 | `zc-problem-entry` | 15781 | ⬜ | 中心级问题录入（前缀 zc，流程同 si 的平行实现） |
| 问题分析 | `si-problem-analysis` | 15672 | ⬜ | 问题分析统计 |
| 问题展示 | `si-problem-display` | 15775 | ⬜ | 问题展示看板 |
| （隐藏页） | `zc-problem-analysis` / `zc-problem-display` | 16486/16492 | ⬜ | 中心级分析/展示，**不在菜单**，页内跳转到达 |

### 4.9 消防管理（fire-safety）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 消防证书管理 | `fire-certificate` | 16498 | ⬜ | 消防设施操作员证书台账 |
| 消防重点部位管理 | `fire-key-part` | 16769 | ⬜ | 重点部位档案 |
| 消防网格化管理 | `fire-system` | 17091 | ⬜ | 消防网格体系 |
| 消防安全管理 | `fire-safety-mgmt` | 17357 | ⬜ | 消防总览，与下页**角标互跳**（L49887） |
| （隐藏页） | `fire-cycle-config` | 18631 | ⬜ | 消防器材检修报废周期管理，由 fire-safety-mgmt 角标进入，不在菜单 |
| 消防安全检查 | `fire-check` | 18269 | ⬜ | 检查记录 + 整改（前缀 fchk，整改按钮按「当前人/超管」判定） |

### 4.10 登乘证管理（boarding-pass）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 登乘证申请 | `boarding-pass-apply` | 17717 | ⬜ | 申请表单，预览背景引用缺失的 `登乘.jpg` |

### 4.11 员工伤害管理（employee-injury）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 员工伤害台账 | `employee-injury-ledger` | 18798 | ⬜ | 伤害事件登记台账 |
| 员工伤害调查报告 | `employee-injury-report` | 19344 | ⬜ | 「运营公司员工伤亡事件调查报告书」A4 打印 |

### 4.12 票卡稽查管理（ticket-inspection）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 稽查记录管理 | `ticket-inspection-record` | 19689 | ⬜ | 稽查记录（编号自动生成、创建人取当前登录人） |
| 稽查分析管理 | `ticket-inspection-analysis` | 20041 | ⬜ | 稽查分析 |

### 4.13 客伤管理（passenger-injury）—— src 侧业务闭环样板
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 客伤信息登记管理 | `passenger-injury-register` | 20208 | ✅ | 工程版为简化登记，未验收原型四步向导/多人信息的一致性；编号 `KS-年-序号` 自动生成 + **审批弹窗（通过/驳回+意见）**；路由 `/passenger-injury/register` |
| 客伤信息台账 | `passenger-injury-ledger` | 20356 | ✅ | **只汇总「审批通过」记录**；卡片/列表双视图 + 中心/线路/日期筛选；路由 `/passenger-injury/ledger` |

跨页状态在 `src/stores/passengerInjury.js`：7 个字典（性别/中心/线路/位置/天气/受伤部位/审批状态）+ `injuryRecords`（reactive 数组）+ `approvedInjuryRecords`（computed 过滤）+ `genRecordNo()`。**工程版登记页审批通过 → 台账页即时可见**。此实现仅供跨页状态组织参考，未验收原型一致性，不得直接套用到其他模块的业务状态机。

### 4.14 事故事件管理（accident-event）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 事故事件调查通知 | `accident-investigation-notice` | 20509 | ⬜ | 调查通知书（前缀 ain） |
| 事故事件登记 | `accident-create` | 20675 | ⬜ | 事件登记向导 |
| 事故事件反馈 | `accident-feedback` | 20764 | ⬜ | 反馈闭环 |
| 事故事件台账 | `accident-info` | 20844 | ⬜ | 汇总台账 |
| 事故事件多维分析 | `accident-analysis` | 20934 | ⬜ | ECharts 多维分析（renderAeCharts） |

### 4.15 违章管理（violation）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 违章违纪登记 | `violation-record` | 21106 | ⬜ | 内部违章登记 |
| 委外违章违纪登记 | `violation-outsource` | 21248 | ⬜ | 委外单位违章 |
| 违章公示 | `violation-notice` | 21447 | ⬜ | 公示栏 |
| 违章违纪行为考核库 | `violation-library` | 21352 | ⬜ | 考核行为库 |
| 违章违纪档案 | `violation-archive` | 21547 | ⬜ | 个人违章档案 |
| 违章违纪分析 | `violation-analysis` | 21657 | ⬜ | 违章分析图表 |

### 4.16 行政执法（law-enforcement）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 《条例》内违法违规登记 | `law-violation-record` | 22409 | ⬜ | 执法人员多选（默认当前登录人） |
| 《条例》外违法违规登记 | `law-violation-outside` | 22575 | ⬜ | 平行实现 |
| 行政处罚登记 | `law-penalty-record` | 23025 | ⬜ | 处罚登记 |
| 内部监督检查登记 | `law-inspection-record` | 23495 | ⬜ | 内部检查 |
| 行政执法违规事项统计表 | `law-violation-report` | 23846 | ⬜ | 统计表 + ECharts（renderLvrReportCharts，watch 触发） |

### 4.17 应急管理（emergency）—— 唯一两级子菜单
季节性防控管理（emergency-seasonal）下：
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 基础信息管理 | `emergency-basic-info` | 24231 | ⬜ | 防汛基础信息 |
| 防汛风险管控清单 | `emergency-flood-risk` | 24373 | ⬜ | 骨架页（标题+提示） |
| 防控预警响应 | `emergency-warning-response` | 24378 | ⬜ | 骨架页 |
| 防汛防寒物资管理 | `emergency-material` | 24383 | ⬜ | 骨架页 |
| 防汛抽排水队伍管理 | `emergency-team` | 24388 | ⬜ | 骨架页 |

### 4.18 安全指标管理（safety-index）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 公司年度安全指标管理 | `safety-index-company` | 21776 | ⬜ | 公司级指标 |
| 中心年度安全指标管理 | `safety-index-center` | 21941 | ⬜ | 中心级指标 |
| 安全指标事件登记 | `safety-index-event` | 22116 | ⬜ | 指标事件 |
| 整改措施反馈 | `safety-index-feedback` | 22257 | ⬜ | 整改反馈 |
| 指标统计分析 | `safety-index-analysis` | 22401 | ⬜ | 统计分析 |

### 4.19 外单位施工安全协议（agreement）
| 菜单项 | currentPage | 原型行号 | 迁移 | 说明 |
|---|---|---|---|---|
| 施工协议登记 | `agreement-list` | 21009 | ⬜ | 协议台账 |

### 4.20 原型独有、不在菜单的隐藏分支
`home`（空白初始页）、`occ-monitor`（菜单已注释）、`zc-problem-analysis`、`zc-problem-display`、`fire-cycle-config`（角标互跳）、`risk` 空域。**做迁移清单时不要漏掉这些。**

### 4.21 驾驶舱（工程版独有）
`/risk-dashboard` —— `RiskDashboard.vue` 全屏大屏（SVG 地铁线路图、指标阈值监测、预警弹窗队列、12s 模拟数据刷新），**原型侧边菜单没有此项**，工程版 MainLayout 菜单第一项可达。

---

## 5. src/ 工程版现状与「接手第一步」

### 5.1 缺失的工程配置（当前无法编译）
仓库内 `package.json`、`vite.config.js`、`.gitignore` **均不存在**。根 `index.html` 已存在且是原型，不得覆盖；工程版需另设 HTML 入口或独立子目录。历史配置线索（重建时须核对兼容性并重新验证）：

- **依赖**：`vue ^3.5`、`vue-router ^4.5`、`pinia ^2.3`、`element-plus ^2.9.1`、`@element-plus/icons-vue ^2.3`；devDeps：`vite ^6`、`@vitejs/plugin-vue ^5`、`sass ^1.83`。
- **`vite.config.js` 三个关键点**：
  1. 别名 `'@' → ./src`；
  2. **SCSS 变量全局注入**（组件 `<style lang="scss">` 直接使用 `$primary-color` 等而无需 import）：
     ```js
     additionalData: (content, filename) => {
       if (filename.replace(/\\/g, '/').endsWith('src/styles/index.scss')) return content
       return `@use "${varsPath}" as *;\n${content}`
     }
     ```
     （跳过 index.scss 是因为它自身已 `@use` 变量表，避免命名空间重复加载报错。）
  3. `server.proxy['/api']` 预留后端代理位。
- **Windows 本机坑**：`%TEMP%` 的 ACL 缺当前用户完全控制项，esbuild 构建末尾清理临时文件报 `Access is denied` 导致 build 失败。解法：脚本经包装把 `TMP/TEMP/TMPDIR` 指到工程内 `.localtmp` 再调 vite。非本机可忽略。
- 已修过的样式告警：`index.scss` 中 `lighten()`→`color.adjust()`、`@import`→`@use`（Dart Sass 3.0 将移除，勿改回）。

### 5.2 工程版与原型版的差异（迁移时的已知缺口）
- 原型文档原统计 77 页（口径为历史统计，未在本轮重计）；工程 `src/views/` 有 11 个 Vue 文件，其中 10 个已注册路由、3 个为占位页，DailyInspectionTask 未注册路由。注册路由不代表功能或视觉已验收。
- 工程版**无后端**：全部 mock 数据内联在组件；增删改仅改内存、刷新即丢；导入/导出/部分搜索按钮是 `ElMessage('开发中')` 占位。
- 入口代码注册了 `pinia`（依赖尚未恢复，不能认定已安装），但**全项目未用 `defineStore`**（客伤用 `stores/passengerInjury.js` 的 reactive 单例过渡）。
- 侧边栏（`MainLayout.vue`）目前仅挂了驾驶舱 / 劳保 / 客伤登记 / 客伤台账共 4 个叶子入口；隐患页虽已注册路由但未接侧边菜单；对齐原型的 17 域菜单是主要待办。

### 5.3 建议的推进顺序
1. **重建工程配置**（按 §5.1），确认 `npm install && npm run build` 通过、`npm run dev` 可访问；
2. **对齐菜单骨架**：把原型 `<aside>` 的 17 域菜单搬进 `MainLayout.vue`（el-menu 结构两边一致，index→路由 path 直接映射），未迁移页先挂 el-empty 占位路由；
3. **按域迁移页面**，优先级：隐患管理（业务核心）→ 劳保全域 → 事故事件/违章（参考跨页状态组织，逐模块确认状态机）→ 其余台账域；每页以原型对应行号段为**需求基线**（字段、按钮、交互都已在原型里画清楚）；
4. **接后端**：建 `src/api/` + axios 封装，走 vite 预留的 `/api` 代理；mock 数据改为接口拉取；
5. 补 `AI.png`、`登乘.jpg` 两个静态资源（或改为内联 data URI）。

### 5.4 数据字典速查（历史摘要，须按模块复核）
以下口径含工程版摘要，不是各模块统一的已确认字典。客伤原型组织树使用运营一至四中心，与工程版不一致，待确认。

中心：客运一/二/三中心、车辆、工务、通号、供电、机电中心；线路：1/2/3/8/11/13 号线；
隐患五级：重大/较大/一般/较小/极小风险（预警上报：重大→公司总经理、较大→中心总经理、一般→部门经理）；
客伤位置：站台/站厅/车厢内/出入口/自动扶梯/楼梯/卫生间/安检处；编号规则：客伤 `KS-YYYY-0000`、隐患 `YH-YYYY-0000`。

---

## 6. 历史验证记录（不代表本轮验收）

| 项 | 结果 |
|---|---|
| `node serve.mjs` → http://127.0.0.1:5173/ | ✅ 200，页面完整（4.1 MB） |
| 框架依赖 | 全 CDN（vue 3.5.13 / element-plus 2.9.1 / echarts 5.6.0），**必须联网** |
| 本地资源引用 | 仅 `AI.png`(18 处)、`登乘.jpg`(1 处)，均缺失（破图，不阻塞功能） |
| `src/` 工程 | ❌ 缺 package.json / vite.config.js / 工程版 HTML 入口，暂不可编译（§5.1 可重建） |
| 运行时 | Node ≥18 仅用于 serve.mjs 静态服务（本机 v24.16 已验证） |


## 7. 文档与智能体交接入口（2026-10-26 修订）

先读 [AGENTS.md](AGENTS.md) 和 [协作规范](agent.md)，模块交接使用 [模板](docs/handoff-template.md)。[客伤样例](docs/handoffs/passenger-injury-register.20261026-0955.md) 已纠正为“示例·未验收”，不可作为真实批准。

行号仅用于定位，正式基线必须有文件哈希或版本。文档中的实现状态不等于验收状态；源码事实、建议方案和人工确认分开记录。工程重建必须保留原型入口，依赖版本与本机临时目录问题属于历史线索，重建时重新验证。

文档检查：`node scripts/check-docs.mjs`。业务与浏览器验证按 agent.md §5 执行。

日志数据与 UI 已分离：[归档与检索说明](changelog/README.md)。看板默认最近 50 条摘要；智能体先用 `node scripts/changelog.mjs search --keyword 关键词 --limit 10` 定位，再按编号读取全文。
