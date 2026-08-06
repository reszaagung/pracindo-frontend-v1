import { ref } from 'vue'
import api from '@/utils/api'

export function useWorkOrder() {
    const isLoading = ref(false)
    const isSending = ref(false)
    const madingList = ref([])
    const staffList = ref([])

    const fetchMading = async () => {
        isLoading.value = true
        try {
            const response = await api.get('work-order/')

            const semuaData = response.data.results || response.data
            madingList.value = semuaData.filter(wo => wo.selesai === false)

        } catch (error) {
            console.error("Gagal memuat mading Work Order:", error)
        } finally {
            isLoading.value = false
        }
    }
    const fetchStaff = async () => {
        try {
            const response = await api.get('work-order/staff/')
            staffList.value = response.data.results || response.data
        } catch (error) {
            console.error("Gagal memuat daftar staff:", error)
        }
    }

    const approveTask = async (woId, catatan = '') => {
        try {
            const response = await api.post(`work-order/${woId}/approve/`, { catatan })
            alert(response.data.detail || "Berhasil diperbarui!")
            await fetchMading()
            return true
        } catch (error) {
            alert(error.response?.data?.detail || "Gagal memproses persetujuan.")
            return false
        }
    }

    const sendReply = async (wo, teksPesan) => {
        if (!teksPesan.trim()) return

        isSending.value = true
        try {
            const response = await api.post(`work-order/${wo.id}/kirim_pesan/`, { teks: teksPesan })
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