<template>
    <div class="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Buat Purchase Order</h1>
                <p class="text-sm text-gray-500 mt-1">Buat dokumen pemesanan pembelian baru ke pemasok.</p>
            </div>
            <button @click="$router.back()" class="text-gray-500 hover:text-gray-700 font-medium text-sm">
                &larr; Kembali
            </button>
        </div>

        <div v-if="pesanError"
            class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm whitespace-pre-line"
            role="alert">
            {{ pesanError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- HEADER (Data Utama PO) -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Entitas Pemesan</label>
                    <select v-model="form.entitas_id" required
                        class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm">
                        <option value="" disabled>Pilih Entitas...</option>
                        <option v-for="entitas in listEntitas" :key="entitas.id" :value="entitas.id">
                            {{ entitas.kode }} - {{ entitas.nama }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select v-model="form.supplier_id" required
                        class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm">
                        <option value="" disabled>Pilih Supplier...</option>
                        <option v-for="supplier in listSupplier" :key="supplier.id" :value="supplier.id">
                            {{ supplier.nama }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal PO</label>
                    <input type="date" v-model="form.tanggal" required
                        class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Rencana Kedatangan</label>
                    <input type="date" v-model="form.tanggal_kedatangan" required
                        class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm" />
                </div>
            </div>

            <!-- LINE ITEMS (Detail Barang) -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-sm font-semibold text-gray-800 uppercase tracking-wider">Rincian Barang</h3>
                    <button type="button" @click="tambahItem"
                        class="text-teal-600 hover:text-teal-800 text-sm font-medium">
                        + Tambah Baris
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-white">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 w-32">Kuantitas</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 w-48">Harga Satuan</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 w-48">Subtotal</th>
                                <th class="px-6 py-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <tr v-for="(item, index) in form.items" :key="index" class="hover:bg-gray-50">
                                <td class="px-6 py-2">
                                    <select v-model="item.produk_id" required
                                        class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500">
                                        <option value="" disabled>Pilih...</option>
                                        <option v-for="produk in listProduk" :key="produk.id" :value="produk.id">
                                            [{{ produk.kode }}] {{ produk.nama }}
                                        </option>
                                    </select>
                                </td>
                                <td class="px-6 py-2">
                                    <input type="number" v-model.number="item.qty" min="0.01" step="0.01" required
                                        class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500" />
                                </td>
                                <td class="px-6 py-2">
                                    <div class="relative">
                                        <div
                                            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span class="text-gray-500 sm:text-sm">Rp</span>
                                        </div>
                                        <input type="number" v-model.number="item.harga_satuan" min="0" required
                                            class="w-full pl-9 border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500" />
                                    </div>
                                </td>
                                <td class="px-6 py-2 text-right">
                                    <span class="text-sm font-medium text-gray-900">
                                        {{ formatRupiah(hitungSubtotal(item)) }}
                                    </span>
                                </td>
                                <td class="px-6 py-2 text-center">
                                    <button type="button" @click="hapusItem(index)"
                                        class="text-red-400 hover:text-red-600 transition-colors">
                                        <i class="pi pi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="form.items.length === 0" class="text-center py-6 text-gray-400 text-sm italic">
                        Belum ada rincian barang.
                    </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                    <div class="text-right">
                        <span class="text-sm font-medium text-gray-500 mr-4">Total Estimasi</span>
                        <span class="text-xl font-bold text-teal-700">Rp {{ formatRupiah(totalPO) }}</span>
                    </div>
                </div>
            </div>

            <!-- FOOTER (Catatan & Aksi) -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea v-model="form.catatan" rows="2"
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"></textarea>

                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" @click="resetForm"
                        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Batal
                    </button>
                    <button type="submit" :disabled="sedangProses"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-70 flex items-center gap-2">
                        <i v-if="sedangProses" class="pi pi-spin pi-spinner"></i>
                        {{ sedangProses ? 'Menyimpan...' : 'Simpan Purchase Order' }}
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePurchaseOrder } from '@/composables/usePurchaseOrder'

const router = useRouter()

const {
    listEntitas, listSupplier, listProduk,
    sedangProses, pesanError,
    muatDataMaster, simpanPO
} = usePurchaseOrder()

// State Form
const form = ref({
    entitas_id: '',
    supplier_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    tanggal_kedatangan: '',
    catatan: '',
    items: []
})

// Methods Line Item
const buatItemKosong = () => ({ produk_id: '', qty: 0, harga_satuan: 0 })
const tambahItem = () => form.value.items.push(buatItemKosong())
const hapusItem = (index) => form.value.items.splice(index, 1)

// Perhitungan & Formatting
const hitungSubtotal = (item) => (item.qty || 0) * (item.harga_satuan || 0)
const totalPO = computed(() => form.value.items.reduce((acc, item) => acc + hitungSubtotal(item), 0))
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka)

// Actions
const resetForm = () => {
    form.value = {
        entitas_id: '',
        supplier_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        tanggal_kedatangan: '',
        catatan: '',
        items: [buatItemKosong()]
    }
    pesanError.value = ''
}

const handleSubmit = async () => {
    if (form.value.items.length === 0) {
        pesanError.value = "Purchase Order harus memiliki minimal 1 baris barang."
        return
    }

    const hasil = await simpanPO(form.value)
    if (hasil.success) {
        alert('PO berhasil dibuat!')
        // Arahkan kembali ke daftar PO atau bersihkan form
        router.push('/accounting/document')
    }
}

// Inisialisasi
onMounted(async () => {
    resetForm()
    await muatDataMaster()
})
</script>