<template>
    <div class="max-w-6xl mx-auto pb-12 animate-fade-in">
        <!-- Area Header -->
        <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span
                        class="bg-indigo-50 text-indigo-600 font-bold text-[10px] tracking-wider uppercase px-2 py-1 rounded-md">
                        RnD / Work In Progress
                    </span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-slate-800 m-0">Produksi & Pemakaian Bahan</h1>
                <p class="text-sm text-slate-500 mt-1">
                    Catat pemakaian fisik bahan (Joint-Pool) dan tujuan tangki penampungan.
                </p>
            </div>

            <button
                class="bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 w-fit">
                <i class="pi pi-list"></i> Riwayat Produksi
            </button>
        </header>

        <!-- Pesan Galat Global -->
        <div v-if="error"
            class="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex items-center gap-3 text-sm font-semibold">
            <i class="pi pi-exclamation-triangle text-lg"></i> {{ error }}
        </div>

        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
            <form @submit.prevent="simpanProduksi" class="flex flex-col gap-8">

                <!-- BAGIAN 1: IDENTITAS (Tanpa Pemilik) -->
                <section>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                        <h2 class="text-base font-bold text-slate-800 uppercase tracking-wide">1. Identitas WIP
                            (Joint-Pool)</h2>
                    </div>

                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">

                        <!-- Jenis Proses -->
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Jenis
                                Proses</label>
                            <div class="relative">
                                <i class="pi pi-cog absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <select v-model="form.jenis_proses" @change="handleProsesChange" required
                                    class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block pl-11 p-3 transition-all outline-none appearance-none cursor-pointer">
                                    <option value="" disabled>-- Pilih --</option>
                                    <option value="Mixing">Mixing</option>
                                    <option value="Blending">Blending</option>
                                </select>
                                <i
                                    class="pi pi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                            </div>
                        </div>

                        <!-- Total Hasil Otomatis -->
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Total Hasil
                                Fisik Akhir (KG)</label>
                            <div class="relative">
                                <i class="pi pi-chart-pie absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                <input type="text" :value="totalKuantitas" readonly
                                    class="w-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-sm rounded-2xl focus:outline-none block pl-11 p-3 transition-all cursor-not-allowed appearance-none" />
                            </div>
                        </div>
                    </div>
                </section>

                <hr class="border-slate-100" />

                <!-- BAGIAN 2: PENAMPUNGAN HASIL FISIK -->
                <section>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
                        <h2 class="text-base font-bold text-slate-800 uppercase tracking-wide">2. Muara Fisik (Tangki
                            Tujuan)</h2>
                    </div>

                    <div class="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6">

                        <!-- Pilihan Radio -->
                        <div class="flex flex-col gap-3 min-w-[200px]">
                            <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Status
                                Tangki</label>
                            <div class="flex items-center gap-4 h-full">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="form.tipe_tangki_tujuan" value="eksisting"
                                        class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300">
                                    <span class="text-sm font-medium text-slate-700">Tangki Eksisting</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" v-model="form.tipe_tangki_tujuan" value="baru"
                                        class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300">
                                    <span class="text-sm font-medium text-slate-700">Wadah Baru</span>
                                </label>
                            </div>
                        </div>

                        <!-- Input Dinamis Berdasarkan Pilihan -->
                        <div class="flex-1">
                            <div v-if="form.tipe_tangki_tujuan === 'eksisting'" class="flex flex-col gap-2">
                                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Pilih Tangki
                                    / Wadah</label>
                                <select v-model="form.tanki_tujuan_id"
                                    :required="form.tipe_tangki_tujuan === 'eksisting'"
                                    class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 transition-all outline-none">
                                    <option value="" disabled>-- Pilih Tangki Penampungan --</option>
                                    <option v-for="t in tankiTujuanList" :key="t.id" :value="t.id">{{ t.kode }} - {{
                                        t.nama }}</option>
                                </select>
                            </div>

                            <div v-else class="flex flex-col gap-2 animate-fade-in">
                                <!-- Wadah Baru -->
                                <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Nama Wadah
                                    Baru (IBC/Kempu)</label>
                                <input type="text" v-model="form.nama_tangki_baru"
                                    :required="form.tipe_tangki_tujuan === 'baru'" placeholder="Ex: IBC Kempu Hijau 01"
                                    class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 transition-all outline-none" />
                            </div>
                        </div>
                    </div>
                </section>

                <hr class="border-slate-100" />

                <!-- BAGIAN 3: INPUT KOMPOSISI -->
                <section>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-5 bg-amber-500 rounded-full"></div>
                            <h2 class="text-base font-bold text-slate-800 uppercase tracking-wide">3. Komposisi Bahan
                                Input</h2>
                        </div>
                        <button type="button" @click="tambahInput" :disabled="!form.jenis_proses"
                            class="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="pi pi-plus"></i> Tambah Input
                        </button>
                    </div>

                    <div v-if="!form.jenis_proses"
                        class="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        Silakan pilih "Jenis Proses" terlebih dahulu untuk memasukkan komposisi.
                    </div>

                    <div v-else class="flex flex-col gap-3">
                        <div v-for="(item, index) in form.komposisi" :key="item.id"
                            class="flex flex-col md:flex-row gap-3 p-4 bg-white border border-slate-200 rounded-2xl items-start md:items-end group relative transition-all hover:border-indigo-300 shadow-sm hover:shadow-md">

                            <!-- Tipe Sumber -->
                            <div v-if="form.jenis_proses === 'Blending'" class="flex flex-col gap-2 w-full md:w-48">
                                <label class="text-[10px] font-bold text-slate-500 uppercase">Tipe Sumber</label>
                                <select v-model="item.tipe_sumber" @change="item.item_id = ''" required
                                    class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all outline-none">
                                    <option value="raw_material">Raw Material</option>
                                    <option value="tangki_mixing">Tangki Mixing</option>
                                </select>
                            </div>

                            <!-- Pilih Item -->
                            <div class="flex flex-col gap-2 flex-1 w-full">
                                <label class="text-[10px] font-bold text-slate-500 uppercase">
                                    {{ item.tipe_sumber === 'raw_material' ? 'Nama Bahan Baku' : 'Sumber Tangki Mixing'
                                    }}
                                </label>

                                <select v-if="item.tipe_sumber === 'raw_material'" v-model="item.item_id" required
                                    class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all outline-none">
                                    <option value="" disabled>-- Pilih Bahan --</option>
                                    <option v-for="b in bahanList" :key="b.id" :value="b.id">{{ b.nama_bahan }}</option>
                                </select>

                                <select v-else v-model="item.item_id" required
                                    class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all outline-none">
                                    <option value="" disabled>-- Pilih Tangki Sumber --</option>
                                    <option v-for="t in tankiList" :key="t.id" :value="t.id">{{ t.kode }} - {{ t.nama }}
                                    </option>
                                </select>
                            </div>

                            <!-- Qty Dipakai -->
                            <div class="flex flex-col gap-2 w-full md:w-40">
                                <label class="text-[10px] font-bold text-slate-500 uppercase">Kuantitas Input
                                    (KG)</label>
                                <input v-model.number="item.qty" type="number" min="0.01" step="0.01" placeholder="0"
                                    required
                                    class="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all outline-none text-right" />
                            </div>

                            <button type="button" @click="hapusInput(index)" v-if="form.komposisi.length > 1"
                                class="w-full md:w-auto mt-2 md:mt-0 px-4 py-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center h-[42px]"
                                title="Hapus baris ini">
                                <i class="pi pi-trash"></i>
                            </button>
                        </div>
                    </div>
                </section>

                <hr class="border-slate-100" />

                <!-- BAGIAN 4: CATATAN & SUBMIT -->
                <section>
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-semibold text-slate-700 uppercase tracking-wide">Catatan
                            Produksi</label>
                        <textarea v-model="form.catatan" rows="2" placeholder="Catat kondisi pencampuran, dsb..."
                            class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-4 transition-all outline-none"></textarea>
                    </div>

                    <div v-if="pesanSukses"
                        class="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-3 text-sm font-semibold">
                        <i class="pi pi-check-circle text-lg"></i> {{ pesanSukses }}
                    </div>

                    <div class="mt-8 flex justify-end gap-3">
                        <button type="button" @click="resetForm"
                            class="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all border border-slate-200">
                            Reset Form
                        </button>
                        <button type="submit"
                            :disabled="isMenyimpan || isLoading || form.komposisi.length === 0 || !form.jenis_proses || totalKuantitas <= 0"
                            class="px-8 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <i :class="isMenyimpan ? 'pi pi-spin pi-spinner' : 'pi pi-sync'"></i>
                            {{ isMenyimpan ? 'Menyimpan...' : 'Simpan Produksi' }}
                        </button>
                    </div>
                </section>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useProduksi } from '@/features/rnd/composables/useProduksi'

