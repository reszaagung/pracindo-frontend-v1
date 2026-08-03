<!--
  features/warehouse/views/GoodsReceiptForm.vue
  ===============================================
  Layar penerimaan barang. Tiga angka per item — PO, deklarasi, timbang —
  dihitung ulang saat mengetik, tanpa tombol hitung. Selisih di atas 0,5%
  ditandai merah karena backend otomatis menerbitkan laporan selisih.

  qty_diterima dibatasi ke sisa_qty (sisa PO), BUKAN qty_pesan — PO boleh
  diterima bertahap. dokumen_id selalu null: endpoint upload dokumen belum
  ada (SPEK-BACKEND.md §3.3).
-->
<template>
    <div class="halaman">
        <p class="remah">
            <router-link to="/warehouse">Penerimaan Barang</router-link> › Penerimaan Baru
        </p>

        <template v-if="hasil">
            <section class="panel panel--sukses">
                <h1 class="judul">Penerimaan tersimpan</h1>
                <p class="sub">{{ hasil.pesan }}</p>
                <p class="sub">Nomor: <strong>{{ hasil.penerimaan?.nomor }}</strong></p>

                <div v-if="hasil.laporan_selisih?.length" class="tabel-wrap">
                    <table class="tabel">
                        <thead>
                            <tr>
                                <th>Nomor</th>
                                <th>Jenis</th>
                                <th class="ka">Qty selisih</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="s in hasil.laporan_selisih" :key="s.nomor">
                                <td class="tebal">{{ s.nomor }}</td>
                                <td>{{ s.jenis }}</td>
                                <td class="ka teks-merah">{{ angka(s.qty_selisih, 3) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="aksi">
                    <router-link v-if="hasil.penerimaan?.id" :to="`/warehouse/penerimaan/${hasil.penerimaan.id}`"
                        class="tombol tombol--utama">Lihat detail</router-link>
                    <router-link to="/warehouse" class="tombol">Kembali ke daftar</router-link>
                </div>
            </section>
        </template>

        <form v-else @submit.prevent="kirim">
            <section class="panel">
                <h2 class="panel__judul">Pilih PO</h2>
                <select v-model.number="poIdTerpilih" class="isian" required>
                    <option value="" disabled>Pilih purchase order...</option>
                    <option v-for="po in daftarPOSiapTerima" :key="po.id" :value="po.id">
                        {{ po.no_po }} — {{ po.suplier_nama }}
                    </option>
                </select>

                <div v-if="poTerpilih" class="baris2">
                    <label class="isian-blok">
                        <span class="label">No. Surat Jalan</span>
                        <input v-model="form.no_surat_jalan" type="text" required class="isian" />
                    </label>
                    <label class="isian-blok">
                        <span class="label">Tanggal</span>
                        <input v-model="form.tanggal" type="date" required class="isian" />
                    </label>
                </div>
                <label v-if="poTerpilih" class="isian-blok">
                    <span class="label">Catatan <em>opsional</em></span>
                    <input v-model="form.catatan" type="text" class="isian" />
                </label>
            </section>

            <section v-if="poTerpilih" class="panel">
                <h2 class="panel__judul">Item</h2>

                <div class="tabel-wrap">
                    <table class="tabel">
                        <thead>
                            <tr>
                                <th>Produk</th>
                                <th class="ka">Sisa PO</th>
                                <th>Kemasan</th>
                                <th class="ka">Koli</th>
                                <th class="ka">Isi/koli</th>
                                <th class="ka">Deklarasi</th>
                                <th class="ka">Qty timbang</th>
                                <th class="ka">Ditolak</th>
                                <th class="ka">Selisih</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="r in baris" :key="r.po_item_id">
                                <td>{{ r.nama_item }}</td>
                                <td class="ka">{{ angka(r.sisa_qty, 3) }}</td>
                                <td>
                                    <select v-model="r.jenis_kemasan" class="isian isian--kecil">
                                        <option v-for="k in JENIS_KEMASAN" :key="k" :value="k">{{ k }}</option>
                                    </select>
                                </td>
                                <td class="ka">
                                    <input v-if="r.jenis_kemasan !== 'CURAH'" v-model.number="r.jumlah_koli"
                                        type="number" min="0" step="1" class="isian isian--angka" required />
                                    <span v-else>—</span>
                                </td>
                                <td class="ka">
                                    <input v-if="r.jenis_kemasan !== 'CURAH'" v-model.number="r.isi_per_koli"
                                        type="number" min="0" step="0.001" class="isian isian--angka" required />
                                    <span v-else>—</span>
                                </td>
                                <td class="ka">{{ deklarasi(r) != null ? angka(deklarasi(r), 3) : '—' }}</td>
                                <td class="ka">
                                    <input v-model.number="r.qty_diterima" type="number" min="0" step="0.001"
                                        :max="r.sisa_qty" class="isian isian--angka" />
                                </td>
                                <td class="ka">
                                    <input v-model.number="r.qty_ditolak" type="number" min="0" step="0.001"
                                        class="isian isian--angka" />
                                </td>
                                <td class="ka" :class="{ 'teks-merah': melebihiToleransi(r) }">
                                    <template v-if="selisih(r) != null">
                                        {{ angka(selisih(r), 3) }} ({{ angka(persenSelisih(r), 2) }}%)
                                    </template>
                                    <span v-else>—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="kartu-item-list">
                    <div v-for="r in baris" :key="'kartu-' + r.po_item_id" class="kartu-item">
                        <div class="kartu-item__judul">
                            <span class="tebal">{{ r.nama_item }}</span>
                            <span class="redup">Sisa PO: {{ angka(r.sisa_qty, 3) }}</span>
                        </div>

                        <label class="isian-blok">
                            <span class="label">Kemasan</span>
                            <select v-model="r.jenis_kemasan" class="isian">
                                <option v-for="k in JENIS_KEMASAN" :key="k" :value="k">{{ k }}</option>
                            </select>
                        </label>

                        <div v-if="r.jenis_kemasan !== 'CURAH'" class="baris2">
                            <label class="isian-blok">
                                <span class="label">Jumlah koli</span>
                                <input v-model.number="r.jumlah_koli" type="number" min="0" step="1"
                                    class="isian isian--angka" required />
                            </label>
                            <label class="isian-blok">
                                <span class="label">Isi/koli</span>
                                <input v-model.number="r.isi_per_koli" type="number" min="0" step="0.001"
                                    class="isian isian--angka" required />
                            </label>
                        </div>

                        <p class="kartu-item__deklarasi">
                            Deklarasi: {{ deklarasi(r) != null ? angka(deklarasi(r), 3) : '—' }}
                        </p>

                        <div class="baris2">
                            <label class="isian-blok">
                                <span class="label">Qty timbang</span>
                                <input v-model.number="r.qty_diterima" type="number" min="0" step="0.001"
                                    :max="r.sisa_qty" class="isian isian--angka" />
                            </label>
                            <label class="isian-blok">
                                <span class="label">Ditolak</span>
                                <input v-model.number="r.qty_ditolak" type="number" min="0" step="0.001"
                                    class="isian isian--angka" />
                            </label>
                        </div>

                        <p class="kartu-item__selisih" :class="{ 'teks-merah': melebihiToleransi(r) }">
                            <template v-if="selisih(r) != null">
                                Selisih: {{ angka(selisih(r), 3) }} ({{ angka(persenSelisih(r), 2) }}%)
                            </template>
                        </p>
                    </div>
                </div>

                <p v-for="r in barisMelebihiToleransi" :key="r.po_item_id" class="peringatan">
                    {{ r.nama_item }}: selisih melebihi 0,5% — laporan selisih akan terbit otomatis.
                </p>

                <div v-for="r in baris.filter(r => Number(r.qty_ditolak) > 0)" :key="'tolak-' + r.po_item_id"
                    class="isian-blok">
                    <span class="label">Alasan tolak — {{ r.nama_item }}</span>
                    <input v-model="r.alasan_tolak" type="text" required class="isian" />
                </div>

                <p v-for="r in barisLewatSisa" :key="'lewat-' + r.po_item_id" class="peringatan">
                    {{ r.nama_item }}: qty timbang melebihi sisa PO ({{ angka(r.sisa_qty, 3) }}).
                </p>
            </section>

            <p v-if="pesanError" class="galat">{{ pesanError }}</p>

            <div v-if="poTerpilih" class="aksi">
                <router-link to="/warehouse" class="tombol">Batal</router-link>
                <button type="submit" class="tombol tombol--utama" :disabled="sedangProses || barisLewatSisa.length > 0">
                    {{ sedangProses ? 'Menyimpan...' : 'Simpan Penerimaan' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useGoodsReceipt } from '../composables/useGoodsReceipt'
import { angka, hariIni } from '@/utils/format'

const JENIS_KEMASAN = ['KARUNG', 'DRUM', 'JERIGEN', 'DUS', 'SAK', 'CURAH']

const { daftarPOSiapTerima, sedangProses, muatPOSiapTerima, simpanPenerimaan } = useGoodsReceipt()

const poIdTerpilih = ref('')
const poTerpilih = computed(() => daftarPOSiapTerima.value.find(po => po.id === poIdTerpilih.value) ?? null)

const form = reactive({ no_surat_jalan: '', tanggal: hariIni(), catatan: '' })
const baris = ref([])
const pesanError = ref('')
const hasil = ref(null)

watch(poTerpilih, (po) => {
    baris.value = (po?.item ?? []).map(it => ({
        po_item_id: it.id,
        nama_item: it.nama_item,
        sisa_qty: Number(it.sisa_qty),
        jenis_kemasan: 'CURAH',
        jumlah_koli: null,
        isi_per_koli: null,
        qty_diterima: null,
        qty_ditolak: 0,
        alasan_tolak: '',
    }))
})

const deklarasi = (r) => {
    if (r.jenis_kemasan === 'CURAH' || !r.jumlah_koli || !r.isi_per_koli) return null
    return r.jumlah_koli * r.isi_per_koli
}
const selisih = (r) => {
    const d = deklarasi(r)
    if (d == null || r.qty_diterima == null || r.qty_diterima === '') return null
    return Number(r.qty_diterima) - d
}
const persenSelisih = (r) => {
    const d = deklarasi(r)
    const s = selisih(r)
    return d && s != null ? (s / d) * 100 : null
}
const melebihiToleransi = (r) => {
    const p = persenSelisih(r)
    return p != null && Math.abs(p) > 0.5
}

const barisMelebihiToleransi = computed(() => baris.value.filter(melebihiToleransi))
const barisLewatSisa = computed(() =>
    baris.value.filter(r => r.qty_diterima != null && Number(r.qty_diterima) > r.sisa_qty))

const kirim = async () => {
    pesanError.value = ''
    const barisKirim = baris.value
        .filter(r => Number(r.qty_diterima) > 0)
        .map(r => ({
            po_item_id: r.po_item_id,
            jenis_kemasan: r.jenis_kemasan,
            jumlah_koli: r.jenis_kemasan === 'CURAH' ? null : r.jumlah_koli,
            isi_per_koli: r.jenis_kemasan === 'CURAH' ? null : r.isi_per_koli,
            qty_diterima: String(r.qty_diterima),
            qty_ditolak: String(r.qty_ditolak || 0),
            alasan_tolak: r.alasan_tolak || '',
        }))

    if (!barisKirim.length) {
        pesanError.value = 'Minimal satu item harus diisi qty timbang.'
        return
    }

    const res = await simpanPenerimaan({
        po_id: poTerpilih.value.id,
        no_surat_jalan: form.no_surat_jalan,
        tanggal: form.tanggal,
        dokumen_id: null,
        catatan: form.catatan,
        baris: barisKirim,
    })

    if (res.success) hasil.value = res.data
    else pesanError.value = res.message
}

onMounted(() => muatPOSiapTerima())
</script>

<style scoped>
.halaman {
    max-width: 72rem;
    margin: 0 auto;
}

.remah {
    margin: 0 0 1rem;
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
    margin: .4rem 0 0;
    font-size: .875rem;
    color: var(--redup);
}

.panel {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    padding: 1.25rem;
    margin-bottom: 1.25rem;
}

.panel--sukses {
    border-color: var(--hijau);
}

.panel__judul {
    margin: 0 0 1rem;
    font-size: .9375rem;
    font-weight: 700;
    color: var(--teks);
}

.label {
    display: block;
    margin-bottom: .4rem;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--redup-2);
}

.label em {
    text-transform: none;
    font-weight: 400;
    letter-spacing: 0;
}

.isian {
    width: 100%;
    font-family: inherit;
    font-size: .875rem;
    color: var(--teks);
    background: var(--panel);
    border: 1px solid var(--garis-tegas);
    border-radius: var(--lengkung-kecil);
    padding: .6rem .7rem;
}

.isian:focus {
    outline: none;
    border-color: var(--biru);
}

.isian--kecil {
    padding: .4rem .5rem;
    font-size: .8125rem;
}

.isian--angka {
    text-align: right;
    min-width: 6rem;
}

.isian-blok {
    margin-top: 1rem;
}

.baris2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
}

@media (max-width: 560px) {
    .baris2 {
        grid-template-columns: 1fr;
    }
}

.tabel-wrap {
    overflow-x: auto;
}

.tabel {
    width: 100%;
    border-collapse: collapse;
}

.kartu-item-list {
    display: none;
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
    padding: .5rem;
    font-size: .8125rem;
    color: var(--teks-2);
    border-bottom: 1px solid var(--garis);
    vertical-align: middle;
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

.peringatan {
    margin: .75rem 0 0;
    padding: .6rem .8rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
}

.galat {
    padding: .75rem 1rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1rem;
}

.aksi {
    display: flex;
    gap: .6rem;
    justify-content: flex-end;
}

.tombol {
    font-family: inherit;
    font-size: .8125rem;
    font-weight: 600;
    color: var(--teks);
    background: var(--panel);
    border: 1px solid var(--garis-tegas);
    border-radius: var(--lengkung-kecil);
    padding: .65rem 1.25rem;
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

@media (max-width: 768px) {
    .tabel-wrap {
        display: none;
    }

    .kartu-item-list {
        display: flex;
        flex-direction: column;
        gap: .85rem;
    }

    .kartu-item {
        border: 1px solid var(--garis);
        border-radius: var(--lengkung-kecil);
        padding: .9rem;
    }

    .kartu-item__judul {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: .75rem;
    }

    .redup {
        font-size: .75rem;
        color: var(--redup);
    }

    .kartu-item__deklarasi {
        margin: .5rem 0 0;
        font-size: .8125rem;
        color: var(--redup);
    }

    .kartu-item__selisih {
        margin: .75rem 0 0;
        font-size: .8125rem;
        font-weight: 600;
        color: var(--teks);
        min-height: 1.2em;
    }
}

.tombol:disabled {
    opacity: .5;
    cursor: not-allowed;
}
</style>
