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
  {
    path: '/RoleCompMapping',
    name: 'RoleCompMapping',
    component: () => import('@/components/RoleCompMapping/RoleCompMapping.vue')
  },
  {
    path: '/CompRoleMapping',
    name: 'CompRoleMapping',
    component: () => import('@/components/CompRoleMapping/CompRoleMapping.vue')
  },
  {
    path: '/KpiKopFilterAdmin',
    name: 'KpiKopFilterAdmin',
    component: () => import('@/components/KPIKOPFilterAdmin/KpiKopFilterAdmin.vue')
  },
  {
    path: '/AppMaster',
    name: 'AppMaster',
    component: () => import('@/components/AppMaster/AppMaster.vue')
  },
  {
    path: '/overview',
    name: 'Overview',
    component: () => import('@/components/Overview/Overview.vue')
  },
  {
    path: '/Indice',
    name: 'Indice',
    component: () => import('@/components/IndiceAdmin/IndiceAdmin.vue')
  },
  // ...
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