const {
    isLoading,
    isMenyimpan,
    error,
    tankiList,
    tankiTujuanList,
    bahanList,
    muatReferensi,
    simpanPemakaianBahan
} = useProduksi()

const pesanSukses = ref('')

const form = reactive({
    jenis_proses: '',
    tipe_tangki_tujuan: 'eksisting',
    nama_tangki_baru: '',
    tanki_tujuan_id: '',
    catatan: '',
    komposisi: [
        { id: Date.now(), tipe_sumber: 'raw_material', item_id: '', qty: null }
    ]
})

// Kalkulasi Otomatis Total QTY
const totalKuantitas = computed(() => {
    return form.komposisi.reduce((total, item) => {
        const nilai = parseFloat(item.qty) || 0
        return total + nilai
    }, 0)
})

const handleProsesChange = () => {
    form.komposisi = [{
        id: Date.now(),
        tipe_sumber: 'raw_material',
        item_id: '',
        qty: null
    }]
}

const tambahInput = () => {
    form.komposisi.push({
        id: Date.now(),
        tipe_sumber: 'raw_material',
        item_id: '',
        qty: null
    })
}

const hapusInput = (index) => {
    form.komposisi.splice(index, 1)
}

const resetForm = () => {
    form.jenis_proses = ''
    form.tipe_tangki_tujuan = 'eksisting'
    form.nama_tangki_baru = ''
    form.tanki_tujuan_id = ''
    form.catatan = ''
    form.komposisi = [{ id: Date.now(), tipe_sumber: 'raw_material', item_id: '', qty: null }]
    pesanSukses.value = ''
    if (error.value) error.value = null
}

