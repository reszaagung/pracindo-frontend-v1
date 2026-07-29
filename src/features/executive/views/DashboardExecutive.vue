<!--
  src/features/executive/views/DashboardExecutive.vue
  ===================================================
  Dashboard untuk level Eksekutif (Manajer/Direktur) Pabrik Pewarna.
  Fokus pada helikopter view: Arus Kas, Produksi, dan Aktivitas Lintas Departemen.
-->
<template>
    <div>
        <header class="kepala">
            <div>
                <p class="remah">
                    <router-link to="/">Dashboard</router-link> › Eksekutif
                </p>
                <h1 class="judul">Tinjauan Eksekutif</h1>
                <p class="sub">Metrik keuangan, produksi, dan logistik industri pewarna.</p>
            </div>
            <button class="tbl tbl--utama">
                <i class="pi pi-print"></i> Cetak Laporan
            </button>
        </header>

        <!-- ── metrik utama ─────────────────────────────────────── -->
        <section class="metrik">
            <StatCard label="Pemasukan (Invoice)" :nilai="rpk(metrik.pemasukan)" kaki="Bulan ini" />
            <StatCard label="Pengeluaran (HPP & OpEx)" :nilai="rpk(metrik.pengeluaran)" kaki="Bulan ini"
                :waspada="metrik.pengeluaran > metrik.pemasukan" />
            <StatCard label="Piutang (AR)" :nilai="rpk(metrik.piutang)"
                :kaki="`${metrik.invoiceGantung} Invoice belum lunas`" />
            <StatCard label="Hasil Produksi" :nilai="`${metrik.produksiTonase} Ton`" kaki="Target: 20 Ton" />
        </section>

        <div class="dua">
            <!-- ── kiri: aktivitas lintas departemen ────────────── -->
            <section class="panel">
                <div class="panel__kepala">
                    <div>
                        <h2 class="panel__judul">Aktivitas Lintas Departemen</h2>
                        <p class="panel__sub">Pembaruan sistem secara real-time</p>
                    </div>
                </div>

                <LoadingBar v-if="isLoading" pesan="Memuat data operasional pabrik" />

                <div v-else-if="aktivitas.length" class="antre">
                    <div v-for="(item, i) in aktivitas" :key="i" class="antre__baris"
                        :class="`antre__baris--${item.dept.toLowerCase()}`">
                        <div class="antre__ikon">
                            <i :class="ikonDept(item.dept)"></i>
                        </div>
                        <div class="antre__isi">
                            <div class="antre__header">
                                <span class="lencana" :class="`lencana--${item.dept.toLowerCase()}`">{{ item.dept
                                    }}</span>
                                <span class="antre__waktu">{{ item.waktu }}</span>
                            </div>
                            <p class="antre__judul">{{ item.judul }}</p>
                            <p class="antre__detail">{{ item.detail }}</p>
                        </div>
                    </div>
                </div>

                <EmptyState v-else pesan="Tidak ada aktivitas hari ini."
                    petunjuk="Sistem belum mencatat pergerakan baru." />
            </section>

            <!-- ── kanan: rasio & pintasan ──────────────────────── -->
            <aside class="samping">
                <section class="panel">
                    <div class="panel__kepala">
                        <h2 class="panel__judul">Kinerja Produksi</h2>
                    </div>
                    <div class="prog">
                        <div class="prog__kepala">
                            <span class="stensil">Volume Produksi (Bulan ini)</span>
                            <span class="prog__persen">{{ persenProduksi }}%</span>
                        </div>
                        <div class="bar">
                            <div class="bar__isi bar__isi--biru" :style="{ width: persenProduksi + '%' }"></div>
                        </div>
                        <p class="prog__kaki">{{ metrik.produksiTonase }} Ton dari target 20 Ton</p>
                    </div>
                </section>

                <section class="panel">
                    <div class="panel__kepala">
                        <h2 class="panel__judul">Pintasan Eksekutif</h2>
                    </div>
                    <nav class="pintas">
                        <router-link v-for="p in pintasan" :key="p.rute" :to="p.rute" class="pintas__item">
                            <span class="pintas__teks">
                                <span class="pintas__nama">{{ p.nama }}</span>
                                <span class="pintas__ringkas">{{ p.ringkas }}</span>
                            </span>
                            <span class="pintas__panah" aria-hidden="true">→</span>
                        </router-link>
                    </nav>
                </section>
            </aside>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useExecutive } from '@/features/executive/composables/useExecutive'

import StatCard from '@/components/ui/StatCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import LoadingBar from '@/components/ui/LoadingBar.vue'

// Tarik state dan action dari composable
const {
    isLoading,
    metrik,
    aktivitas,
    error,
    muat
} = useExecutive()

onMounted(() => {
    muat() // Panggil API saat halaman dimuat
})

const persenProduksi = computed(() => {
    // Menghitung persentase dari target bulanan (misal 20 Ton)
    const p = (metrik.value.produksiTonase / 20) * 100
    return Math.min(Math.round(p), 100)
})

const pintasan = [
    { nama: 'Laporan Laba/Rugi', ringkas: 'Profitabilitas perusahaan', rute: '/executive/laba-rugi' },
    { nama: 'Daftar Piutang', ringkas: 'Umur piutang B2B', rute: '/accounting/tagihan' },
    { nama: 'Jadwal Produksi', ringkas: 'Pantau reaktor & mixer', rute: '/produksi/jadwal' },
]

// Utilities (Formatting angka ke mata uang)
const rp = (n) => `Rp ${Number(n).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`

