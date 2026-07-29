<!--
  src/features/accounting/views/Expend.vue
  ==========================================
  Antarmuka untuk mencatat pengeluaran operasional (OpEx) 
  dan pembelian aset (CapEx). Ditulis ulang dengan Tailwind CSS.
-->
<script setup>
import { reactive, onMounted } from 'vue'
import { useExpend } from '@/features/accounting/composables/useExpend'

const { isLoading, error, successMsg, rekamPengeluaran, riwayatPengeluaran, fetchPengeluaran } = useExpend()

const hariIni = () => {
    const t = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    return t.toISOString().slice(0, 10)
}

const form = reactive({
    tipe: 'OPEX',
    tanggal: hariIni(),
    kategori: '',
    nominal: null,
    keterangan: ''
})

const resetForm = () => {
    form.tipe = 'OPEX'
    form.tanggal = hariIni()
    form.kategori = ''
    form.nominal = null
    form.keterangan = ''
    error.value = null
    successMsg.value = ''
}

const simpanPengeluaran = async () => {
    const hasil = await rekamPengeluaran({
        tipe: form.tipe,
        tanggal: form.tanggal,
        kategori: form.kategori,
        nominal: form.nominal,
        keterangan: form.keterangan
    })

    if (hasil.success) {
        setTimeout(() => {
            if (successMsg.value) resetForm()
        }, 2000)
    }
}

onMounted(() => {
    fetchPengeluaran()
})
</script>

