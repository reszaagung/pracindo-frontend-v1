/**
 * src/features/executive/composables/useExecutive.js
 * ===================================================
 * Mengambil data agregat untuk halaman Dashboard Eksekutif.
 * Endpoint ini diasumsikan mengirimkan rekapitulasi data dari berbagai 
 * aplikasi Django (Finance, Produksi, Logistik, HRD).
 */

import { ref } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function useExecutive() {
    const isLoading = ref(false)
    const error = ref(null)

    // Nilai awal (default) sebelum data ditarik dari server
    const metrik = ref({
        pemasukan: 0,
        pengeluaran: 0,
        piutang: 0,
        invoiceGantung: 0,
        produksiTonase: 0
    })

    const aktivitas = ref([])

    /**
     * Memuat seluruh data metrik dan aktivitas dari backend.
     */
    const muat = async () => {
        isLoading.value = true
        error.value = null

        try {
            // Catatan: Sesuaikan endpoint ini dengan URL yang ada di urls.py Django Anda
            const { data } = await api.get('executive/dashboard-summary/')

            // Asumsi response backend mereturn JSON dengan bentuk:
            // { metrik: {...}, aktivitas: [...] }
            if (data.metrik) metrik.value = data.metrik
            if (data.aktivitas) aktivitas.value = data.aktivitas

        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat data tinjauan eksekutif.')
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        metrik,
        aktivitas,
        muat
    }
}