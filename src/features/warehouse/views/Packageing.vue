<template>
    <div class="space-y-6">
        <!-- Card Utama Input Packaging / Hasil Produksi -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                    <h2 class="text-lg font-bold text-slate-800">Transfer Hasil Produksi & Pengemasan</h2>
                    <p class="text-sm text-slate-500">Catat hasil akhir produk jadi atau varian (misal: Super White SC
                        SC) ke gudang.</p>
                </div>
            </div>

            <!-- Header Form -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">No. Batch / Sesi
                        Produksi</label>
                    <input type="text" v-model="formHeader.batch_no" placeholder="Contoh: BATCH-2026-04"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 transition-colors">
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Gudang
                        Tujuan</label>
                    <select v-model="formHeader.gudang_tujuan"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 transition-colors">
                        <option value="" disabled>-- Pilih Gudang --</option>
                        <option value="PT">Gudang PT (Utama)</option>
                        <option value="CV">Gudang CV (Cabang)</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tanggal
                        Catat</label>
                    <input type="date" v-model="formHeader.tanggal"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-900 transition-colors">
                </div>
            </div>

            <!-- Tabel Dinamis Produk -->
            <div class="overflow-x-auto mb-6">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-100 text-xs font-bold uppercase text-slate-400">
                            <th class="pb-3 px-3">Varian / Nama Produk</th>
                            <th class="pb-3 px-3">Jenis Kemasan</th>
                            <th class="pb-3 px-3 w-32">Berat / Unit (Kg)</th>
                            <th class="pb-3 px-3 w-32">Jumlah Koli/Unit</th>
                            <th class="pb-3 px-3 w-36">Total Berat (Kg)</th>
                            <th class="pb-3 px-3 w-16 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50 text-sm">
                        <tr v-for="(item, index) in formItems" :key="index" class="group">
                            <td class="py-3 px-3">
                                <input type="text" v-model="item.nama_produk" placeholder="Misal: Super White SC SC"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-slate-900">
                            </td>
                            <td class="py-3 px-3">
                                <input type="text" v-model="item.packaging" placeholder="Contoh: Karung / Sak"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-slate-900">
                            </td>
                            <td class="py-3 px-3">
                                <input type="number" v-model.number="item.unit_kg" @input="calcWeight(index)" min="0"
                                    step="0.01"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-slate-900">
                            </td>
                            <td class="py-3 px-3">
                                <input type="number" v-model.number="item.total_unit" @input="calcWeight(index)" min="0"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-slate-900">
                            </td>
                            <td class="py-3 px-3">
                                <input type="number" v-model.number="item.berat" readonly
                                    class="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-semibold cursor-not-allowed">
                            </td>
                            <td class="py-3 px-3 text-center">
                                <button @click="removeRow(index)"
                                    class="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center mx-auto"
                                    title="Hapus Baris">
                                    <i class="pi pi-trash text-xs"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Kontrol Tabel & Tombol Simpan -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
                <button @click="addRow"
                    class="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    <i class="pi pi-plus text-xs"></i> Tambah Baris Produk
                </button>

                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <button @click="resetForm"
                        class="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-sm transition-colors">
                        Reset
                    </button>
                    <button @click="saveData" :disabled="isSaving"
                        class="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        <i v-if="isSaving" class="pi pi-spin pi-spinner text-xs"></i>
                        <span>{{ isSaving ? 'Menyimpan...' : 'Simpan Hasil Produksi' }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '@/utils/api'

const isSaving = ref(false)
const formHeader = reactive({
    batch_no: '',
    gudang_tujuan: 'PT',
    tanggal: new Date().toISOString().split('T')[0]
})

const formItems = ref([
    { nama_produk: '', packaging: '', unit_kg: 0, total_unit: 0, berat: 0 }
])

const calcWeight = (index) => {
    const item = formItems.value[index]
    item.berat = (parseFloat(item.unit_kg) * parseFloat(item.total_unit)) || 0
}

const addRow = () => {
    formItems.value.push({ nama_produk: '', packaging: '', unit_kg: 0, total_unit: 0, berat: 0 })
}

const removeRow = (index) => {
    if (formItems.value.length > 1) {
        formItems.value.splice(index, 1)
    } else {
        alert("Minimal harus ada 1 item produk!")
    }
}

const resetForm = () => {
    formHeader.batch_no = ''
    formHeader.gudang_tujuan = 'PT'
    formHeader.tanggal = new Date().toISOString().split('T')[0]
    formItems.value = [{ nama_produk: '', packaging: '', unit_kg: 0, total_unit: 0, berat: 0 }]
}

const saveData = async () => {
    if (!formHeader.batch_no) return alert("Nomor Batch / Sesi Produksi wajib diisi!")

    isSaving.value = true
    try {
        const payload = {
            header: formHeader,
            items: formItems.value
        }
        const response = await api.post('warehouse/packaging-hasil-produksi/', payload)

        if (response.status === 200 || response.status === 201) {
            alert("Transfer Hasil Produksi Berhasil Disimpan!")
            resetForm()
        }
    } catch (error) {
        console.error("Gagal menyimpan packaging:", error)
        alert("Gagal menyimpan data ke server.")
    } finally {
        isSaving.value = false
    }
}
</script>