<template>
    <div class="space-y-6 animate-fade-in text-slate-700 w-full overflow-hidden pb-10">

        <!-- HEADER -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p class="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Modul Keuangan
                </p>
                <h2 class="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Catat Pengeluaran</h2>
                <p class="text-slate-500 text-xs md:text-sm mt-1">Catat biaya operasional harian (OpEx) atau pembelian
                    aset jangka panjang (CapEx).</p>
            </div>
        </div>

        <!-- FORM PANEL -->
        <form @submit.prevent="simpanPengeluaran"
            class="bg-white border border-slate-200 rounded-[24px] p-5 md:p-8 shadow-sm space-y-6 md:space-y-8">

            <!-- Baris 1: Jenis Pengeluaran -->
            <div class="space-y-3">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Pengeluaran (Expenditure
                    Type)</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="cursor-pointer relative group">
                        <input type="radio" v-model="form.tipe" value="OPEX" class="peer sr-only" />
                        <div
                            class="p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 group-hover:bg-slate-100 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-sm">
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-bold text-slate-800 peer-checked:text-blue-700">Operating Expense
                                    (OpEx)</span>
                                <i
                                    class="pi pi-check-circle text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity text-lg"></i>
                            </div>
                            <span class="text-xs text-slate-500 peer-checked:text-blue-600/80">Biaya rutin harian (Gaji,
                                Listrik, Sewa, dll)</span>
                        </div>
                    </label>

                    <label class="cursor-pointer relative group">
                        <input type="radio" v-model="form.tipe" value="CAPEX" class="peer sr-only" />
                        <div
                            class="p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 group-hover:bg-slate-100 transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:shadow-sm">
                            <div class="flex items-center justify-between mb-1">
                                <span class="font-bold text-slate-800 peer-checked:text-emerald-700">Capital Expenditure
                                    (CapEx)</span>
                                <i
                                    class="pi pi-check-circle text-emerald-600 opacity-0 peer-checked:opacity-100 transition-opacity text-lg"></i>
                            </div>
                            <span class="text-xs text-slate-500 peer-checked:text-emerald-600/80">Pembelian aset tetap
                                (Gedung, Mesin, Kendaraan)</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Baris 2: Tanggal & Kategori -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Transaksi</label>
                    <input v-model="form.tanggal" type="date" required
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori / Akun</label>
                    <select v-model="form.kategori" required
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors">
                        <option value="" disabled>Pilih kategori...</option>
                        <optgroup v-if="form.tipe === 'OPEX'" label="Beban Operasional">
                            <option value="GAJI">Beban Gaji & Upah</option>
                            <option value="SEWA">Beban Sewa</option>
                            <option value="LISTRIK_AIR">Beban Listrik, Air & Internet</option>
                            <option value="LAINNYA">Beban Operasional Lainnya</option>
                        </optgroup>
                        <optgroup v-if="form.tipe === 'CAPEX'" label="Aset Jangka Panjang">
                            <option value="MESIN">Pembelian Mesin & Peralatan</option>
                            <option value="KENDARAAN">Pembelian Kendaraan</option>
                            <option value="BANGUNAN">Renovasi / Bangunan</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            <!-- Baris 3: Nominal -->
            <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal (Rp)</label>
                <div class="relative w-full">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input v-model.number="form.nominal" type="number" min="0" step="1" required placeholder="0"
                        class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors" />
                </div>
            </div>

            <!-- Baris 4: Keterangan -->
            <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan / Tujuan</label>
                <textarea v-model="form.keterangan" rows="3" required
                    placeholder="Misal: Pembayaran listrik pabrik bulan Juli, Pembelian inverter mesin A..."
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors resize-none"></textarea>
            </div>

            <!-- Pesan Balikan -->
            <div v-if="successMsg"
                class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                <i class="pi pi-check-circle"></i> {{ successMsg }}
            </div>
            <div v-if="error"
                class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                <i class="pi pi-exclamation-circle"></i> {{ error }}
            </div>

            <!-- Tombol Aksi -->
            <div class="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" @click="resetForm"
                    class="w-full md:w-auto px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    Bersihkan
                </button>
                <button type="submit" :disabled="isLoading"
                    class="w-full md:w-auto px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md disabled:opacity-60 transition-all flex justify-center items-center gap-2">
                    <i v-if="isLoading" class="pi pi-spin pi-spinner"></i>
                    {{ isLoading ? 'Menyimpan...' : 'Rekam Pengeluaran' }}
                </button>
            </div>
        </form>

        <!-- TABEL RIWAYAT PENGELUARAN -->
        <div class="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden mt-8">
            <div class="px-5 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                    <i class="pi pi-history"></i>
                </div>
                <div>
                    <h3 class="text-base font-bold text-slate-800">Riwayat Pengeluaran Terakhir</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Daftar transaksi yang baru saja dicatat</p>
                </div>
            </div>

            <div class="w-full overflow-x-auto custom-scrollbar">
                <table class="w-full text-left text-sm border-collapse">
                    <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th class="py-4 px-6 font-bold text-xs uppercase tracking-wider">Tanggal</th>
                            <th class="py-4 px-4 font-bold text-xs uppercase tracking-wider">Kategori</th>
                            <th class="py-4 px-4 font-bold text-xs uppercase tracking-wider">Keterangan</th>
                            <th class="py-4 px-6 font-bold text-xs uppercase tracking-wider text-right">Nominal</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                        <tr v-for="item in riwayatPengeluaran" :key="item.id"
                            class="hover:bg-slate-50/60 transition-colors group">
                            <td class="py-4 px-6 text-slate-800 font-medium whitespace-nowrap">
                                {{ item.tanggal }}
                            </td>
                            <td class="py-4 px-4">
                                <span
                                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide border bg-slate-50 text-slate-600 border-slate-200">
                                    {{ item.kategori_display || item.kategori }}
                                </span>
                            </td>
                            <td class="py-4 px-4 text-slate-600 min-w-[200px] leading-relaxed">
                                {{ item.keterangan }}
                            </td>
                            <td class="py-4 px-6 text-right font-black text-slate-800 whitespace-nowrap">
                                Rp {{ Number(item.nominal).toLocaleString('id-ID') }}
                            </td>
                        </tr>
                        <tr v-if="!riwayatPengeluaran || riwayatPengeluaran.length === 0">
                            <td colspan="4" class="py-12 px-6 text-center">
                                <div class="flex flex-col items-center justify-center">
                                    <i class="pi pi-inbox text-4xl text-slate-300 mb-3"></i>
                                    <p class="text-sm font-medium text-slate-500">Belum ada riwayat pengeluaran yang
                                        dicatat.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.custom-scrollbar::-webkit-scrollbar {
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>