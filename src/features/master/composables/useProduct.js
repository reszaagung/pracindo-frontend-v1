import { ref, computed } from 'vue'
import api from '@/utils/api'

export function useProduct() {
    const dataProduk = ref([])
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')

    const fetchProduk = async (params = {}) => {
        isLoading.value = true
        error.value = null
        try {
            const response = await api.get('master/produk/', { params })
            dataProduk.value = response.data.results || response.data || []
        } catch (err) {
            console.error("Gagal memuat data master produk:", err)
            error.value = "Gagal memuat data dari database."
        } finally {
            isLoading.value = false
        }
    }

    const addProduk = async (payload) => {
        isLoading.value = true
        try {
            const response = await api.post('master/produk/', payload)
            await fetchProduk()
            return { success: true, data: response.data }
        } catch (err) {
            console.error("Gagal menambah produk:", err)
            return {
                success: false,
                message: err.response?.data?.message || err.response?.data?.detail || "Gagal menyimpan data ke server."
            }
        } finally {
            isLoading.value = false
        }
    }

    const deleteProduk = async (id_produk) => {
        isLoading.value = true
        try {
            await api.delete(`master/produk/${id_produk}/`)
            await fetchProduk()
            return { success: true }
        } catch (err) {
            console.error("Gagal menghapus produk:", err)
            return {
                success: false,
                message: err.response?.data?.message || err.response?.data?.detail || "Gagal menghapus data dari server."
            }
        } finally {
            isLoading.value = false
        }
    }

    const filteredProduk = computed(() => {
        if (!searchQuery.value) return dataProduk.value

        const lowerCaseQuery = searchQuery.value.toLowerCase()
        return dataProduk.value.filter(prod => {
            const nama = (prod.nama || '').toLowerCase()
            const kode = (prod.kode || '').toLowerCase()

            return nama.includes(lowerCaseQuery) || kode.includes(lowerCaseQuery)
        })
    })

    return {
        dataProduk,
        filteredProduk,
        searchQuery,
        isLoading,
        error,
        fetchProduk,
        addProduk,
        deleteProduk
    }
}