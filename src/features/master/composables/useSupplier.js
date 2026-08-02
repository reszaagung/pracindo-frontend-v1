// src/features/master/composables/useSupplier.js
// master/suplier/ sudah hidup di backend (diverifikasi manual oleh pengguna
// terhadap server yang jalan — lihat SPEK-BACKEND.md §3.4). Tidak ada mock.

import { ref } from 'vue'
import api from '@/utils/api'

export function useSupplier() {
    const daftarSuplier = ref([])
    const sedangProses = ref(false)
    const pesanError = ref('')

    /**
     * Mengambil data lengkap untuk tabel Master Suplier
     * Menerima params seperti { search: 'kata kunci', aktif: true }
     */
    const ambilSuplier = async (params = {}) => {
        sedangProses.value = true
        pesanError.value = ''
        try {
            const { data } = await api.get('master/suplier/', {
                params: { search: params.search, aktif: params.aktif }
            })
            daftarSuplier.value = data.results || data
        } catch (err) {
            pesanError.value = err.response?.data?.detail || 'Gagal memuat data suplier.'
        } finally {
            sedangProses.value = false
        }
    }

    /**
     * Mengambil data ringkas khusus untuk Dropdown (digunakan di modul Accounting dll)
     * GET master/suplier/?ringkas=1&aktif=true
     */
    const ambilSuplierRingkas = async () => {
        try {
            const { data } = await api.get('master/suplier/', {
                params: { ringkas: 1, aktif: true }
            })
            return data.results || data
        } catch (err) {
            console.error('Gagal memuat dropdown suplier:', err)
            return []
        }
    }

    /**
     * Menyimpan suplier (Tambah baru jika id kosong, atau Update jika id ada)
     * Hanya berhasil untuk role ADMIN atau SUPERVISOR — role lain dapat 403.
     * Sembunyikan tombol tambah/ubah di komponen untuk role tanpa izin,
     * jangan andalkan 403 sebagai satu-satunya penjaga.
     */
    const simpanSuplier = async (payload, id = null) => {
        sedangProses.value = true
        pesanError.value = ''
        try {
            if (id) {
                await api.patch(`master/suplier/${id}/`, payload)
            } else {
                await api.post('master/suplier/', payload)
            }
            return { success: true }
        } catch (err) {
            pesanError.value = err.response?.data?.detail || 'Gagal menyimpan data suplier.'
            return { success: false }
        } finally {
            sedangProses.value = false
        }
    }

    return {
        // State
        daftarSuplier,
        sedangProses,
        pesanError,

        // Actions
        ambilSuplier,
        ambilSuplierRingkas,
        simpanSuplier
    }
}
