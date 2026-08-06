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
    component: ModulLayout,
    children: [
      {
        path: '',
        name: 'accounting-landing',
        redirect: '/accounting/input/po'
      }
    ]
  },
  {
    path: '/accounting/input',
    meta: { perluLogin: true, modul: 'akunting' },
    component: () => import('@/features/accounting/layout/TransactionEntryLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/accounting/input/po'
      },
      {
        path: 'po',
        name: 'transaksi-po-list',
        component: () => import('@/features/accounting/views/PurchaseOrderList.vue')
      },
      {
        path: 'po/buat',
        name: 'transaksi-po',
        component: () => import('@/features/accounting/views/ProcurementCreate.vue')
      },
      {
        path: 'pengeluaran/buat',
        name: 'transaksi-pengeluaran',
        component: () => import('@/features/accounting/views/Expense.vue')
      },
    ]
  },
  {
    path: '/accounting/invoice',
    meta: { perluLogin: true, modul: 'akunting' },
    component: () => import('@/features/accounting/layout/InvoiceLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/accounting/invoice/dokumen'
      },
      {
        path: 'dokumen',
        name: 'accounting-invoice-dokumen',
        component: () => import('@/features/accounting/views/DocumentAuditView.vue')
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
    path: '/produksi',
    meta: { perluLogin: true, modul: 'produksi' },
    component: ModulLayout,
    children: [
      {
        path: '',
        name: 'produksi-sesi-list',
        component: () => import('@/features/produksi/views/SesiList.vue')
      },
      {
        path: 'sesi/buat',
        name: 'produksi-sesi-buat',
        component: () => import('@/features/produksi/views/SesiForm.vue')
      },
      {
        path: 'sesi/:id',
        name: 'produksi-sesi-detail',
        component: () => import('@/features/produksi/views/SesiDetail.vue'),
        props: true
      },
      {
        path: 'sesi/:id/kerja',
        name: 'produksi-sesi-berjalan',
        component: () => import('@/features/produksi/views/SesiBerjalan.vue'),
        props: true
      },
      {
        path: 'banding',
        name: 'produksi-banding',
        component: () => import('@/features/produksi/views/BandingBatch.vue')
      }
    ]
  },

  {
    path: '/work-order',
    name: 'work-order',
    meta: { perluLogin: true, modul: 'work_order' },
    component: () => import('@/features/work-order/views/WorkOrderBoard.vue')
  },
  {
    path: '/dokumen',
    name: 'dokumen',
    meta: { perluLogin: true, modul: 'dokumen' },
    component: () => import('@/views/ModulBelumSiap.vue')
  },
  {
    path: '/akses-ditolak',
    name: 'akses-ditolak',
    meta: { perluLogin: true },
    component: () => import('@/views/AksesDitolak.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    meta: { perluLogin: true },
    component: () => import('@/views/NotFound.vue')
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