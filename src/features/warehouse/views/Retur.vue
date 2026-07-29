<template>
    <div class="max-w-5xl mx-auto pb-12">
        <!-- Area Header -->
        <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span
                        class="bg-rose-50 text-rose-600 font-bold text-[10px] tracking-wider uppercase px-2 py-1 rounded-md">
                        Pengembalian
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-slate-800 m-0">Retur Barang</h1>
                <p class="text-sm text-slate-500 mt-1">
                    Catat pengembalian barang dari customer, pengembalian material ke suplier, atau sisa produksi.
                </p>
            </div>

            <button
                class="bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 w-fit">
                <i class="pi pi-history"></i> Riwayat Retur
            </button>
        </header>

        <!-- Kartu Form Utama -->
        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
            <form @submit.prevent="simpanRetur" class="flex flex-col gap-6">

                <!-- Baris 1: Tipe Retur & Tanggal -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Jenis
                            Pengembalian</label>
                        <div class="relative">
                            <i class="pi pi-directions absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <select v-model="form.jenis_retur" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none appearance-none cursor-pointer">
                                <option value="" disabled>-- Pilih alur retur --</option>
                                <optgroup label="Barang Masuk ke Gudang (+)">
                                    <option value="IN_CUSTOMER">Dari Customer (Barang Jadi Rusak/Tolak)</option>
                                    <option value="IN_PRODUKSI">Dari Produksi (Sisa Bahan/Kemasan)</option>
                                </optgroup>
                                <optgroup label="Barang Keluar dari Gudang (-)">
                                    <option value="OUT_SUPLIER">Ke Suplier (Bahan/Kemasan Cacat)</option>
                                </optgroup>
                            </select>
                            <i
                                class="pi pi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Tanggal
                            Retur</label>
                        <div class="relative">
                            <i class="pi pi-calendar absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input v-model="form.tanggal" type="date" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none" />
                        </div>
                    </div>
                </div>

                <!-- Baris 2: Referensi Dokumen -->
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Nomor Dokumen Asal /
                        Referensi</label>
                    <div class="relative">
                        <i class="pi pi-file absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input v-model="form.referensi" type="text"
                            placeholder="Misal: Nomor Surat Jalan awal, atau Nomor PO Suplier" required
                            class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none" />
                    </div>
                </div>

                <hr class="border-slate-100 my-2" />

                <!-- Baris 3: Item & Kuantitas -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="flex flex-col gap-2 md:col-span-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Pilih Item
                            (Barang/Kemasan/Raw)</label>
                        <div class="relative">
                            <i class="pi pi-box absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <!-- Catatan: Nantinya dropdown ini diganti dengan komponen pencarian item universal -->
                            <select v-model="form.item_id" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none appearance-none cursor-pointer">
                                <option value="" disabled>-- Pilih barang yang diretur --</option>
                                <option value="ITM-001">Jerrycan 5 Liter (Kemasan)</option>
                                <option value="ITM-002">Produk Pembersih Lantai 1L (Barang Jadi)</option>
                                <option value="ITM-003">Serbuk Kimia Dasar (Bahan Baku)</option>
                            </select>
                            <i
                                class="pi pi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Kuantitas</label>
                        <div class="relative">
                            <i
                                class="pi pi-sort-numeric-up-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input v-model.number="form.qty" type="number" min="1" placeholder="0" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-lg rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none" />
                        </div>
                    </div>
                </div>

                <!-- Baris 4: Keterangan / Alasan -->
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Alasan / Catatan
                        Kerusakan</label>
                    <textarea v-model="form.alasan" rows="3" required
                        placeholder="Jelaskan secara singkat alasan barang dikembalikan..."
                        class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block p-4 transition-all outline-none"></textarea>
                </div>

                <!-- Pesan Status -->
                <div v-if="pesanSukses"
                    class="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-3 text-sm font-semibold">
                    <i class="pi pi-check-circle text-lg"></i> {{ pesanSukses }}
                </div>

                <!-- Aksi -->
                <div class="mt-4 flex justify-end gap-3">
                    <button type="button" @click="resetForm"
                        class="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all border border-slate-200">
                        Batal
                    </button>
                    <button type="submit" :disabled="isMenyimpan"
                        class="px-8 py-3 rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <i :class="isMenyimpan ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i>
                        {{ isMenyimpan ? 'Proses Retur' : 'Proses Retur' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRetur } from '@/features/warehouse/composables/useRetur'

const { isLoading, error, successMsg, rekamRetur, fetchRiwayatRetur } = useRetur()

const hariIni = () => {
    const t = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    return t.toISOString().slice(0, 10)
}

const form = reactive({
    jenis_retur: '',
    tanggal: hariIni(),
    referensi: '',
    item_id: '',
    qty: null,
    alasan: ''
})

const resetForm = () => {
    form.jenis_retur = ''
    form.tanggal = hariIni()
    form.referensi = ''
    form.item_id = ''
    form.qty = null
    form.alasan = ''
    error.value = null
}

const simpanRetur = async () => {
    const hasil = await rekamRetur({
        jenis_retur: form.jenis_retur,
        tanggal: form.tanggal,
        referensi: form.referensi,
        item_id: form.item_id,
        qty: form.qty,
        alasan: form.alasan
    })

    if (hasil.success) {
        setTimeout(() => {
            if (successMsg.value) {
                resetForm()
                successMsg.value = ''
            }
        }, 2000)
    }
}


onMounted(() => {
    fetchRiwayatRetur()
})
</script>