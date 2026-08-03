// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useGuards } from './guards'
import ModulLayout from '@/components/layout/ModulLayout.vue'

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
    path: '/warehouse',
    meta: { perluLogin: true, modul: 'warehouse' },
    component: ModulLayout,
    children: [
      {
        path: '',
        name: 'warehouse-penerimaan-list',
        component: () => import('@/features/warehouse/views/GoodsReceiptList.vue')
      },
      {
        path: 'penerimaan/buat',
        name: 'warehouse-penerimaan-buat',
        component: () => import('@/features/warehouse/views/GoodsReceiptForm.vue')
      },
      {
        path: 'penerimaan/:id',
        name: 'warehouse-penerimaan-detail',
        component: () => import('@/features/warehouse/views/GoodsReceiptDetail.vue'),
        props: true
      },
      {
        path: 'selisih',
        name: 'warehouse-selisih',
        component: () => import('@/features/warehouse/views/DiscrepancyList.vue')
      }
    ]
  },
  {
    path: '/inventory',
    meta: { perluLogin: true, modul: 'inventory' },
    component: ModulLayout,
    children: [
      {
        path: '',
        name: 'inventory-stok-list',
        component: () => import('@/features/inventory/views/StockList.vue')
      },
      {
        path: 'stok/:id',
        name: 'inventory-stok-detail',
        component: () => import('@/features/inventory/views/StockDetail.vue'),
        props: true
      },
      {
        path: 'tangki',
        name: 'inventory-tangki',
        component: () => import('@/features/inventory/views/TankMonitor.vue')
      },
      {
        path: 'klaim/:grup',
        name: 'inventory-klaim',
        component: () => import('@/features/inventory/views/ClaimPosition.vue'),
        props: true
      }
    ]
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