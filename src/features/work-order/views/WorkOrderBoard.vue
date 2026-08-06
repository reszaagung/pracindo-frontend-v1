<template>
    <div class="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6">

        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Mading Operasional & Produksi</h1>
                <p class="text-slate-500 text-sm">Daftar pesanan pabrik dan diskusi penugasan tim.</p>
            </div>
            <button @click="fetchMading"
                class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                <i class="pi pi-refresh" :class="{ 'pi-spin': isLoading }"></i>
            </button>
        </header>

        <!-- Indikator Loading -->
        <div v-if="isLoading && madingList.length === 0" class="flex justify-center py-12 text-slate-400">
            <i class="pi pi-spin pi-spinner text-3xl"></i>
        </div>

        <!-- Tampilan "Empty State" jika data kosong -->
        <div v-else-if="!isLoading && madingList.length === 0"
            class="flex flex-col items-center justify-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed text-center">
            <div
                class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <i class="pi pi-inbox text-2xl text-slate-300"></i>
            </div>
            <h3 class="text-slate-700 font-bold mb-1">Mading Kosong</h3>
            <p class="text-slate-500 text-sm max-w-sm">Belum ada tugas atau pesanan produksi aktif saat ini. Semua
                pekerjaan sudah diselesaikan!</p>
        </div>

        <!-- Grid Card Work Order -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="wo in madingList" :key="wo.id"
                class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div :class="[
                    'p-4 border-b flex justify-between items-center',
                    wo.kategori === 'PRODUKSI' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
                ]">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-md"
                        :class="wo.kategori === 'PRODUKSI' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'">
                        {{ wo.kategori }}
                    </span>
                    <span class="text-xs font-semibold text-slate-500">{{ wo.nomor }}</span>
                </div>

                <div class="p-5 flex-1 space-y-4">
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ wo.judul }}</h3>
                        <p class="text-slate-500 text-sm mt-1 line-clamp-2">{{ wo.deskripsi }}</p>
                    </div>

                    <div v-if="wo.kategori === 'PRODUKSI' && wo.detail_produksi"
                        class="bg-rose-50/50 border border-rose-100 rounded-xl p-3 space-y-2">
                        <div class="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Target Manufaktur
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600">Varian:</span>
                            <span class="font-semibold text-slate-900">{{ wo.detail_produksi.nama_item }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600">Kemasan:</span>
                            <span class="font-semibold text-slate-900">{{ wo.detail_produksi.unit_display }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600">Merek/Stiker:</span>
                            <span class="font-semibold text-slate-900">{{ wo.detail_produksi.stiker_display }}</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div class="flex flex-col">
                            <span class="text-[10px] uppercase font-bold text-slate-400">Deadline</span>
                            <span class="text-sm font-semibold"
                                :class="wo.terlambat ? 'text-red-500' : 'text-slate-700'">
                                {{ wo.deadline || 'Tidak ada' }}
                            </span>
                        </div>
                        <div class="flex -space-x-2 overflow-hidden">
                            <div v-for="tag in wo.penugasan" :key="tag.id"
                                v-tooltip.top="tag.staff_nama + (tag.is_pic ? ' (PIC)' : '')"
                                class="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600"
                                :class="{ 'ring-2 ring-emerald-400': tag.is_selesai_personal }">
                                {{ tag.staff_nama.charAt(0) }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button @click="openChatModal(wo)"
                        class="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 py-2 rounded-xl text-sm font-semibold transition flex justify-center items-center gap-2">
                        <i class="pi pi-comments text-slate-400"></i>
                        <span>Diskusi ({{ wo.pesan_chat?.length || 0 }})</span>
                    </button>

                    <button @click="handleApprove(wo.id)"
                        class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-semibold shadow-sm transition flex justify-center items-center gap-2">
                        <i class="pi pi-check"></i>
                        <span>Selesaikan</span>
                    </button>
                </div>

            </div>
        </div>

        <Dialog v-model:visible="isChatOpen" modal header="Ruang Diskusi" :style="{ width: '400px' }" class="p-fluid">
            <div v-if="activeWO" class="flex flex-col h-[400px]">

                <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 rounded-xl custom-scrollbar" ref="chatBox">
                    <div v-if="activeWO.pesan_chat.length === 0" class="text-center text-slate-400 text-sm mt-10">
                        Belum ada diskusi. Jadilah yang pertama menyapa!
                    </div>

                    <div v-for="msg in activeWO.pesan_chat" :key="msg.id" class="flex flex-col">
                        <span class="text-[10px] text-slate-400 font-semibold mb-1 ml-1">{{ msg.pengirim_nama }}</span>
                        <div
                            class="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 shadow-sm w-fit max-w-[85%]">
                            {{ msg.teks }}
                        </div>
                    </div>
                </div>

                <div class="mt-4 flex gap-2">
                    <input type="text" v-model="chatInput" @keyup.enter="kirimPesan" placeholder="Ketik pesan..."
                        class="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-900 transition-colors">
                    <button @click="kirimPesan" :disabled="isSending || !chatInput.trim()"
                        class="w-10 h-10 bg-slate-900 text-white rounded-xl flex justify-center items-center disabled:opacity-50 hover:bg-slate-800 transition-colors">
                        <i class="pi pi-send" :class="{ 'pi-spin pi-spinner': isSending }"></i>
                    </button>
                </div>
            </div>
        </Dialog>

    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useWorkOrder } from '@/features/work-order/composables/useWorkOrder'
import Dialog from 'primevue/dialog'
const { isLoading, isSending, madingList, fetchMading, approveTask, sendReply } = useWorkOrder()


const isChatOpen = ref(false)
const activeWO = ref(null)
const chatInput = ref('')
const chatBox = ref(null)

onMounted(() => {
    fetchMading()
})

const handleApprove = async (woId) => {
    if (confirm('Apakah Anda yakin ingin menyelesaikan tugas/pesanan ini?')) {
        await approveTask(woId)
    }
}

const openChatModal = (wo) => {
    activeWO.value = wo
    isChatOpen.value = true
    scrollToBottom()
}

const kirimPesan = async () => {
    if (!activeWO.value || !chatInput.value.trim()) return

    const success = await sendReply(activeWO.value, chatInput.value)
    if (success) {
        chatInput.value = ''
        scrollToBottom()
    }
}

const scrollToBottom = () => {
    nextTick(() => {
        if (chatBox.value) {
            chatBox.value.scrollTop = chatBox.value.scrollHeight
        }
    })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>