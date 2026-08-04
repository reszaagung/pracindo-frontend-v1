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

  // ==========================================
  // MODUL INPUT ENTRY (Akunting)
  // ==========================================
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
      }
    ]
  },

  // ==========================================
  // BUKU TAGIHAN — sub-area modul akunting
  // Backend tidak punya modul 'buku_tagihan' (bukan key AKSES_MODUL), jadi
  // meta.modul-nya WAJIB 'akunting'. Child mewarisi meta ini dari induknya.
  // ==========================================
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

  // ==========================================
  // MODUL MASTER DATA
  // ==========================================
  {
    path: '/master/suplier',
    name: 'master-suplier',
    meta: { perluLogin: true, modul: 'master' },
    component: () => import('@/features/master/views/Supplier.vue')
  },

  // ==========================================
  // MODUL WAREHOUSE
  // ==========================================
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

  // ==========================================
  // MODUL INVENTORY
  // ==========================================
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

  // ==========================================
  // MODUL PRODUKSI / R&D
  // Semua navigasi di dalam modul ini memakai NAMED ROUTE — path string
  // yang di-hardcode sudah dua kali menghasilkan 404 di modul lain.
  // ==========================================
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

  // ==========================================
  // MODUL YANG DIKIRIM BACKEND TAPI LAYARNYA BELUM ADA
  // Rute tetap digerbangi meta.modul supaya perilakunya sama dengan modul
  // lain begitu layar aslinya dibangun.
  // ==========================================
  {
    path: '/work-order',
    name: 'work-order',
    meta: { perluLogin: true, modul: 'work_order' },
    component: () => import('@/views/ModulBelumSiap.vue')
  },
  {
    path: '/dokumen',
    name: 'dokumen',
    meta: { perluLogin: true, modul: 'dokumen' },
    component: () => import('@/views/ModulBelumSiap.vue')
  },

  // ==========================================
  // AKSES DITOLAK
  // SENGAJA tanpa meta.modul: kalau punya, guard menolak halaman ini juga
  // dan redirect-nya berputar tanpa henti.
  // ==========================================
  {
    path: '/akses-ditolak',
    name: 'akses-ditolak',
    meta: { perluLogin: true },
    component: () => import('@/views/AksesDitolak.vue')
  },

  // ==========================================
  // FALLBACK 404
  // Sengaja BUKAN redirect ke '/': rute mati harus kelihatan mati, bukan
  // menyamar jadi "kembali ke dashboard".
  // ==========================================
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