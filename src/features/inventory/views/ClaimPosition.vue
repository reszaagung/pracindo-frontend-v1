<!--
  features/inventory/views/ClaimPosition.vue
  ============================================
  Posisi klaim tiap entitas atas satu grup pool. Baris dari
  posisi-klaim/?grup= memakai nama field LIST (bersih/setor/ambil/
  berhutang), bukan nilai_bersih mentah — itu cuma ada di retrieve
  satu-objek, tidak dipakai di sini.

  Total posisi bersih harus sama dengan nilai sisa pool (isi-pool/) —
  itu invariant sistemnya (SPEK-BACKEND.md §5). Kalau beda, itu tanda
  bug di backend; jangan dibulatkan di sini, tampilkan peringatannya.
-->
<template>
    <div class="halaman">
        <header class="kepala">
            <p class="remah"><router-link to="/inventory">Stok</router-link> › Posisi Klaim</p>
            <h1 class="judul">Posisi Klaim — Grup {{ grup }}</h1>
        </header>

        <p v-if="galat" class="galat">{{ galat }}</p>

        <p v-if="tidakSeimbang" class="peringatan">
            Total posisi bersih ({{ angka(totalBersih, 3) }}) tidak sama dengan sisa nilai pool
            ({{ angka(totalNilaiPool, 3) }}). Ini indikasi masalah data di backend — bukan
            pembulatan, jangan ditambal di sini.
        </p>

        <div class="tabel-wrap">
            <table class="tabel">
                <thead>
                    <tr>
                        <th>Entitas</th>
                        <th class="ka">Setor</th>
                        <th class="ka">Ambil</th>
                        <th class="ka">Bersih</th>
                        <th>Posisi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in posisiKlaim" :key="p.entitas">
                        <td class="tebal">{{ p.entitas }}</td>
                        <td class="ka">{{ angka(p.setor, 3) }}</td>
                        <td class="ka">{{ angka(p.ambil, 3) }}</td>
                        <td class="ka" :class="{ 'teks-merah': p.berhutang }">{{ angka(p.bersih, 3) }}</td>
                        <td>
                            <span class="lencana" :class="p.berhutang ? 'lencana--merah' : 'lencana--netral'">
                                {{ p.berhutang ? 'berhutang' : 'berpiutang' }}
                            </span>
                        </td>
                    </tr>
                </tbody>
                <tfoot v-if="posisiKlaim.length">
                    <tr>
                        <td class="tebal">Total</td>
                        <td></td>
                        <td></td>
                        <td class="ka tebal">{{ angka(totalBersih, 3) }}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <p v-if="!sedangProses && posisiKlaim.length === 0" class="kosong">Belum ada posisi klaim di grup ini.</p>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useClaim } from '../composables/useClaim'
import { angka } from '@/utils/format'

const props = defineProps({ grup: { type: [String, Number], required: true } })

const { posisiKlaim, isiPool, sedangProses, galat, muatPosisiKlaim, muatIsiPool } = useClaim()

const totalBersih = computed(() =>
    posisiKlaim.value.reduce((s, p) => s + Number(p.bersih || 0), 0))
const totalNilaiPool = computed(() => Number(isiPool.value?.total_nilai || 0))

const tidakSeimbang = computed(() =>
    posisiKlaim.value.length > 0 && Math.abs(totalBersih.value - totalNilaiPool.value) > 0.01)

onMounted(() => {
    muatPosisiKlaim(props.grup)
    muatIsiPool(props.grup)
})
</script>

<style scoped>
.halaman {
    max-width: 60rem;
    margin: 0 auto;
}

.kepala {
    margin-bottom: 1.25rem;
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
}

.judul {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--teks);
}

.galat {
    padding: .75rem 1rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1rem;
}

.peringatan {
    padding: .85rem 1rem;
    background: var(--kuning-latar);
    border: 1px solid var(--kuning-garis);
    color: var(--kuning);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1.25rem;
}

.tabel-wrap {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    overflow: hidden;
}

.tabel {
    width: 100%;
    border-collapse: collapse;
}

.tabel th {
    text-align: left;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--redup-2);
    padding: .85rem 1rem;
    border-bottom: 1px solid var(--garis);
}

.tabel td {
    padding: .75rem 1rem;
    font-size: .8125rem;
    color: var(--teks-2);
    border-bottom: 1px solid var(--garis);
}

.tabel tfoot td {
    border-bottom: none;
    border-top: 2px solid var(--garis-tegas);
}

.ka {
    text-align: right;
}

.tebal {
    font-weight: 600;
    color: var(--teks);
}

.teks-merah {
    color: var(--merah);
    font-weight: 600;
}

.lencana {
    font-size: .6875rem;
    font-weight: 700;
    padding: .2rem .55rem;
    border-radius: 999px;
}

.lencana--merah {
    color: var(--merah);
    background: var(--merah-latar);
}

.lencana--netral {
    color: var(--redup);
    background: var(--latar);
}

.kosong {
    padding: 3rem 1rem;
    text-align: center;
    color: var(--redup);
    font-size: .875rem;
}
</style>
