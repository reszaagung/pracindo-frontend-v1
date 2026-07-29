<template>
    <div class="max-w-5xl mx-auto pb-12">
        <!-- Area Header -->
        <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span
                        class="bg-indigo-50 text-indigo-600 font-bold text-[10px] tracking-wider uppercase px-2 py-1 rounded-md">
                        Inbound / Masuk
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-slate-800 m-0">Penerimaan Kemasan</h1>
                <p class="text-sm text-slate-500 mt-1">
                    Catat kedatangan fisik master kemasan (botol, galon, drum) dari suplier ke dalam gudang.
                </p>
            </div>

            <button
                class="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 w-fit">
                <i class="pi pi-list"></i> Lihat Riwayat Masuk
            </button>
        </header>

        <!-- Kartu Form Utama -->
        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
            <form @submit.prevent="simpanPenerimaan" class="flex flex-col gap-6">

                <!-- Baris 1: Tanggal & Suplier -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Tanggal
                            Datang</label>
                        <div class="relative">
                            <i class="pi pi-calendar absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input v-model="form.tanggal" type="date" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Nomor Surat Jalan /
                            PO</label>
                        <div class="relative">
                            <i class="pi pi-file absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input v-model="form.referensi" type="text" placeholder="Misal: SJ-2026/07/001" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none" />
                        </div>
                    </div>
                </div>

                <hr class="border-slate-100 my-2" />

                <!-- Baris 2: Pemilihan Master Kemasan -->
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Pilih Master
                        Kemasan</label>
                    <div class="relative">
                        <i class="pi pi-box absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <select v-model="form.kemasan_id" required
                            class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none appearance-none cursor-pointer">
                            <option value="" disabled>-- Pilih jenis kemasan yang datang --</option>
                            <option v-for="k in listKemasan" :key="k.id" :value="k.id">
                                [{{ k.kode_sku }}] {{ k.nama_kemasan }} (Kapasitas: {{ k.tampil_kapasitas }})
                            </option>
                        </select>
                        <i
                            class="pi pi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                    </div>
                    <p v-if="isLoadingData" class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <i class="pi pi-spin pi-spinner"></i> Memuat daftar kemasan...
                    </p>
                </div>

                <!-- Baris 3: Kuantitas Masuk -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Kuantitas Diterima
                            (Pcs)</label>
                        <div class="relative">
                            <i class="pi pi-plus-circle absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                            <input v-model.number="form.qty" type="number" min="1" placeholder="0" required
                                class="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-lg rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block pl-11 p-3 transition-all outline-none" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Kondisi
                            Barang</label>
                        <select v-model="form.kondisi" required
                            class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 block p-3 transition-all outline-none cursor-pointer">
                            <option value="BAIK">Kondisi Baik (Siap Pakai)</option>
                            <option value="RUSAK">Rusak / Cacat Pabrik (Karantina)</option>
                        </select>
                    </div>
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
                        {{ isMenyimpan ? 'Menyimpan...' : 'Simpan Barang Masuk' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useKemasan } from '@/features/master/composables/useKemasan'
// import api from '@/utils/api' // Disiapkan untuk endpoint mutasi masuk

// 1. Inisiasi Composable Master Kemasan
const { kemasan: listKemasan, isLoading: isLoadingData, fetchKemasan } = useKemasan()

// 2. State Lokal
const isMenyimpan = ref(false)
const pesanSukses = ref('')

const hariIni = () => {
    const t = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    return t.toISOString().slice(0, 10)
}

const form = reactive({
    tanggal: hariIni(),
    referensi: '',
    kemasan_id: '',
    qty: null,
    kondisi: 'BAIK'
})

const resetForm = () => {
    form.tanggal = hariIni()
    form.referensi = ''
    form.kemasan_id = ''
    form.qty = null
    form.kondisi = 'BAIK'
    pesanSukses.value = ''
}

// 3. Fungsi Submit
const simpanPenerimaan = async () => {
    isMenyimpan.value = true
    pesanSukses.value = ''

    try {
        // TODO: Ganti dengan POST Axios ke endpoint /api/inventory/mutasi-kemasan/
        // await api.post('/inventory/mutasi-kemasan/', payload_data)

        // Simulasi loading jaringan
        await new Promise(resolve => setTimeout(resolve, 800))

        pesanSukses.value = `Berhasil! Sebanyak ${form.qty} pcs kemasan telah ditambahkan ke dalam stok.`
        setTimeout(resetForm, 2500)

    } catch (error) {
        console.error(error)
        alert("Gagal merekam data penerimaan.")
    } finally {
        isMenyimpan.value = false
    }
}

// 4. Tarik data master saat halaman dimuat
onMounted(() => {
    fetchKemasan()
})
</script>