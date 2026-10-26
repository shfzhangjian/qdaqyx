import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/risk-dashboard'
  },
  {
    path: '/risk-dashboard',
    name: 'RiskDashboard',
    component: () => import('@/views/dashboard/RiskDashboard.vue'),
    meta: { title: '隐患风险监测驾驶舱', icon: 'Monitor' }
  },
  {
    path: '/app',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '/hidden-danger/database',
        name: 'HiddenDangerDatabase',
        component: () => import('@/views/hidden-danger/HiddenDangerDatabase.vue'),
        meta: { title: '隐患数据库', icon: 'Document' }
      },
      {
        path: '/hidden-danger/form',
        name: 'HiddenDangerForm',
        component: () => import('@/views/hidden-danger/HiddenDangerForm.vue'),
        meta: { title: '隐患排查标准', icon: 'Edit' }
      },
      {
        path: '/hidden-danger/ledger',
        name: 'HiddenDangerLedger',
        component: () => import('@/views/hidden-danger/HiddenDangerLedger.vue'),
        meta: { title: '隐患台账', icon: 'Notebook' }
      },
      {
        path: '/hidden-danger/task',
        name: 'InspectionTask',
        component: () => import('@/views/hidden-danger/InspectionTask.vue'),
        meta: { title: '排查任务台账', icon: 'List' }
      },
      {
        path: '/hidden-danger/my-tasks',
        name: 'MyTasks',
        component: () => import('@/views/hidden-danger/MyTasks.vue'),
        meta: { title: '我的排查任务', icon: 'User' }
      },
      {
        path: '/labor-protection/ppe',
        name: 'PersonalProtectiveEquipment',
        component: () => import('@/views/labor-protection/PersonalProtectiveEquipment.vue'),
        meta: { title: '个人劳动防护用品管理', icon: 'Shield' }
      },
      {
        path: '/passenger-injury/register',
        name: 'PassengerInjuryRegister',
        component: () => import('@/views/passenger-injury/PassengerInjuryRegister.vue'),
        meta: { title: '客伤信息登记管理', icon: 'EditPen' }
      },
      {
        path: '/passenger-injury/ledger',
        name: 'PassengerInjuryLedger',
        component: () => import('@/views/passenger-injury/PassengerInjuryLedger.vue'),
        meta: { title: '客伤信息台账', icon: 'Notebook' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
