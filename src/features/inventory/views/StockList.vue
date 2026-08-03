<!--
  features/inventory/views/StockList.vue
  ========================================
  Tab per lapis: RAW, POOL, JADI. Tidak minta ?sisi=akunting di layar ini
  — nilai Rupiah itu urusan layar detail/akunting, bukan daftar stok.
-->
<template>
    <div class="halaman">
        <header class="kepala">
            <h1 class="judul">Stok</h1>
            <p class="sub">Persediaan tiga lapis — bahan mentah, pool produksi, barang jadi</p>
        </header>

        <div class="tab">
            <button v-for="l in LAPIS" :key="l.nilai" class="tab__tombol" :class="{ 'tab__tombol--aktif': lapis === l.nilai }"
                @click="pilihLapis(l.nilai)">
                {{ l.label }}
            </button>
        </div>

        <p v-if="galat" class="galat">{{ galat }}</p>

        <div class="tabel-wrap">
            <table class="tabel">
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Grup Bahan</th>
                        <th>Tangki</th>
                        <th class="ka">Qty</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="s in daftarStok" :key="s.id" class="baris" @click="bukaDetail(s.id)">
                        <td class="tebal">{{ s.produk_kode }}</td>
                        <td>{{ s.grup_bahan_kode }}</td>
                        <td>{{ s.tangki_kode ?? '—' }}</td>
                        <td class="ka">{{ angka(s.qty, 3) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="kartu-list">
            <div v-for="s in daftarStok" :key="s.id" class="kartu" @click="bukaDetail(s.id)">
                <div class="kartu__baris1">
                    <span class="tebal">{{ s.produk_kode }}</span>
                    <span class="kartu__qty">{{ angka(s.qty, 3) }}</span>
                </div>
                <p class="kartu__sub">{{ s.grup_bahan_kode }} · {{ s.tangki_kode ?? 'tanpa tangki' }}</p>
            </div>
        </div>

        <p v-if="!sedangProses && daftarStok.length === 0" class="kosong">Tidak ada stok di lapis ini.</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStock } from '../composables/useStock'
import { angka } from '@/utils/format'

const LAPIS = [
    { nilai: 'RAW', label: 'RAW' },
    { nilai: 'POOL', label: 'POOL' },
    { nilai: 'JADI', label: 'JADI' },
]

const router = useRouter()
const { daftarStok, sedangProses, galat, muatStok } = useStock()

const lapis = ref('RAW')
const pilihLapis = (l) => {
    lapis.value = l
    muatStok({ lapis: l })
}
const bukaDetail = (id) => router.push(`/inventory/stok/${id}`)

onMounted(() => muatStok({ lapis: lapis.value }))
</script>

<style scoped>
.halaman {
    max-width: 72rem;
    margin: 0 auto;
}

.kepala {
    margin-bottom: 1rem;
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

.tab {
    display: flex;
    gap: .4rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid var(--garis);
}

.tab__tombol {
    font-family: inherit;
    font-size: .8125rem;
    font-weight: 600;
    color: var(--redup);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: .6rem .3rem;
    margin-right: 1rem;
    cursor: pointer;
}

.tab__tombol--aktif {
    color: var(--teks);
    border-bottom-color: var(--biru);
}

.galat {
    padding: .75rem 1rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1rem;
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

.baris {
    cursor: pointer;
}

.baris:hover td {
    background: var(--panel-hover);
}

.ka {
    text-align: right;
}

.tebal {
    font-weight: 600;
    color: var(--teks);
}

.kartu-list {
    display: none;
}

.kosong {
    padding: 3rem 1rem;
    text-align: center;
    color: var(--redup);
    font-size: .875rem;
}

@media (max-width: 768px) {
    .tabel-wrap {
        display: none;
    }

    .kartu-list {
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }

    .kartu {
        background: var(--panel);
        border: 1px solid var(--garis);
        border-radius: var(--lengkung);
        padding: 1rem;
        cursor: pointer;
    }

    .kartu__baris1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .kartu__qty {
        font-weight: 600;
        color: var(--teks);
    }

    .kartu__sub {
        margin: .35rem 0 0;
        font-size: .8125rem;
        color: var(--redup);
    }
}
</style>
