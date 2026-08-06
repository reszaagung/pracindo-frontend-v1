import { ref } from 'vue'
import api from '@/utils/api' // Sesuaikan dengan instance Axios Anda

export function useWorkOrder() {
    const isLoading = ref(false)
    const isSending = ref(false)
    const madingList = ref([])
    const staffList = ref([])

    // Menarik daftar Mading (Tugas aktif & Pesanan Produksi)
    const fetchMading = async () => {
        isLoading.value = true
        try {
            const response = await api.get('work-order/mading/')
            // Sesuaikan pembacaan respon dengan struktur Axios Anda (response.data atau response.data.results)
            madingList.value = response.data.results || response.data
        } catch (error) {
            console.error("Gagal memuat mading Work Order:", error)
        } finally {
            isLoading.value = false
        }
    }

    // Menarik daftar staf untuk keperluan Tagging
    const fetchStaff = async () => {
        try {
            const response = await api.get('work-order/staff/')
            staffList.value = response.data.results || response.data
        } catch (error) {
            console.error("Gagal memuat daftar staff:", error)
        }
    }

    // Mengirim persetujuan tugas (Approve)
    const approveTask = async (woId, catatan = '') => {
        try {
            const response = await api.post(`work-order/${woId}/approve/`, { catatan })
            alert(response.data.detail || "Berhasil diperbarui!")
            await fetchMading() // Refresh papan mading agar tugas yang selesai menghilang
            return true
        } catch (error) {
            alert(error.response?.data?.detail || "Gagal memproses persetujuan.")
            return false
        }
    }

    // Mengirim balasan chat ke dalam Work Order
    const sendReply = async (wo, teksPesan) => {
        if (!teksPesan.trim()) return

        isSending.value = true
        try {
            const response = await api.post(`work-order/${wo.id}/kirim_pesan/`, { teks: teksPesan })

            // Reaktivitas Instan: Masukkan chat baru langsung ke array tanpa fetch ulang
            if (!wo.pesan_chat) wo.pesan_chat = []
            wo.pesan_chat.push(response.data)

            return true
        } catch (error) {
            console.error("Gagal mengirim pesan:", error)
            alert("Gagal mengirim pesan. Cek koneksi Anda.")
            return false
        } finally {
            isSending.value = false
        }
    }

    return {
        isLoading,
        isSending,
        madingList,
        staffList,
        fetchMading,
        fetchStaff,
        approveTask,
        sendReply
    }
}