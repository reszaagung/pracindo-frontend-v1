/**
 * src/features/warehouse/composables/useRetur.js
 * ================================================
 * Menangani penarikan riwayat retur dan pengiriman data retur baru ke API.
 * TERKONEKSI DENGAN API DJANGO + UX Loading Enhancement
 */

import { ref } from 'vue'
import api from '@/utils/api'

export function useRetur() {
    const isLoading = ref(false)
    const error = ref(null)
    const successMsg = ref('')
    const riwayatRetur = ref([])

    /**
     * Mengambil daftar riwayat retur dari Backend
     * @param {Object} params - Parameter opsional untuk filter/pencarian
     */
    const fetchRiwayatRetur = async (params = {}) => {
        error.value = null
        try {
            const response = await api.get('/inventory/retur/', { params })
            riwayatRetur.value = response.data.results || response.data
        } catch (err) {
            console.error("Gagal mengambil riwayat retur:", err)
            error.value = 'Gagal memuat riwayat retur dari server.'
        }
    }

    /**
     * Mengirim data retur baru ke Backend
     * @param {Object} payload - Data form retur
     */
    const rekamRetur = async (payload) => {
        isLoading.value = true
        error.value = null
        successMsg.value = ''

        try {
            // Memaksa loading tampil minimal 500ms agar mata user sempat melihatnya
            const [response] = await Promise.all([
                api.post('/inventory/retur/', payload),
                new Promise(resolve => setTimeout(resolve, 500))
            ])

            // Menambahkan data yang baru disave ke urutan teratas tabel UI
            riwayatRetur.value.unshift(response.data)

            successMsg.value = 'Data retur berhasil diproses dan dicatat ke sistem!'
            return { success: true, data: response.data }
        } catch (err) {
            const pesanGalat = err.response?.data?.detail
                || err.response?.data?.message
                || 'Terjadi kesalahan saat menyimpan data retur ke server.'

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
        riwayatRetur,
        fetchRiwayatRetur,
        rekamRetur
    }
}