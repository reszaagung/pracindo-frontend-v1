<!--
  features/warehouse/views/GoodsReceiptList.vue
  ===============================================
  Daftar penerimaan barang. Tabel di desktop, kartu di mobile — bukan
  tabel yang diperkecil (operator gudang sering buka ini dari HP).
-->
<template>
    <div class="halaman">
        <header class="kepala">
            <div>
                <h1 class="judul">Penerimaan Barang</h1>
                <p class="sub">Daftar penerimaan dari suplier</p>
            </div>
            <router-link to="/warehouse/penerimaan/buat" class="tombol tombol--utama">
                + Penerimaan Baru
            </router-link>
        </header>

        <div class="cari">
            <input v-model="kataKunci" @keyup.enter="cari" type="text"
                placeholder="Cari nomor / no. surat jalan / no. PO..." />
            <button class="tombol" @click="cari">Cari</button>
        </div>

        <p v-if="galat" class="galat">{{ galat }}</p>

        <div class="tabel-wrap">
            <table class="tabel">
                <thead>
                    <tr>
                        <th>Nomor</th>
                        <th>Tanggal</th>
                        <th>PO</th>
                        <th>Suplier</th>
                        <th>No. Surat Jalan</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in daftarPenerimaan" :key="p.id" class="baris" @click="bukaDetail(p.id)">
                        <td class="tebal">{{ p.nomor }}</td>
                        <td>{{ tanggal(p.tanggal) }}</td>
                        <td>{{ p.po_nomor }}</td>
                        <td>{{ p.suplier_nama }}</td>
                        <td>{{ p.no_surat_jalan }}</td>
                        <td><span v-if="p.ada_selisih" class="lencana lencana--merah">Ada selisih</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="kartu-list">
            <div v-for="p in daftarPenerimaan" :key="p.id" class="kartu" @click="bukaDetail(p.id)">
                <div class="kartu__baris1">
                    <span class="tebal">{{ p.nomor }}</span>
                    <span v-if="p.ada_selisih" class="lencana lencana--merah">Ada selisih</span>
                </div>
                <p class="kartu__sub">{{ p.suplier_nama }} · PO {{ p.po_nomor }}</p>
                <p class="kartu__sub">SJ {{ p.no_surat_jalan }} · {{ tanggal(p.tanggal) }}</p>
            </div>
        </div>

        <p v-if="!sedangProses && daftarPenerimaan.length === 0" class="kosong">
            Belum ada penerimaan.
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGoodsReceipt } from '../composables/useGoodsReceipt'
import { tanggal } from '@/utils/format'

const router = useRouter()
const { daftarPenerimaan, sedangProses, galat, muatPenerimaan } = useGoodsReceipt()

const kataKunci = ref('')
const cari = () => muatPenerimaan({ search: kataKunci.value })
const bukaDetail = (id) => router.push(`/warehouse/penerimaan/${id}`)

onMounted(() => muatPenerimaan())
</script>

<style scoped>
.halaman {
    max-width: 72rem;
    margin: 0 auto;
}

.kepala {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
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

.tombol {
    font-family: inherit;
    font-size: .8125rem;
    font-weight: 600;
    color: var(--teks);
    background: var(--panel);
    border: 1px solid var(--garis-tegas);
    border-radius: var(--lengkung-kecil);
    padding: .6rem 1.1rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
}

.tombol--utama {
    background: var(--biru);
    border-color: var(--biru);
    color: #fff;
}

.cari {
    display: flex;
    gap: .6rem;
    margin-bottom: 1.25rem;
}

.cari input {
    flex: 1;
    font-family: inherit;
    font-size: .875rem;
    padding: .6rem .8rem;
    border: 1px solid var(--garis-tegas);
    border-radius: var(--lengkung-kecil);
    background: var(--panel);
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

.tebal {
    font-weight: 600;
    color: var(--teks);
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

    .kartu__sub {
        margin: .35rem 0 0;
        font-size: .8125rem;
        color: var(--redup);
    }
}
</style>
