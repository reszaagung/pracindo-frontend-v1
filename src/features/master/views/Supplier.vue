<!-- src/features/master/views/Supplier.vue -->
<template>
    <div class="p-6 max-w-7xl mx-auto w-full">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Master Suplier</h1>
                <p class="text-slate-500 text-sm mt-1">Kelola data pemasok dan vendor perusahaan</p>
            </div>

            <div class="flex gap-3 w-full md:w-auto">
                <span class="p-input-icon-left w-full md:w-auto">
                    <i class="pi pi-search" />
                    <InputText v-model="kataKunci" placeholder="Cari nama / kode..." @keyup.enter="cariData"
                        class="w-full md:w-64 rounded-lg!" />
                </span>

                <!-- Tombol aksi utama: Biru Muda. Hanya muncul untuk role tertentu -->
                <Button v-if="bisaEdit" label="Tambah Suplier" icon="pi pi-plus"
                    class="bg-sky-500! hover:bg-sky-600! border-none! text-white! rounded-lg! whitespace-nowrap" />
            </div>
        </div>

        <div v-if="pesanError" class="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            {{ pesanError }}
        </div>

        <!-- Tampilan Desktop (Tabel) -->
        <div class="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <DataTable :value="daftarSuplier" :loading="sedangProses" responsiveLayout="scroll" class="p-datatable-sm">
                <Column field="kode" header="Kode" class="font-medium text-slate-700"></Column>
                <Column field="nama" header="Nama Perusahaan"></Column>
                <Column field="kontak_nama" header="Kontak"></Column>
                <Column field="termin_hari_default" header="Termin (Hari)"></Column>
                <Column header="Status">
                    <template #body="{ data }">
                        <span :class="data.aktif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
                            class="px-2.5 py-1 rounded-full text-xs font-semibold">
                            {{ data.aktif ? 'Aktif' : 'Nonaktif' }}
                        </span>
                    </template>
                </Column>
                <Column v-if="bisaEdit" header="Aksi" :exportable="false" style="min-width:8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil"
                            class="p-button-rounded p-button-text text-sky-500! hover:bg-sky-50!" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Tampilan Mobile (Card) -->
        <div class="md:hidden flex flex-col gap-4">
            <div v-for="item in daftarSuplier" :key="item.id"
                class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold text-sky-600 mb-1 block">{{ item.kode }}</span>
                        <h3 class="font-bold text-slate-800">{{ item.nama }}</h3>
                    </div>
                    <Button v-if="bisaEdit" icon="pi pi-pencil"
                        class="p-button-rounded p-button-text text-sky-500! h-8! w-8!" />
                </div>
                <div class="text-sm text-slate-600 space-y-1 mt-3">
                    <p><i class="pi pi-user text-xs mr-2"></i>{{ item.kontak_nama || '-' }}</p>
                    <p><i class="pi pi-clock text-xs mr-2"></i>Termin: {{ item.termin_hari_default }} Hari</p>
                </div>
            </div>
            <div v-if="!sedangProses && daftarSuplier.length === 0" class="text-center p-8 text-slate-400">
                Data tidak ditemukan
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// Pastikan useSupplier.js juga dipindah ke direktori master/composables/
import { useSupplier } from '../composables/useSupplier'
import { useAuth } from '@/composables/useAuth'

const { profil } = useAuth()
const { daftarSuplier, sedangProses, pesanError, ambilSuplier } = useSupplier()

const kataKunci = ref('')

// Validasi role sesuai instruksi backend
const bisaEdit = computed(() => {
    return profil.value?.role === 'ADMIN' || profil.value?.role === 'SUPERVISOR'
})

const cariData = () => {
    ambilSuplier({ search: kataKunci.value })
}

onMounted(() => {
    ambilSuplier()
})
</script>