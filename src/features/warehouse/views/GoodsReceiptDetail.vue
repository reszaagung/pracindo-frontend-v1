<!--
  features/warehouse/views/GoodsReceiptDetail.vue
  =================================================
  Satu panggilan ke penerimaan/{id}/ringkasan/ berisi ringkasan item DAN
  laporan selisih sekaligus — tidak perlu request kedua.

  CATATAN: respons ringkasan/ menyertakan field `klaim` (nilai_klaim) di
  tiap baris selisih TANPA gerbang ?sisi= atau cek peran akunting — beda
  dari serializer lain di modul ini yang konsisten menyembunyikan uang
  dari gudang. Field itu SENGAJA tidak dirender di sini; ini celah
  backend yang sebaiknya ditutup di sana, bukan ditambal di sini.
-->
<template>
    <div class="halaman">
        <p v-if="galat" class="galat">{{ galat }}</p>

        <template v-if="ringkasan">
            <header class="kepala">
                <div>
                    <p class="remah">
                        <router-link to="/warehouse">Penerimaan Barang</router-link> › {{ ringkasan.nomor }}
                    </p>
                    <h1 class="judul">{{ ringkasan.nomor }}</h1>
                    <p class="sub">
                        {{ ringkasan.suplier }} · PO {{ ringkasan.po }} · {{ tanggal(ringkasan.tanggal) }}
                    </p>
                </div>
                <span v-if="ringkasan.ada_selisih" class="lencana lencana--merah">Ada selisih</span>
            </header>

            <section class="panel">
                <h2 class="panel__judul">Item diterima</h2>
                <div class="tabel-wrap">
                    <table class="tabel">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Kemasan</th>
                                <th class="ka">Koli</th>
                                <th class="ka">Isi/koli</th>
                                <th class="ka">Deklarasi</th>
                                <th class="ka">Timbang</th>
                                <th class="ka">Ditolak</th>
                                <th class="ka">Selisih</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(it, i) in ringkasan.item" :key="i">
                                <td>{{ it.nama }}</td>
                                <td>{{ it.kemasan }}</td>
                                <td class="ka">{{ it.koli ?? '—' }}</td>
                                <td class="ka">{{ it.isi_per_koli ? angka(it.isi_per_koli, 3) : '—' }}</td>
                                <td class="ka">{{ it.deklarasi ? angka(it.deklarasi, 3) : '—' }}</td>
                                <td class="ka">{{ angka(it.timbang, 3) }}</td>
                                <td class="ka">{{ angka(it.ditolak, 3) }}</td>
                                <td class="ka" :class="{ 'teks-merah': melebihiToleransi(it.persen) }">
                                    {{ it.selisih_berat != null ? angka(it.selisih_berat, 3) : '—' }}
                                    <span v-if="it.persen != null">({{ angka(it.persen, 2) }}%)</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section v-if="ringkasan.selisih?.length" class="panel">
                <h2 class="panel__judul">Laporan selisih otomatis</h2>
                <div class="tabel-wrap">
                    <table class="tabel">
                        <thead>
                            <tr>
                                <th>Nomor</th>
                                <th>Jenis</th>
                                <th class="ka">Qty</th>
                                <th>Status</th>
                                <th>Resolusi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="s in ringkasan.selisih" :key="s.nomor">
                                <td class="tebal">{{ s.nomor }}</td>
                                <td>{{ s.jenis }}</td>
                                <td class="ka teks-merah">{{ angka(s.qty, 3) }}</td>
                                <td>{{ s.status }}</td>
                                <td>{{ s.resolusi ?? '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </template>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGoodsReceipt } from '../composables/useGoodsReceipt'
import { angka, tanggal } from '@/utils/format'

const props = defineProps({ id: { type: [String, Number], required: true } })

const { ringkasan, galat, muatRingkasan } = useGoodsReceipt()

const melebihiToleransi = (persen) => persen != null && Math.abs(persen) > 0.5

onMounted(() => muatRingkasan(props.id))
</script>

<style scoped>
.halaman {
    max-width: 72rem;
    margin: 0 auto;
}

.galat {
    padding: .75rem 1rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1rem;
}

.kepala {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
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

.lencana {
    font-size: .6875rem;
    font-weight: 700;
    padding: .25rem .6rem;
    border-radius: 999px;
    height: fit-content;
}

.lencana--merah {
    color: var(--merah);
    background: var(--merah-latar);
}

.panel {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    padding: 1.25rem;
    margin-bottom: 1.25rem;
}

.panel__judul {
    margin: 0 0 1rem;
    font-size: .9375rem;
    font-weight: 700;
    color: var(--teks);
}

.tabel-wrap {
    overflow-x: auto;
}

.tabel {
    width: 100%;
    border-collapse: collapse;
    min-width: 40rem;
}

.tabel th {
    text-align: left;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--redup-2);
    padding: .6rem .5rem;
    border-bottom: 1px solid var(--garis);
}

.tabel td {
    padding: .6rem .5rem;
    font-size: .8125rem;
    color: var(--teks-2);
    border-bottom: 1px solid var(--garis);
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
</style>
