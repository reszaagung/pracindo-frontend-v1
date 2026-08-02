/**
 * src/config/modules.js
 * ======================
 */

export const ROLE = {
  SUPERVISOR: 'SUPERVISOR',
  STAFF: 'STAFF',
  PRODUKSI: 'PRODUKSI',
  GUDANG: 'GUDANG',
  SALES: 'SALES',
}

export const MODUL = [
  {
    id: 'transaksi',
    nama: 'Input Transaksi',
    ringkas: 'Pembuatan Purchase Order (PO)',
    ikon: 'transaksi',
    rute: '/accounting/transaksi/po',
    roles: [ROLE.STAFF, ROLE.GUDANG],
    siap: true,
    sembunyiDiDashboard: false,
    menu: [
      { label: 'Pembelian (PO)', rute: '/accounting/transaksi/po' },
    ],
  },

]

export const bolehAkses = (modul, role) =>
  role === ROLE.SUPERVISOR || modul.roles.includes(role)

export const modulUntuk = (role) => MODUL.filter(m => bolehAkses(m, role))

export const modulDashboard = (role) =>
  modulUntuk(role).filter(m => !m.sembunyiDiDashboard)

export const cariModul = (id) => MODUL.find(m => m.id === id) ?? null

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