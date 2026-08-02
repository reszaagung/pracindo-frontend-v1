<!-- src/features/accounting/views/AccountingLanding.vue -->
<template>
    <div class="min-h-screen bg-slate-50 flex flex-col">

        <!-- BAGIAN 1: HEADER PORTAL AKUNTING -->
        <header class="bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 class="text-xl font-bold text-slate-800">Portal Akunting</h1>
                    <p class="text-sm text-slate-500">Pusat kontrol keuangan, dokumen, dan tugas</p>
                </div>
                <!-- Tombol Kembali ke Dashboard Utama ERP -->
                <button @click="$router.push('/')" class="text-sm text-sky-600 font-semibold hover:text-sky-700">
                    &larr; Menu Utama
                </button>
            </div>
        </header>

        <main class="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-8">

            <!-- BAGIAN 2: GRID KARTU NAVIGASI (Sesuai Blueprint Anda) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <!-- Kartu 1: TransactionEntryLayout (Input Transaksi / PO) -->
                <router-link to="/accounting/transaksi/po"
                    class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-400 transition-all flex flex-col items-center justify-center text-center gap-3 group">
                    <div
                        class="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        <i class="pi pi-file-edit text-xl"></i>
                    </div>
                    <span class="font-bold text-slate-700">Input Transaksi (PO)</span>
                </router-link>

                <!-- Kartu 2: InvoiceLayout (Manajemen Invoice) -->
                <router-link to="/accounting/invoice"
                    class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center gap-3 group">
                    <div
                        class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <i class="pi pi-receipt text-xl"></i>
                    </div>
                    <span class="font-bold text-slate-700">Manajemen Invoice</span>
                </router-link>

                <!-- Kartu 3: Fitur Mendatang -->
                <div
                    class="bg-slate-100 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-3 opacity-60 cursor-not-allowed">
                    <div class="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center">
                        <i class="pi pi-lock text-xl"></i>
                    </div>
                    <span class="font-semibold text-slate-500">Mungkin nanti akan ditambahkan</span>
                </div>

                <!-- Kartu 4: Fitur Mendatang -->
                <div
                    class="bg-slate-100 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-3 opacity-60 cursor-not-allowed">
                    <div class="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center">
                        <i class="pi pi-lock text-xl"></i>
                    </div>
                    <span class="font-semibold text-slate-500">Mungkin nanti akan ditambahkan</span>
                </div>

            </div>

            <!-- BAGIAN 3: WORK ORDER PANEL (Bagian Bawah Blueprint) -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <WorkOrderPanel />
            </div>

        </main>
    </div>
</template>

<script setup>
import WorkOrderPanel from '@/features/work-order/views/WorkOrderPanel.vue'
</script>