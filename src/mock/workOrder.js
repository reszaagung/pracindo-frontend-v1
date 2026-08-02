// Fixture untuk useWorkOrder — work_order BELUM DIMODELKAN sama sekali di
// backend (SPEK-BACKEND.md §8.3), jadi ini satu-satunya sumber data selama
// tidak ada kontrak resmi untuk ditembak.
export const STAFF_MOCK = [
  { id: 1, nama_lengkap: 'Budi Santoso', jabatan: 'Admin Gudang' },
  { id: 2, nama_lengkap: 'Siti Rahma', jabatan: 'Staf Akunting' },
  { id: 3, nama_lengkap: 'Ahmad Fauzi', jabatan: 'Supervisor' },
]

export const WORK_ORDER_MOCK = [
  {
    id: 1,
    judul: 'Cek stok gudang sebelum tutup buku',
    deskripsi: 'Hitung ulang stok RAW gula & teh celup.',
    tanggal: '2026-08-01',
    deadline: '2026-08-03',
    selesai: false,
    terlambat: false,
    dibuat_oleh_username: 'admin',
    penugasan: [{ staff: 1 }],
  },
  {
    id: 2,
    judul: 'Konfirmasi harga suplier baru',
    deskripsi: 'Follow up penawaran dari CV Kemasan Prima.',
    tanggal: '2026-07-28',
    deadline: '2026-07-30',
    selesai: false,
    terlambat: true,
    dibuat_oleh_username: 'admin',
    penugasan: [{ staff: 2 }],
  },
]
