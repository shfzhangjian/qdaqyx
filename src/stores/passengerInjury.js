import { reactive, computed } from 'vue'

// ============ 数据字典 ============
export const genderDict = ['男', '女']

export const centerDict = ['客运一中心', '客运二中心', '客运三中心', '车辆中心', '工务中心', '通号中心', '供电中心', '机电中心']

export const lineDict = ['1号线', '2号线', '3号线', '8号线', '11号线', '13号线']

export const positionDict = ['站台', '站厅', '车厢内', '出入口', '自动扶梯', '楼梯', '卫生间', '安检处', '其他']

export const weatherDict = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雪', '其他']

export const bodyPartDict = ['头部', '面部', '颈部', '肩部', '上肢', '手部', '下肢', '足部', '躯干', '其他']

export const approvalStatusDict = ['待审批', '审批通过', '已驳回']

// ============ 客伤登记数据（登记→审批→台账共享） ============
export const injuryRecords = reactive([
  {
    id: 1,
    recordNo: 'KS-2026-0001',
    name: '张伟',
    gender: '男',
    age: 45,
    location: '五四广场站',
    occurTime: '2026-08-12 08:35',
    position: '站台',
    weather: '晴',
    center: '客运一中心',
    line: '2号线',
    bodyPart: '手部',
    incident: '乘客在站台候车时，因列车进站制动引起人群拥挤，右手被夹伤。',
    cause: '早高峰客流集中，站台组织疏导不到位，乘客站位靠近屏蔽门。',
    status: '是',
    approvalStatus: '审批通过'
  },
  {
    id: 2,
    recordNo: 'KS-2026-0002',
    name: '李秀兰',
    gender: '女',
    age: 67,
    location: '青岛北站',
    occurTime: '2026-08-15 10:20',
    position: '自动扶梯',
    weather: '阴',
    center: '客运三中心',
    line: '3号线',
    bodyPart: '下肢',
    incident: '老年乘客乘坐下行扶梯时未站稳，跌倒致腿部擦伤。',
    cause: '扶梯运行正常，乘客未握扶手，现场无工作人员及时提醒。',
    status: '是',
    approvalStatus: '审批通过'
  },
  {
    id: 3,
    recordNo: 'KS-2026-0003',
    name: '王强',
    gender: '男',
    age: 28,
    location: '人民会堂站',
    occurTime: '2026-08-18 18:42',
    position: '车厢内',
    weather: '小雨',
    center: '客运一中心',
    line: '1号线',
    bodyPart: '上肢',
    incident: '列车紧急制动，乘客站立不稳摔倒，手臂碰伤。',
    cause: '列车临时停车制动，车厢内乘客较多未抓稳扶手。',
    status: '是',
    approvalStatus: '待审批'
  },
  {
    id: 4,
    recordNo: 'KS-2026-0004',
    name: '赵敏',
    gender: '女',
    age: 33,
    location: '石老人浴场站',
    occurTime: '2026-08-20 14:10',
    position: '站厅',
    weather: '多云',
    center: '客运二中心',
    line: '2号线',
    bodyPart: '足部',
    incident: '乘客出站时在站厅行走不慎扭伤脚踝。',
    cause: '站厅地面湿滑，防滑警示标识不足。',
    status: '是',
    approvalStatus: '审批通过'
  },
  {
    id: 5,
    recordNo: 'KS-2026-0005',
    name: '陈建国',
    gender: '男',
    age: 52,
    location: '李村站',
    occurTime: '2026-08-22 09:05',
    position: '楼梯',
    weather: '晴',
    center: '客运三中心',
    line: '3号线',
    bodyPart: '躯干',
    incident: '乘客下楼梯时踩空跌倒，腰部受伤。',
    cause: '楼梯照明正常但台阶边缘磨损，现场未设置防滑条。',
    status: '是',
    approvalStatus: '已驳回'
  },
  {
    id: 6,
    recordNo: 'KS-2026-0006',
    name: '刘洋',
    gender: '男',
    age: 24,
    location: '会展中心站',
    occurTime: '2026-08-25 17:30',
    position: '出入口',
    weather: '中雨',
    center: '客运二中心',
    line: '11号线',
    bodyPart: '头部',
    incident: '乘客出站时雨天地面湿滑，滑倒致头部磕碰。',
    cause: '出入口地面雨水积聚，未及时铺设防滑垫。',
    status: '是',
    approvalStatus: '待审批'
  }
])

// ============ 台账：仅纳入审批通过的记录 ============
export const approvedInjuryRecords = computed(() =>
  injuryRecords.filter(r => r.approvalStatus === '审批通过')
)

// 生成记录编号
export function genRecordNo() {
  const year = new Date().getFullYear()
  const maxSeq = injuryRecords.reduce((max, r) => {
    const m = r.recordNo.match(/(\d+)$/)
    return m ? Math.max(max, parseInt(m[1], 10)) : max
  }, 0)
  const seq = String(maxSeq + 1).padStart(4, '0')
  return `KS-${year}-${seq}`
}
