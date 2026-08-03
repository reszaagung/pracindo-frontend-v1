/**
 * src/config/modules.js
 * ======================
 * Katalog UI SAJA. Siapa yang boleh masuk modul apa ditentukan backend lewat
 * GET auth/portal/ (lihat useAuth().modul) — file ini tidak menyimpan aturan
 * peran, hanya bagaimana modul itu tampil (ikon, label, menu, status siap).
 */

export const MODUL = [
  {
    id: 'akunting',
    nama: 'Akunting',
    ringkas: 'Purchase order, faktur, dan pembayaran',
    ikon: 'buku',
    rute: '/accounting',
    siap: true,
    menu: [
      { label: 'Portal Akunting', rute: '/accounting' },
      { label: 'Pembelian (PO)', rute: '/accounting/transaksi/po' },
    ],
  },
  {
    id: 'warehouse',
    nama: 'Gudang',
    ringkas: 'Penerimaan barang dan laporan selisih',
    ikon: 'gudang',
    rute: '/warehouse',
    siap: true,
    menu: [
      { label: 'Penerimaan Barang', rute: '/warehouse' },
      { label: 'Laporan Selisih', rute: '/warehouse/selisih' },
    ],
  },
  {
    id: 'master',
    nama: 'Master Data',
    ringkas: 'Suplier, produk, dan data acuan lain',
    ikon: 'master',
    rute: '/master/suplier',
    siap: true,
    menu: [
      { label: 'Suplier', rute: '/master/suplier' },
    ],
  },
  {
    id: 'produksi',
    nama: 'Produksi',
    ringkas: 'Resep dan sesi produksi',
    ikon: 'produksi',
    rute: '/produksi',
    siap: false,
    catatan: 'Endpoint backend belum ada',
    menu: [],
  },
  {
    id: 'logistik',
    nama: 'Logistik',
    ringkas: 'Surat jalan dan pengiriman',
    ikon: 'kirim',
    rute: '/logistik',
    siap: false,
    catatan: 'Belum dibangun backend maupun frontend',
    menu: [],
  },
  {
    id: 'sales_order',
    nama: 'Sales Order',
    ringkas: 'Pesanan penjualan dan piutang',
    ikon: 'transaksi',
    rute: '/sales-order',
    siap: false,
    catatan: 'Belum dibangun backend maupun frontend',
    menu: [],
  },
  {
    id: 'work_order',
    nama: 'Work Order',
    ringkas: 'Papan tugas antar staf',
    ikon: 'transaksi',
    rute: '/work-order',
    siap: false,
    catatan: 'Belum dimodelkan di backend',
    menu: [],
  },
  {
    id: 'inventory',
    nama: 'Inventory',
    ringkas: 'Stok tiga lapis dan posisi klaim',
    ikon: 'gudang',
    rute: '/inventory',
    siap: true,
    menu: [
      { label: 'Stok', rute: '/inventory' },
      { label: 'Monitor Tangki', rute: '/inventory/tangki' },
    ],
  },
  {
    id: 'keuangan',
    nama: 'Keuangan',
    ringkas: 'Pembayaran dan kas',
    ikon: 'buku',
    rute: '/keuangan',
    siap: false,
    catatan: 'Sebagian lewat modul akunting, layar sendiri belum ada',
    menu: [],
  },
  {
    id: 'pajak',
    nama: 'Pajak',
    ringkas: 'Faktur pajak',
    ikon: 'buku',
    rute: '/pajak',
    siap: false,
    catatan: 'Belum dimodelkan di backend',
    menu: [],
  },
  {
    id: 'dokumen',
    nama: 'Dokumen',
    ringkas: 'Lampiran surat jalan dan berkas lain',
    ikon: 'master',
    rute: '/dokumen',
    siap: false,
    catatan: 'Endpoint backend belum ada',
    menu: [],
  },
]

export const cariModul = (id) => MODUL.find((m) => m.id === id) ?? null

/**
 * Mengubah daftar modul dari backend ({ kode, label, ikon, rute }) menjadi
 * kartu siap-render. Backend menentukan MODUL APA yang muncul (otorisasi);
 * katalog lokal hanya menyumbang tampilannya (ringkas, menu, status siap).
 */
export const modulDariBackend = (modulBackend = []) =>
  modulBackend.map((mb) => {
    const lokal = cariModul(mb.kode)
    return {
      id: mb.kode,
      nama: mb.label ?? lokal?.nama ?? mb.kode,
      ikon: mb.ikon || lokal?.ikon || 'master',
      rute: mb.rute || lokal?.rute || '/',
      ringkas: lokal?.ringkas ?? '',
      catatan: lokal?.catatan ?? '',
      siap: lokal?.siap ?? false,
      menu: lokal?.menu ?? [],
    }
  })

export const IKON = {
  transaksi: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  buku: '<path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h3"/>',
  gudang: '<path d="M3 9l9-5 9 5v11H3z"/><path d="M8 20v-7h8v7"/>',
  produksi: '<path d="M4 20V9l5 3V9l5 3V6l6 4v10z"/><path d="M4 20h16"/>',
  kirim: '<path d="M2 7h11v9H2zM13 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  master: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/>',
  panah: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  balik: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  tambah: '<path d="M12 5v14M5 12h14"/>',
}
