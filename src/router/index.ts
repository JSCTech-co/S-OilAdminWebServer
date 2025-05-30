import { createRouter, createWebHistory} from 'vue-router'
import type {RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/KPIKOPAdmin',
    name: 'KpiKopAdmin',
    component: () => import('@/components/KPIKOPAdmin/KPIKOPAdmin.vue')
  },
  {
    path: '/ReportAdmin',
    name: 'ReportAdmin',
    component: () => import('@/components/ReportAdmin/ReportAdmin.vue')
  },
  // ...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
