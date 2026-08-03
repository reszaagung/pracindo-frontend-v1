// src/features/warehouse/composables/useGoodsReceipt.js
// Kontrak diverifikasi langsung dari warehouse/views.py & serializers.py
// (pracindo_backend_v1) — lihat SPEK-BACKEND.md §3.3.

import { ref } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function useGoodsReceipt() {
    const daftarPOSiapTerima = ref([])
    const daftarPenerimaan = ref([])
    const ringkasan = ref(null)
    const sedangProses = ref(false)
    const galat = ref('')

    const muatPOSiapTerima = async (params = {}) => {
        sedangProses.value = true
        galat.value = ''
        try {
            const { data } = await api.get('warehouse/po-siap-terima/', { params })
            daftarPOSiapTerima.value = data.results || data || []
        } catch (err) {
            galat.value = bacaError(err, 'Gagal memuat PO siap terima.')
        } finally {
            sedangProses.value = false
        }
    }

    const muatPenerimaan = async (params = {}) => {
        sedangProses.value = true
        galat.value = ''
        try {
            const { data } = await api.get('warehouse/penerimaan/', { params })
            daftarPenerimaan.value = data.results || data || []
        } catch (err) {
            galat.value = bacaError(err, 'Gagal memuat daftar penerimaan.')
        } finally {
            sedangProses.value = false
        }
    }

    const muatRingkasan = async (id) => {
        sedangProses.value = true
        galat.value = ''
        try {
            const { data } = await api.get(`warehouse/penerimaan/${id}/ringkasan/`)
            ringkasan.value = data
        } catch (err) {
            galat.value = bacaError(err, 'Gagal memuat ringkasan penerimaan.')
        } finally {
            sedangProses.value = false
        }
    }

    /** @returns {Promise<{success:true,data:{penerimaan,laporan_selisih,pesan}}|{success:false,message:string}>} */
    const simpanPenerimaan = async (payload) => {
        sedangProses.value = true
        galat.value = ''
        try {
            const { data } = await api.post('warehouse/penerimaan/', payload)
            return { success: true, data }
        } catch (err) {
            galat.value = bacaError(err, 'Gagal menyimpan penerimaan.')
            return { success: false, message: galat.value }
        } finally {
            sedangProses.value = false
        }
    }

    return {
        daftarPOSiapTerima, daftarPenerimaan, ringkasan, sedangProses, galat,
        muatPOSiapTerima, muatPenerimaan, muatRingkasan, simpanPenerimaan,
    }
}
