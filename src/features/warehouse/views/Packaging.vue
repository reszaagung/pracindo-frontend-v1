<template>
    <div class="max-w-4xl mx-auto pb-12 animate-fade-in">
        <!-- Header -->
        <header class="mb-8">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-800 m-0">Packaging Barang Jadi</h1>
            <p class="text-sm text-slate-500 mt-1">
                Kemas cairan adonan dari hasil RnD ke dalam unit kemasan.
            </p>
        </header>

        <!-- Pesan Alert -->
        <div v-if="feedback" class="mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3"
            :class="feedback.tipe === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'">
            <i class="pi" :class="feedback.tipe === 'ok' ? 'pi-check-circle' : 'pi-exclamation-triangle'"></i>
            {{ feedback.teks }}
        </div>

        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-8">
            <form @submit.prevent="catatPackaging" class="flex flex-col gap-8">

                <!-- BAGIAN 1: SUMBER ADONAN -->
                <section>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                        <h2 class="text-base font-bold text-slate-800 uppercase tracking-wide">1. Sumber Cairan / Adonan
                        </h2>
                    </div>

                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase">Pilih Hasil RnD (WIP)</label>
                            <select v-model="form.wip_id" required
                                class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none">
                                <option value="" disabled>-- Pilih Adonan --</option>
                                <option v-for="w in wipList" :key="w.id" :value="w.id">
                                    [{{ w.jenis_proses }}] {{ w.nama_hasil }} (Sisa: {{ w.hasil_qty }} KG)
                                </option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase">Cairan Dipakai (KG)</label>
                            <input v-model.number="form.cairan_dipakai" type="number" min="0.01" step="0.01" required
                                placeholder="Contoh: 25.5"
                                class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none" />
                        </div>
                    </div>
                </section>

                <hr class="border-slate-100" />

                <!-- BAGIAN 2: HASIL KEMASAN -->
                <section>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-1.5 h-5 bg-amber-500 rounded-full"></div>
                        <h2 class="text-base font-bold text-slate-800 uppercase tracking-wide">2. Spesifikasi Kemasan
                        </h2>
                    </div>

                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">

                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase">Pemilik Barang Jadi</label>
                            <select v-model="form.pemilik_id" required
                                class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none">
                                <option value="" disabled>-- Pilih Entitas/Pemilik --</option>
                                <option v-for="a in akunList" :key="a.id" :value="a.id">{{ a.kode }} - {{ a.nama }}
                                </option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase">Produk Kemasan</label>
                            <select v-model="form.produk_id" required
                                class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none">
                                <option value="" disabled>-- Pilih Produk --</option>
                                <option v-for="p in produkList" :key="p.id" :value="p.id">
                                    {{ p.nama }} <template v-if="p.kemasan && p.kemasan !== '-'">[{{ p.kemasan
                                        }}]</template>
                                </option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase">Jumlah Kemasan (Unit)</label>
                            <input v-model.number="form.qty_unit" type="number" min="1" step="1" required
                                placeholder="0"
                                class="w-full bg-white border border-slate-200 text-slate-800 font-bold text-lg rounded-xl p-3 outline-none" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-semibold text-slate-700 uppercase">No Batch FG (Opsional)</label>
                            <input v-model="form.no_batch_fg" type="text" placeholder="Auto-generate jika kosong"
                                class="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-3 outline-none" />
                        </div>
                    </div>
                </section>

                <!-- Aksi -->
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" @click="resetForm"
                        class="px-6 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
                        Reset
                    </button>
                    <button type="submit" :disabled="isSaving || isLoading"
                        class="px-8 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2">
                        <i :class="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i>
                        {{ isSaving ? 'Menyimpan...' : 'Simpan Packaging' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePackaging } from '@/features/warehouse/composables/usePackaging'

const {
    isLoading, isSaving, feedback, error, form,
    wipList, produkList, akunList,
    muatDataAwal, resetForm, catatPackaging
} = usePackaging()

onMounted(() => {
    muatDataAwal()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
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
</style>