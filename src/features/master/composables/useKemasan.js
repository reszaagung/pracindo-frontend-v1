import { ref } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function useKemasan() {
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref(null)

    const kategoriList = ref([])
    const kemasanList = ref([])


    const muatKategori = async () => {
        isLoading.value = true
        error.value = null
        try {
            const res = await api.get('inventory/kategori-kemasan/')
            kategoriList.value = res.data?.results || res.data || []
        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat daftar kategori kemasan.')
        } finally {
            isLoading.value = false
        }
    }

    const simpanKategori = async (payload, id = null) => {
        isSaving.value = true
        error.value = null
        try {
            if (id) {
                await api.put(`inventory/kategori-kemasan/${id}/`, payload)
            } else {
                await api.post('inventory/kategori-kemasan/', payload)
            }
            await muatKategori()
            return { success: true }
        } catch (err) {
            const msg = bacaError(err, 'Gagal menyimpan kategori kemasan.')
            error.value = msg
            return { success: false, message: msg }
        } finally {
            isSaving.value = false
        }
    }

    const hapusKategori = async (id) => {
        isSaving.value = true
        error.value = null
        try {
            await api.delete(`inventory/kategori-kemasan/${id}/`)
            await muatKategori()
            return { success: true }
        } catch (err) {
            const msg = bacaError(err, 'Gagal menghapus kategori kemasan. Pastikan kategori tidak sedang dipakai.')
            error.value = msg
            return { success: false, message: msg }
        } finally {
            isSaving.value = false
        }
    }


    /**
     * Memuat daftar kemasan. 
     * Mendukung filter dari backend: ?search=nama/sku & ?kategori=id
     */
    const muatKemasan = async (params = {}) => {
        isLoading.value = true
        error.value = null
        try {
            const res = await api.get('inventory/kemasan/', { params })
            kemasanList.value = res.data?.results || res.data || []
        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat daftar kemasan.')
        } finally {
            isLoading.value = false
        }
    }

    const simpanKemasan = async (payload, id = null) => {
        isSaving.value = true
        error.value = null
        try {
            if (id) {
                // Update (PUT)
                await api.put(`inventory/kemasan/${id}/`, payload)
            } else {
                // Create (POST)
                await api.post('inventory/kemasan/', payload)
            }
            await muatKemasan()
            return { success: true }
        } catch (err) {
            const msg = bacaError(err, 'Gagal menyimpan data kemasan.')
            error.value = msg
            return { success: false, message: msg }
        } finally {
            isSaving.value = false
        }
    }

    const hapusKemasan = async (id) => {
        isSaving.value = true
        error.value = null
        try {
            await api.delete(`inventory/kemasan/${id}/`)
            await muatKemasan()
            return { success: true }
        } catch (err) {
            const msg = bacaError(err, 'Gagal menghapus data kemasan.')
            error.value = msg
            return { success: false, message: msg }
        } finally {
            isSaving.value = false
        }
    }

    return {
        // State
        isLoading,
        isSaving,
        error,
        kategoriList,
        kemasanList,
        muatKategori,
        simpanKategori,
        hapusKategori,
        muatKemasan,
        simpanKemasan,
        hapusKemasan
    }
}