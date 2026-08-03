<!--
  views/DashboardView.vue
  =======================
  Layar pertama setelah login. SENGAJA TANPA SIDEBAR — dashboard adalah
  halaman pemilihan modul; sidebar baru muncul setelah masuk ke modul
  (lihat layouts/ModulLayout.vue).
-->
<template>
    <div class="dash">
        <header class="dash__kepala">
            <div>
                <div class="merek">
                    <span class="merek__kotak">PC</span>
                    <span class="merek__teks">Pracindo · Sistem Internal</span>
                </div>
                <!-- Menggunakan sapaan computed yang aman -->
                <h1 class="sapa">{{ sapaan }}, {{ namaDepan }}</h1>
                <p class="sub">Pilih modul untuk mulai bekerja.</p>
            </div>

            <div class="orang">
                <p class="orang__nama">{{ kartu?.nama ?? 'Pengguna' }}</p>
                <p class="orang__peran">
                    {{ kartu?.role_display ?? 'Staf' }} · {{ kartu?.entitas_default_kode ?? 'Semua entitas' }}
                </p>
                <button class="orang__keluar" @click="keluar">Keluar</button>
            </div>
        </header>

        <section class="blok">
            <h2 class="stensil">Modul</h2>
            <div class="kartu">
                <ModuleCard v-for="m in modulSaya" :key="m.id" :modul="m" :hitung="hitungan[m.id] || 0" />
            </div>

            <p v-if="modulSaya.length < MODUL_KATALOG.length" class="blok__kaki">
                Modul yang tidak muncul di sini di luar tanggung jawab
                {{ (kartu?.role_display ?? 'staf').toLowerCase() }}.
            </p>
        </section>

        <!-- BAGIAN WORK ORDER (Disesuaikan agar tidak menyebabkan error jika belum ada backend-nya) -->
        <section class="blok">
            <div class="blok__kepala">
                <h2 class="stensil">Papan tugas</h2>
            </div>

            <div v-if="isLoading" class="p-4 text-sm text-slate-500">Membaca papan tugas...</div>

            <template v-else-if="mading.length > 0">
                <p v-if="terlambat.length" class="telat-info">
                    {{ terlambat.length }} lewat tenggat
                </p>
                <TransitionGroup name="kartu" tag="div" class="wo-list">
                    <!-- Pastikan komponen WorkOrderCard tersedia, jika belum komentar baris ini -->
                    <!-- <WorkOrderCard v-for="wo in mading" :key="wo.id" :wo="wo" :staff-id="staffId" :sibuk="sedangApprove === wo.id" @approve="approveWO" /> -->
                </TransitionGroup>
            </template>

            <div v-else class="kotak-kosong p-8 text-center text-slate-500 border border-slate-200 rounded-xl mt-4">
                Papan kosong. Semua tugas yang ditujukan ke kamu sudah dikerjakan.
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { useWorkOrder } from '@/features/work-order/composables/useWorkOrder'
import { MODUL as MODUL_KATALOG } from '@/config/modules'
import ModuleCard from '@/components/ModuleCard.vue'

const router = useRouter()
const { kartu, logout } = useAuth()

const modulSaya = computed(() => modulDariBackend(modul.value))


const namaDepan = computed(() => {
    const nama = kartu.value?.nama || ''
    return nama.split(' ')[0] || 'Pengguna'
})
const { hitungan, mading, terlambat, isLoading } = useWorkOrder()

const sekarang = ref(new Date())
let timer = null

onMounted(() => {
    timer = setInterval(() => (sekarang.value = new Date()), 60_000)
})

onUnmounted(() => clearInterval(timer))

const sapaan = computed(() => {
    const h = sekarang.value.getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
})

const keluar = async () => {
    await logout()
    router.push('/login')
}
</script>
<style scoped>
/* SEMUA CSS ASLI ANDA DIPERTAHANKAN 100% */
.dash {
    max-width: 1180px;
    margin: 0 auto;
    padding: 2.5rem clamp(1rem, 4vw, 2.5rem) 4rem;
}

.dash__kepala {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid var(--garis);
}

.merek {
    display: flex;
    align-items: center;
    gap: .7rem;
    margin-bottom: 1.1rem;
}

.merek__kotak {
    width: 34px;
    height: 34px;
    background: var(--teks);
    color: var(--panel);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: .75rem;
    border-radius: var(--lengkung-kecil);
}

.merek__teks {
    font-size: .75rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--redup-2);
}

.sapa {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2rem);
    font-weight: 700;
    letter-spacing: -.025em;
}

.sub {
    margin: .35rem 0 0;
    font-size: .9375rem;
    color: var(--redup);
}

.orang {
    text-align: right;
}

.orang__nama {
    margin: 0;
    font-size: .875rem;
    font-weight: 600;
}

.orang__peran {
    margin: .15rem 0 0;
    font-size: .75rem;
    color: var(--redup-2);
}

.orang__keluar {
    margin-top: .65rem;
    font-family: inherit;
    font-size: .75rem;
    color: var(--redup);
    background: none;
    border: 1px solid var(--garis);
    padding: .38rem .75rem;
    border-radius: var(--lengkung-kecil);
    cursor: pointer;
}

.orang__keluar:hover {
    border-color: var(--garis-tegas);
    color: var(--teks);
}

.blok {
    margin-top: 2rem;
}

.blok__kepala {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.blok .stensil {
    margin-bottom: 1rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--redup-2);
}

.blok__kepala .stensil {
    margin-bottom: 0;
}

.blok__kepala+* {
    margin-top: 1rem;
}

.tautan {
    font-size: .75rem;
    color: var(--redup);
    text-decoration: none;
    border-bottom: 1px solid transparent;
}

.tautan:hover {
    color: var(--teks);
    border-bottom-color: var(--garis-tegas);
}

.kartu {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
    gap: 1rem;
}

.blok__kaki {
    margin: 1rem 0 0;
    font-size: .8125rem;
    color: var(--redup-2);
}

.telat-info {
    margin: 0 0 .75rem;
    font-size: .8125rem;
    color: var(--merah);
    font-weight: 500;
}

.wo-list {
    display: flex;
    flex-direction: column;
    gap: .75rem;
}

.kotak-kosong {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
}

.kartu-enter-active,
.kartu-leave-active {
    transition: all .3s ease;
}

.kartu-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.kartu-leave-to {
    opacity: 0;
    transform: translateX(16px);
}

.kartu-move {
    transition: transform .3s ease;
}
</style>