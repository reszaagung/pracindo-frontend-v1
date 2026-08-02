// Titik impor tunggal untuk data mock. Hanya work_order yang mock — app itu
// memang kosong di backend (SPEK-BACKEND.md §8.3). Modul lain (entitas,
// master, akunting, warehouse) sudah hidup, jadi composable-nya menembak
// endpoint sungguhan langsung, tidak lewat sini.
export { pakaiMock } from '@/utils/mock'
export { WORK_ORDER_MOCK, STAFF_MOCK } from './workOrder'
