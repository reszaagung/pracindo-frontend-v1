/**
 * src/router/index.js
 * ====================
 *
 * PERUBAHAN vs versi lama (semua ditandai `// [FIX]`):
 *   1. Tambah rute DAFTAR PO `/accounting/po` — sebelumnya PurchaseOrder.vue
 *      tidak teregister sama sekali (dead code) & semua link ke `/accounting/po`
 *      jatuh ke catch-all -> bounce ke `/`. Ini juga menyelamatkan redirect
 *      after-save di PurchaseOrderCreate (router.push('/accounting/po')).
 *   2. `suplier` di review-layout: path relatif -> absolut `/accounting/suplier`,
 *      sekaligus menghapus orphan `/accounting/review-layout/suplier`.
 *   3. Redirect `path: ''` untuk review-layout supaya buka URL parent telanjang
 *      tidak menghasilkan rail kosong.
 *   4. ALIAS kompatibilitas untuk URL yang salah namespace tapi dipakai di
 *      nav-config & komponen: `/accounting/tagihan`, `/accounting/payment`,
 *      `/accounting/sales-order/buat`, `/accounting/sales-order/:id`.
 *      -> bisa dibuang nanti setelah link di SalesOrder.vue + useNavInvoice.js
 *         + modules.js dirapikan ke namespace kanonik.
 *
 * CATATAN: file ini hanya menutup masalah NAVIGASI. Bug data (#4 unwrap
 * .results, #5 kelengkapan belum di-expose, #6 endpoint produk 404) tidak
 * tersentuh di sini.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { pasangGuards } from './guards'

const ModulLayout = () => import('@/components/layout/ModulLayout.vue')

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { publik: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { perluLogin: true },
  },

  {
    path: '/accounting',
    component: ModulLayout,
    meta: { perluLogin: true, modul: 'accounting' },
    children: [
      {
        path: '',
        name: 'accounting',
        component: () => import('@/features/accounting/views/DashboardAccounting.vue'),
      },
      {
        path: 'po',
        name: 'accounting-po',
        component: () => import('@/features/accounting/views/PurchaseOrder.vue'),
      },
      {
        path: 'po/:id',
        name: 'accounting-po-detail',
        component: () => import('@/features/accounting/views/PurchaseOrderDetail.vue'),
        props: true,
      },
    ],
  },


  {
    path: '/accounting/review-layout',
    component: () => import('@/features/accounting/layout/InvoiceLayout.vue'),
    meta: { perluLogin: true, modul: 'invoice' },
    children: [

      {
        path: '',
        redirect: '/accounting/invoice',
      },
      {
        path: '/accounting/invoice',
        name: 'accounting-invoice',
        alias: '/accounting/tagihan',
        component: () => import('@/features/accounting/views/Invoice.vue'),
      },
      {
        path: '/accounting/document',
        name: 'accounting-document',
        component: () => import('@/features/accounting/views/Document.vue'),
      },

      {
        path: '/accounting/suplier',
        name: 'accounting-suplier',
        component: () => import('@/features/master/views/Suplier.vue'),
      },
    ],
  },

  {
    path: '/accounting/transaksi',
    component: () => import('@/features/accounting/layout/TransactionEntryLayout.vue'),
    meta: { perluLogin: true, modul: 'transaksi' },
    children: [
      {
        path: '',
        redirect: '/accounting/transaksi/pembelian',
      },
      {
        path: 'pembelian',
        name: 'transaksi-pembelian',
        component: () => import('@/features/accounting/views/PurchaseOrderCreate.vue'),
      },
      {
        path: 'pembayaran',
        name: 'transaksi-pembayaran',
        alias: '/accounting/payment',
        component: () => import('@/features/accounting/views/PaymentSuplier.vue'),
      },
      {
        path: 'pengeluaran',
        component: () => import('@/features/accounting/views/Expend.vue'),
      },
      {
        path: 'penjualan',
        name: 'transaksi-penjualan',
        component: () => import('@/features/accounting/views/SalesOrder.vue'),
      },
      {
        path: 'penjualan/buat',
        name: 'transaksi-penjualan-buat',
        alias: '/accounting/sales-order/buat',
        component: () => import('@/features/accounting/views/CreateSalesOrder.vue'),
      },
      {
        path: 'penjualan/:id',
        name: 'transaksi-penjualan-detail',
        alias: '/accounting/sales-order/:id',
        component: () => import('@/features/accounting/views/SalesOrderDetail.vue'),
      },
    ],
  },


  {
    path: '/warehouse',
    component: () => import('@/features/warehouse/layout/WarehouseLayout.vue'),
    meta: { perluLogin: true, modul: 'warehouse' },
    children: [
      {
        path: '',
        name: 'warehouse-stok',
        component: () => import('@/features/warehouse/views/DashboardGudang.vue'),
      },
      {
        path: 'packaging',
        name: 'warehouse-packaging',
        component: () => import('@/features/warehouse/views/Packaging.vue'),
      },
      {
        path: 'received',
        name: 'warehouse-received',
        component: () => import('@/features/warehouse/views/Received.vue'),
      },
      {
        path: 'received-package',
        name: 'warehouse-received-package',
        component: () => import('@/features/warehouse/views/ReceivedPackage.vue'),
      },
      {
        path: 'retur',
        name: 'warehouse-retur',
        component: () => import('@/features/warehouse/views/Retur.vue'),
      },
      {
        path: 'tangki',
        name: 'warehouse-tangki',
        component: () => import('@/features/master/views/TankMonitoring.vue'),
      },
    ],
  },


  {
    path: '/rnd',
    component: () => import('@/features/rnd/layout/RndLayout.vue'),
    meta: { perluLogin: true, modul: 'rnd' },
    children: [
      {
        path: '',
        redirect: '/rnd/produksi',
      },
      {
        path: 'produksi',
        name: 'rnd-produksi',
        component: () => import('@/features/rnd/views/Produksi.vue'),
      },
      {
        path: 'formula',
        name: 'rnd-formula',
        component: () => import('@/features/rnd/views/FormulaMaster.vue'),
      },
      {
        path: 'tangki',
        name: 'rnd-tangki',
        component: () => import('@/features/master/views/TankMonitoring.vue'),
      },
    ],
  },

  {
    path: '/logistic',
    component: ModulLayout,
    meta: { perluLogin: true, modul: 'logistic' },
    children: [
      {
        path: '',
        name: 'logistic',
        component: () => import('@/features/logistic/views/Monitor.vue'),
      },
      {
        path: 'buat',
        name: 'logistic-buat',
        component: () => import('@/features/logistic/views/FormPengirimanCustomer.vue'),
      },
      {
        path: 'armada',
        name: 'logistic-armada',
        component: () => import('@/features/logistic/views/Armada.vue'),
      },
    ],
  },

  // ── Master Data ──────────────────────────────────────────
  {
    path: '/master',
    component: ModulLayout,
    meta: { perluLogin: true, modul: 'master' },
    children: [
      { path: '', redirect: '/master/suplier' },
      {
        path: 'suplier',
        name: 'master-suplier',
        component: () => import('@/features/master/views/Suplier.vue'),
      },
      {
        path: 'customer',
        name: 'master-customer',
        component: () => import('@/features/master/views/Customer.vue'),
      },
      {
        path: 'produk',
        name: 'master-produk',
        component: () => import('@/features/master/views/Produk.vue'),
      },
      {
        path: 'kemasan',
        name: 'master-kemasan',
        component: () => import('@/features/master/views/Kemasan.vue'),
      },
    ],
  }, {
    path: '/executive',
    component: () => import('@/features/executive/layout/ExecutiveLayout.vue'),
    children: [
      {
        path: '', // Akan merender route /executive
        component: () => import('@/features/executive/views/DashboardExecutive.vue')
      }
    ]
  },

  {
    path: '/work-order',
    component: ModulLayout,
    meta: { perluLogin: true, modul: 'work-order' },
    children: [
      {
        path: '',
        name: 'work-order',
        component: () => import('@/features/work-order/views/WorkOrderPanel.vue'),
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

pasangGuards(router)

export default router