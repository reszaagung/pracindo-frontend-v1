<template>
    <div class="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <header class="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <p class="text-sm font-bold tracking-widest text-blue-600 uppercase mb-1">Master Data</p>
                <h1 class="text-2xl md:text-3xl font-bold text-slate-800 m-0">Data Kemasan</h1>
                <p class="text-sm text-slate-500 mt-1">Kelola jenis kemasan, kapasitas, dan pantau stok fisik di gudang.
                </p>
            </div>

            <!-- Tombol aksi (Persiapan jika nanti butuh fitur tambah) -->
            <button
                class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                <i class="pi pi-plus text-xs"></i> Tambah Kemasan
            </button>
        </header>

        <!-- Indikator Loading -->
        <div v-if="isLoading" class="p-8 text-center text-slate-500">
            <i class="pi pi-spin pi-spinner text-2xl mb-2"></i>
            <p>Memuat data kemasan...</p>
        </div>

        <!-- Pesan Error -->
        <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">
            {{ error }}
        </div>

        <!-- Tabel Data -->
        <div v-else class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-600">
                    <thead
                        class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
                        <tr>
                            <th class="px-6 py-4">Kode SKU</th>
                            <th class="px-6 py-4">Nama Kemasan</th>
                            <th class="px-6 py-4">Kategori</th>
                            <th class="px-6 py-4 text-right">Kapasitas Muat</th>
                            <th class="px-6 py-4 text-right">Stok Gudang</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="item in kemasan" :key="item.id" class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-3 font-mono font-medium text-slate-800">{{ item.kode_sku }}</td>
                            <td class="px-6 py-3 font-medium text-slate-800">{{ item.nama_kemasan }}</td>
                            <td class="px-6 py-3">
                                <span
                                    class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                                    {{ item.kategori_nama }}
                                </span>
                            </td>
                            <td class="px-6 py-3 text-right font-medium">{{ item.tampil_kapasitas }}</td>
                            <td class="px-6 py-3 text-right">
                                <span
                                    :class="item.kuantitas_stok > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'">
                                    {{ item.kuantitas_stok }} pcs
                                </span>
                            </td>
                        </tr>
                        <tr v-if="kemasan.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-slate-500">

                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useKemasan } from '@/master/composables/useKemasan'

const { kemasan, isLoading, error, fetchKemasan } = useKemasan()

onMounted(() => {
    fetchKemasan()
})
</script>