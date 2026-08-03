<!--
  features/inventory/views/TankMonitor.vue
  ==========================================
  Monitor tangki: isi, kapasitas, persen terisi, produk yang mengisinya.
-->
<template>
    <div class="halaman">
        <header class="kepala">
            <h1 class="judul">Monitor Tangki</h1>
            <p class="sub">Isi, kapasitas, dan produk yang sedang mengisi tiap tangki</p>
        </header>

        <p v-if="galat" class="galat">{{ galat }}</p>

        <div class="grid">
            <div v-for="t in daftarTangki" :key="t.id" class="kartu" :class="{ 'kartu--kosong': !t.aktif }">
                <div class="kartu__kepala">
                    <span class="tebal">{{ t.kode }}</span>
                    <span class="redup">{{ t.grup_bahan_kode }}</span>
                </div>
                <p class="kartu__nama">{{ t.nama }}</p>

                <p class="kartu__produk">
                    {{ t.produk_terisi_kode ?? 'Kosong' }}
                </p>

                <div class="bar">
                    <div class="bar__isi" :style="{ width: `${Math.min(100, t.persen_terisi)}%` }"
                        :class="{ 'bar__isi--penuh': t.persen_terisi >= 90 }"></div>
                </div>
                <div class="kartu__angka">
                    <span>{{ angka(t.isi_kg, 1) }} / {{ angka(t.kapasitas_kg, 1) }} kg</span>
                    <span class="tebal">{{ angka(t.persen_terisi, 1) }}%</span>
                </div>
                <p class="kartu__sisa">Ruang kosong: {{ angka(t.ruang_kosong_kg, 1) }} kg</p>
            </div>
        </div>

        <p v-if="!sedangProses && daftarTangki.length === 0" class="kosong">Tidak ada data tangki.</p>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTank } from '../composables/useTank'
import { angka } from '@/utils/format'

const { daftarTangki, sedangProses, galat, muatTangki } = useTank()

onMounted(() => muatTangki())
</script>

<style scoped>
.halaman {
    max-width: 72rem;
    margin: 0 auto;
}

.kepala {
    margin-bottom: 1.25rem;
}

.judul {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--teks);
}

.sub {
    margin: .3rem 0 0;
    font-size: .875rem;
    color: var(--redup);
}

.galat {
    padding: .75rem 1rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1rem;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 1rem;
}

.kartu {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    padding: 1.1rem;
}

.kartu--kosong {
    opacity: .55;
}

.kartu__kepala {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.tebal {
    font-weight: 700;
    color: var(--teks);
}

.redup {
    font-size: .75rem;
    color: var(--redup-2);
}

.kartu__nama {
    margin: .2rem 0 .75rem;
    font-size: .8125rem;
    color: var(--redup);
}

.kartu__produk {
    margin: 0 0 .6rem;
    font-size: .9375rem;
    font-weight: 600;
    color: var(--teks);
}

.bar {
    height: 8px;
    border-radius: 999px;
    background: var(--garis);
    overflow: hidden;
}

.bar__isi {
    height: 100%;
    background: var(--biru);
    border-radius: 999px;
    transition: width .2s ease;
}

.bar__isi--penuh {
    background: var(--kuning);
}

.kartu__angka {
    display: flex;
    justify-content: space-between;
    margin-top: .5rem;
    font-size: .8125rem;
    color: var(--teks-2);
}

.kartu__sisa {
    margin: .35rem 0 0;
    font-size: .75rem;
    color: var(--redup-2);
}

.kosong {
    padding: 3rem 1rem;
    text-align: center;
    color: var(--redup);
    font-size: .875rem;
}
</style>