const rpk = (n) => {
    const a = Number(n)
    if (Math.abs(a) >= 1e9) return `Rp ${(a / 1e9).toFixed(2)} M`
    if (Math.abs(a) >= 1e6) return `Rp ${(a / 1e6).toFixed(1)} jt`
    return rp(a)
}

// Menentukan ikon berdasarkan string nama departemen dari backend
const ikonDept = (dept) => {
    const map = {
        'FINANCE': 'pi pi-wallet',
        'PRODUKSI': 'pi pi-cog',
        'LOGISTIK': 'pi pi-truck',
        'HRD': 'pi pi-users'
    }
    return map[dept] || 'pi pi-info-circle'
}
</script>

<style scoped>
.kepala {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
}

.remah {
    margin: 0 0 .3rem;
    font-size: .75rem;
    color: var(--redup-2);
}

.remah a {
    color: var(--redup);
    text-decoration: none;
}

.remah a:hover {
    color: var(--teks);
    text-decoration: underline;
}

.judul {
    margin: 0;
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: -.02em;
}

.sub {
    margin: .3rem 0 0;
    font-size: .875rem;
    color: var(--redup);
}

/* ── tombol ── */
.tbl {
    font-family: inherit;
    font-size: .8125rem;
    font-weight: 600;
    color: var(--teks);
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung-kecil);
    padding: .6rem 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .45rem;
}

.tbl:hover {
    border-color: var(--garis-tegas);
}

.tbl--utama {
    color: #fff;
    background: var(--biru);
    border-color: var(--biru);
}

.tbl--utama:hover {
    filter: brightness(.95);
}

/* ── metrik ── */
.metrik {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 1px;
    background: var(--garis);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    overflow: hidden;
    margin-bottom: 1.5rem;
}

/* ── layout dua kolom ── */
.dua {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 21rem);
    gap: 1.25rem;
    align-items: start;
}

@media (max-width: 1000px) {
    .dua {
        grid-template-columns: 1fr;
    }
}

.panel {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    overflow: hidden;
}

.panel__kepala {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid var(--garis);
}

.panel__judul {
    margin: 0;
    font-size: .9375rem;
    font-weight: 600;
}

.panel__sub {
    margin: .15rem 0 0;
    font-size: .75rem;
    color: var(--redup);
}

/* ── antrean aktivitas ── */
.antre {
    display: flex;
    flex-direction: column;
}

.antre__baris {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    gap: 1rem;
    align-items: start;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--latar);
}

.antre__baris:last-child {
    border-bottom: none;
}

.antre__baris:hover {
    background: var(--panel-hover, #F8FAFC);
}

.antre__ikon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 999px;
    background: var(--latar);
    color: var(--redup);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.antre__baris--finance .antre__ikon {
    background: var(--hijau-latar, #ECFDF5);
    color: var(--hijau, #10B981);
}

.antre__baris--produksi .antre__ikon {
    background: var(--biru-latar, #EFF6FF);
    color: var(--biru, #3B82F6);
}

.antre__baris--logistik .antre__ikon {
    background: var(--kuning-latar, #FEFCE8);
    color: var(--kuning, #EAB308);
}

.antre__isi {
    display: flex;
    flex-direction: column;
    gap: .25rem;
}

.antre__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: .25rem;
}

.antre__waktu {
    font-size: .6875rem;
    color: var(--redup-2);
}

.antre__judul {
    margin: 0;
    font-size: .875rem;
    font-weight: 600;
}

.antre__detail {
    margin: 0;
    font-size: .75rem;
    color: var(--redup);
    line-height: 1.4;
}

.lencana {
    font-size: .625rem;
    font-weight: 700;
    letter-spacing: .05em;
    padding: .15rem .45rem;
    border-radius: 4px;
}

.lencana--finance {
    color: var(--hijau);
    background: var(--hijau-latar);
}

.lencana--produksi {
    color: var(--biru);
    background: var(--biru-latar);
}

.lencana--logistik {
    color: var(--kuning);
    background: var(--kuning-latar);
}

.lencana--hrd {
    color: var(--redup);
    background: var(--latar);
}

/* ── bar progress ── */
.prog {
    padding: 1.25rem;
}

.prog__kepala {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: .5rem;
}

.stensil {
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--redup);
}

.prog__persen {
    font-size: .875rem;
    font-weight: 700;
    color: var(--teks);
}

.bar {
    width: 100%;
    height: 8px;
    background: var(--garis);
    border-radius: 4px;
    overflow: hidden;
}

.bar__isi {
    height: 100%;
    transition: width .4s ease;
}

.bar__isi--biru {
    background: var(--biru);
}

.prog__kaki {
    margin: .5rem 0 0;
    font-size: .75rem;
    color: var(--redup);
    text-align: right;
}

/* ── pintasan ── */
.samping {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.pintas {
    display: flex;
    flex-direction: column;
}

.pintas__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: .9rem 1.25rem;
    border-bottom: 1px solid var(--latar);
    color: inherit;
    text-decoration: none;
}

.pintas__item:last-child {
    border-bottom: none;
}

.pintas__item:hover {
    background: var(--panel-hover);
}

.pintas__teks {
    display: flex;
    flex-direction: column;
    gap: .15rem;
    min-width: 0;
}

.pintas__nama {
    font-size: .8125rem;
    font-weight: 600;
}

.pintas__ringkas {
    font-size: .6875rem;
    color: var(--redup);
}

.pintas__panah {
    color: var(--redup-2);
    font-size: .875rem;
    opacity: 0;
    transform: translateX(-4px);
    transition: all .18s ease;
}

.pintas__item:hover .pintas__panah {
    opacity: 1;
    transform: none;
    color: var(--teks);
}
</style>