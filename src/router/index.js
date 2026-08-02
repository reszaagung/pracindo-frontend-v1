// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useGuards } from './guards'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { publik: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { publik: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { perluLogin: true }
  },
  {
    path: '/accounting',
    meta: { perluLogin: true, modul: 'akunting' },
    component: () => import('@/features/accounting/AccountingLanding.vue'),
  },
  {
    path: '/accounting/transaksi/po',
    meta: { perluLogin: true, modul: 'akunting' },
    component: () => import('@/features/accounting/layout/TransactionEntryLayout.vue'),
    children: [
      {
        path: '',
        name: 'transaksi-po-list',
        component: () => import('@/features/accounting/views/PurchaseOrderList.vue')
      },
      {
        path: 'buat',
        name: 'transaksi-po',
        component: () => import('@/features/accounting/views/PurchaseOrderForm.vue')
      }
    ]
  },
  {
    path: '/master/suplier',
    name: 'master-suplier',
    meta: { perluLogin: true, modul: 'master' },
    component: () => import('@/features/master/views/Supplier.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})


useGuards(router)

export default router