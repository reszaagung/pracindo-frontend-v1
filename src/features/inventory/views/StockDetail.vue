<!--
  features/inventory/views/StockDetail.vue
  ==========================================
  Mutasi plus kepemilikan — TAPI kepemilikan cuma masuk akal untuk RAW
  dan JADI. Lapis POOL tidak pernah punya SaldoEntitas (backend menolaknya
  di level model), jadi baris "kepemilikan" akan selalu kosong di sana.
  Untuk POOL, arahkan ke posisi klaim (ClaimPosition) alih-alih menampilkan
  bagian kepemilikan yang memang tidak ada datanya.
-->
<template>
    <div class="halaman">
        <p v-if="galat" class="galat">{{ galat }}</p>

        <template v-if="stokDetail">
            <header class="kepala">
                <div>
                    <p class="remah"><router-link to="/inventory">Stok</router-link> › {{ stokDetail.produk_kode }}</p>
                    <h1 class="judul">{{ stokDetail.produk_kode }}</h1>
                    <p class="sub">
                        {{ stokDetail.grup_bahan_kode }} · lapis {{ stokDetail.lapis_label }}
                        <template v-if="stokDetail.tangki_kode"> · tangki {{ stokDetail.tangki_kode }}</template>
                    </p>
                </div>
                <p class="qty">{{ angka(stokDetail.qty, 3) }}</p>
            </header>

            <section v-if="stokDetail.lapis === 'POOL'" class="panel panel--info">
                <p class="info__teks">
                    Lapis POOL tidak punya pemilik — yang ada adalah <strong>posisi klaim</strong> tiap
                    entitas atas pool ini.
                </p>
                <router-link :to="`/inventory/klaim/${stokDetail.grup_bahan}`" class="tombol tombol--utama">
                    Lihat posisi klaim
                </router-link>
            </section>

            <section v-else class="panel">
                <h2 class="panel__judul">Kepemilikan</h2>
                <div class="tabel-wrap">
                    <table class="tabel">
                        <thead>
                            <tr>
                                <th>Entitas</th>
                                <th class="ka">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="k in stokDetail.kepemilikan" :key="k.entitas">
                                <td class="tebal">{{ k.entitas_kode }}</td>
                                <td class="ka">{{ angka(k.qty, 3) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-if="!stokDetail.kepemilikan?.length" class="kosong">Belum ada kepemilikan tercatat.</p>
            </section>

            <section class="panel">
                <h2 class="panel__judul">Riwayat mutasi</h2>
                <div class="tabel-wrap">
                    <table class="tabel">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Jenis</th>
                                <th class="ka">Masuk</th>
                                <th class="ka">Keluar</th>
                                <th class="ka">Saldo akhir</th>
                                <th>Referensi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="m in daftarMutasi" :key="m.id">
                                <td>{{ tanggal(m.tanggal) }}</td>
                                <td>{{ m.jenis_label }}</td>
                                <td class="ka">{{ m.masuk ? angka(m.masuk, 3) : '—' }}</td>
                                <td class="ka">{{ m.keluar ? angka(m.keluar, 3) : '—' }}</td>
                                <td class="ka tebal">{{ angka(m.saldo_akhir, 3) }}</td>
                                <td>{{ m.referensi || '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-if="!daftarMutasi.length" class="kosong">Belum ada mutasi.</p>
            </section>
        </template>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStock } from '../composables/useStock'
import { angka, tanggal } from '@/utils/format'

const props = defineProps({ id: { type: [String, Number], required: true } })

const { stokDetail, daftarMutasi, galat, muatStokDetail, muatMutasi } = useStock()

onMounted(() => {
    muatStokDetail(props.id)
    muatMutasi({ stok: props.id })
})
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

.qty {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--teks);
}

.panel {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    padding: 1.25rem;
    margin-bottom: 1.25rem;
}

.panel--info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    background: var(--biru-latar);
    border-color: var(--biru);
}

.info__teks {
    margin: 0;
    font-size: .875rem;
    color: var(--teks-2);
    max-width: 32rem;
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
    white-space: nowrap;
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

.kosong {
    padding: 1.5rem 0;
    text-align: center;
    color: var(--redup);
    font-size: .8125rem;
}

.tombol {
    font-family: inherit;
    font-size: .8125rem;
    font-weight: 600;
    border-radius: var(--lengkung-kecil);
    padding: .6rem 1.1rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
}

.tombol--utama {
    background: var(--biru);
    border: 1px solid var(--biru);
    color: #fff;
}
</style>
