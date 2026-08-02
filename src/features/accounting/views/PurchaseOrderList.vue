<template>
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <!-- HEADER -->
        <header class="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div>
                <p class="text-xs text-gray-500 mb-1">
                    <router-link to="/accounting" class="hover:text-gray-900 hover:underline">Portal
                        Akunting</router-link> &rsaquo; Pembelian
                </p>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Purchase Order</h1>
            </div>

            <!-- Rute ini diarahkan ke form pembuatan PO -->
            <router-link to="/accounting/transaksi/po/buat"
                class="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                <i class="pi pi-plus text-xs"></i> Buat PO Baru
            </router-link>
        </header>

        <!-- METRIK (Meniru StatCard) -->
        <section
            class="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-gray-200 border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div class="bg-white p-5">
                <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">PO Bulan Ini</p>
                <p class="text-3xl font-bold text-gray-900">{{ formatNilaiBesar(totalBulanIni) }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ daftarPO.length }} dokumen dibuat</p>
            </div>
            <div class="bg-white p-5">
                <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Belum Diterima Penuh</p>
                <p class="text-3xl font-bold text-gray-900">{{ belumDiterima.length }}</p>
                <p class="text-xs text-gray-500 mt-2">Menunggu barang datang</p>
            </div>
            <div class="bg-white p-5">
                <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Draft</p>
                <p class="text-3xl font-bold" :class="draftCount > 0 ? 'text-amber-600' : 'text-gray-900'">{{
                    draftCount }}</p>
                <p class="text-xs mt-2 font-medium text-gray-500">Belum dikirim ke suplier</p>
            </div>
        </section>

        <!-- PANEL DAFTAR PO -->
        <section class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div class="flex justify-between items-center flex-wrap gap-4 p-5 border-b border-gray-200 bg-gray-50">
                <div>
                    <h2 class="text-sm font-bold text-gray-900">Daftar PO</h2>
                    <p class="text-xs text-gray-500 mt-0.5">Terbaru di atas</p>
                </div>

                <div class="flex items-center gap-3 flex-wrap">
                    <div class="relative">
                        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input v-model="cari" type="search"
                            class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-48 lg:w-64 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            placeholder="Cari nomor/supplier" />
                    </div>

                    <div class="flex bg-gray-100 p-1 rounded-lg">
                        <button v-for="t in saringan" :key="t.id" @click="saringStatus = t.id"
                            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
                            :class="saringStatus === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
                            {{ t.label }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="isLoadingDaftar" class="p-8 text-center text-gray-500 text-sm">
                <i class="pi pi-spin pi-spinner mr-2"></i> Membaca purchase order...
            </div>

            <div v-else-if="tampil.length" class="flex flex-col">
                <router-link v-for="po in tampil" :key="po.id" :to="`/accounting/po/${po.id}`"
                    class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-center p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0">

                    <div>
                        <p class="text-sm font-bold text-gray-900 mb-1">{{ po.no_po }}</p>
                        <p class="text-xs text-gray-500">
                            {{ po.suplier_nama || 'Suplier' }} &bull; {{ po.entitas_kode || 'Entitas' }}
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-2 md:col-span-full lg:col-span-1">
                        <span class="px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase"
                            :class="kelasStatus(po.status)">
                            {{ labelStatus(po.status) }}
                        </span>
                    </div>

                    <div class="text-right">
                        <p class="text-sm font-bold text-gray-900">{{ formatRupiah(po.total_nilai) }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ tanggalPendek(po.tanggal) }}</p>
                    </div>
                </router-link>
            </div>

            <div v-else class="p-12 text-center">
                <div
                    class="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="pi pi-inbox text-xl"></i>
                </div>
                <h3 class="text-sm font-bold text-gray-900">Tidak ada PO yang cocok</h3>
                <p class="text-xs text-gray-500 mt-1">Ubah kata kunci pencarian atau tab status.</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePurchaseOrder } from '@/features/accounting/composables/usePurchaseOrder'

const {
    daftarPO, tampil, isLoadingDaftar, cari, saringStatus,
    belumDiterima, draftCount, totalBulanIni, muatDaftarPO
} = usePurchaseOrder()

onMounted(muatDaftarPO)

// Status backend: DRAFT, TERKIRIM, SEBAGIAN, SELESAI, BATAL.
const saringan = [
    { id: 'semua', label: 'Semua' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'TERKIRIM', label: 'Terkirim' },
    { id: 'SEBAGIAN', label: 'Sebagian' },
    { id: 'SELESAI', label: 'Selesai' },
    { id: 'BATAL', label: 'Batal' },
]

const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`

const formatNilaiBesar = (n) => {
    const a = Number(n || 0)
    if (Math.abs(a) >= 1e9) return `Rp ${(a / 1e9).toFixed(2)} M`
    if (Math.abs(a) >= 1e6) return `Rp ${(a / 1e6).toFixed(1)} jt`
    return formatRupiah(a)
}

const tanggalPendek = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const labelStatus = (s) => ({
    DRAFT: 'Draft',
    TERKIRIM: 'Terkirim',
    SEBAGIAN: 'Diterima sebagian',
    SELESAI: 'Selesai',
    BATAL: 'Dibatalkan',
}[s] ?? (s || 'Status?'))

const kelasStatus = (s) => ({
    DRAFT: 'bg-gray-100 text-gray-600',
    TERKIRIM: 'bg-blue-100 text-blue-700',
    SEBAGIAN: 'bg-amber-100 text-amber-700',
    SELESAI: 'bg-emerald-100 text-emerald-700',
    BATAL: 'bg-rose-100 text-rose-700',
}[s] ?? 'bg-gray-100 text-gray-500')
</script>