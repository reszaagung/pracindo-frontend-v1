// work_order (satu-satunya modul yang benar-benar kosong di backend — lihat
// SPEK-BACKEND.md §8.3) memakai fixture lokal lewat flag ini alih-alih
// menembak URL yang belum ada.
export const pakaiMock = import.meta.env.VITE_USE_MOCK === 'true'
