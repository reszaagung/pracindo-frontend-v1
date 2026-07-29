/**
 * src/features/accounting/composables/useExpend.js
 * ==============================================
 * Composable untuk menangani pencatatan pengeluaran (OpEx / CapEx).
 * TERKONEKSI DENGAN API DJANGO + UX Loading Enhancement
 */

import { ref } from 'vue'
import api from '@/utils/api'

export function useExpend() {
    const isLoading = ref(false)
    const error = ref(null)
    const successMsg = ref('')
    const riwayatPengeluaran = ref([])

    /**
     * Mengambil daftar riwayat pengeluaran dari Backend
     */
    const fetchPengeluaran = async () => {
        error.value = null
        try {
            const response = await api.get('/expense/pengeluaran/')
            riwayatPengeluaran.value = response.data.results || response.data
        } catch (err) {
            console.error("Gagal mengambil riwayat pengeluaran:", err)
            error.value = 'Gagal memuat riwayat pengeluaran.'
        }
    }

    /**
     * Mengirim data pengeluaran baru ke Backend
     */
    const rekamPengeluaran = async (payload) => {
        isLoading.value = true
        error.value = null
        successMsg.value = ''

        try {
            // Memaksa loading tampil minimal 500ms agar mata user sempat melihatnya
            const [response] = await Promise.all([
                api.post('/expense/pengeluaran/', payload),
                new Promise(resolve => setTimeout(resolve, 500))
            ])

            // Masukkan data sukses dari server langsung ke urutan teratas tabel UI
            riwayatPengeluaran.value.unshift(response.data)

            successMsg.value = 'Pengeluaran berhasil dicatat ke sistem!'
            return { success: true, data: response.data }
        } catch (err) {
            const pesanGalat = err.response?.data?.detail
                || err.response?.data?.message
                || 'Terjadi kesalahan saat menyimpan data ke server.'

            error.value = pesanGalat
            return { success: false, message: error.value }
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        successMsg,
        riwayatPengeluaran,
        fetchPengeluaran,
        rekamPengeluaran
    }
}