const simpanProduksi = async () => {
    // Validasi Dasar
    if (form.tipe_tangki_tujuan === 'eksisting' && !form.tanki_tujuan_id) {
        alert("Mohon pilih Tangki Penampungan hasil.")
        return
    }

    if (form.tipe_tangki_tujuan === 'baru' && !form.nama_tangki_baru) {
        alert("Mohon ketikkan nama wadah/tangki baru.")
        return
    }

    // Validasi Komposisi
    const adaInputKosong = form.komposisi.some(k => !k.item_id || k.qty <= 0)
    if (adaInputKosong || totalKuantitas.value <= 0) {
        alert("Mohon lengkapi semua data komposisi (Total Kuantitas harus lebih dari 0).")
        return
    }

    pesanSukses.value = ''

    // Pembangunan Payload ke Backend
    const payload = {
        jenis_proses: form.jenis_proses,
        // Nama hasil otomatis mengambil nama wadah baru
        nama_hasil: form.tipe_tangki_tujuan === 'baru' ? form.nama_tangki_baru : null,
        hasil_qty: totalKuantitas.value,
        tipe_tangki_tujuan: form.tipe_tangki_tujuan,
        nama_tangki_baru: form.tipe_tangki_tujuan === 'baru' ? form.nama_tangki_baru : null,
        tanki_tujuan_id: form.tipe_tangki_tujuan === 'eksisting' ? form.tanki_tujuan_id : null,
        catatan: form.catatan,
        komposisi: form.komposisi.map(k => ({
            tipe_sumber: k.tipe_sumber,
            item_id: k.item_id,
            qty: k.qty
        }))
    }

    const hasil = await simpanPemakaianBahan(payload)

    if (hasil.success) {
        pesanSukses.value = `Berhasil! WIP telah disimpan dan dialokasikan ke tangki tujuan.`
        setTimeout(resetForm, 3000)
    }
}

onMounted(() => {
    muatReferensi()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>