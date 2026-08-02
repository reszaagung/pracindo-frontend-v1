<!-- src/features/accounting/views/PurchaseOrderForm.vue -->
<template>
    <div>
        <header class="kepala">
            <div>
                <p class="remah">
                    <router-link to="/">Dashboard</router-link> ›
                    <router-link to="/accounting/transaksi/po">Pembelian</router-link> › Buat PO
                </p>
                <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 0.75rem;">
                    <h1 class="judul">Buat purchase order</h1>
                    <span class="lencana-draft">DRAFT</span>
                </div>
            </div>

            <!-- TOMBOL TAMBAH SUPLIER CEPAT -->
            <button type="button" class="tbl tbl--utama">
                <i class="pi pi-plus" style="margin-right: 4px; font-size: 0.75rem;"></i> Suplier Baru
            </button>
        </header>

        <form @submit.prevent="kirim">
            <!-- ── HEADER INFORMASI UTAMA ──────────────────────────────────────── -->
            <section class="panel">
                <div class="panel__kepala">
                    <h2 class="panel__judul">Informasi utama</h2>
                </div>

                <div class="isi">
                    <div class="baris3">
                        <label class="isian">
                            <span class="isian__label">Entitas pembeli</span>
                            <select v-model.number="draf.entitas_id" required>
                                <option value="" disabled>Pilih entitas</option>
                                <option v-for="a in listEntitas" :key="a.id" :value="a.id">
                                    {{ a.kode }} — {{ a.nama }}
                                </option>
                            </select>
                        </label>

                        <label class="isian">
                            <span class="isian__label">Tanggal PO</span>
                            <input v-model="draf.tanggal" type="date" required />
                        </label>

                        <div class="isian">
                            <span class="isian__label">Nomor PO</span>
                            <div class="nomor">
                                <span v-if="previewNomor && previewNomor !== 'Pilih entitas & tanggal'">{{ previewNomor
                                }}</span>
                                <span v-else class="nomor__kosong">Pilih entitas &amp; tanggal</span>
                            </div>
                            <span class="isian__bantu">
                                Sementara — nomor final dibuat sistem saat disimpan.
                            </span>
                        </div>
                    </div>

                    <div class="baris2">
                        <label class="isian">
                            <span class="isian__label">Suplier</span>
                            <select v-model.number="draf.suplier_id" required>
                                <option value="" disabled>Pilih supplier</option>
                                <option v-for="s in listSupplier" :key="s.id" :value="s.id">
                                    {{ s.nama }}{{ s.kota ? ` — ${s.kota}` : '' }}
                                </option>
                            </select>
                        </label>

                        <label class="isian">
                            <span class="isian__label">Tanggal kirim diminta <em>opsional</em></span>
                            <input v-model="draf.tanggal_kirim_diminta" type="date" />
                            <span class="isian__bantu">
                                Kapan barang diminta tiba. Bukan jatuh tempo bayar — itu lahir di faktur.
                            </span>
                        </label>
                    </div>

                    <label class="isian">
                        <span class="isian__label">Catatan <em>opsional</em></span>
                        <input v-model="draf.catatan" type="text" placeholder="Contoh: Kirim ke gudang belakang" />
                    </label>
                </div>
            </section>

            <!-- ── RINCIAN ITEM ────────────────────────────────────────── -->
            <section class="panel">
                <div class="panel__kepala">
                    <div>
                        <h2 class="panel__judul">Rincian item</h2>
                        <p class="panel__sub">Qty = unit/kg × jml unit — kosongkan unit/kg untuk barang hitungan (pcs)
                        </p>
                    </div>
                    <button type="button" class="tbl tbl--outline" @click="tambahItem">
                        <i class="pi pi-plus" style="margin-right: 4px; font-size: 0.75rem;"></i> Tambah item
                    </button>
                </div>

                <div class="tabel">
                    <div class="tabel__kepala">
                        <span>Produk</span>
                        <span class="ka">Unit/kg</span>
                        <span class="ka">Jml unit</span>
                        <span class="ka">Qty</span>
                        <span class="ka">Harga /kg</span>
                        <span class="ka">Subtotal</span>
                        <span></span>
                    </div>

                    <div v-for="(item, i) in draf.items" :key="i" class="tabel__baris">
                        <AutoComplete v-model="item.produk" :suggestions="saranProduk" optionLabel="label"
                            placeholder="Cari produk..." class="w-full" inputClass="w-full" fluid forceSelection
                            @complete="cariProdukUntukForm" @item-select="pilihProduk(item, $event)">
                            <template #option="{ option }">
                                <span :class="{ 'opsi-baru': option.baru }">{{ option.label }}</span>
                            </template>
                        </AutoComplete>
                        <input v-model.number="item.unit_kg" type="number" min="0" step="0.01" class="ka"
                            placeholder="0" />
                        <input v-model.number="item.total_unit" type="number" min="1" step="1" required class="ka"
                            placeholder="0" />
                        <span class="hitung">{{ angka(qty(item)) }}</span>
                        <input v-model.number="item.harga_per_kg" type="number" min="0" step="1" class="ka"
                            placeholder="0" />
                        <span class="hitung hitung--tebal">{{ rp(subtotal(item)) }}</span>
                        <button type="button" class="hapus" :disabled="draf.items.length === 1" aria-label="Hapus item"
                            @click="hapusItem(i)">×</button>
                    </div>
                </div>

                <div class="total">
                    <div class="total__baris total__baris--akhir">
                        <span>Total</span>
                        <span>{{ rp(subtotalSemua) }}</span>
                    </div>
                </div>
            </section>

            <p v-if="pesanError" class="galat">{{ pesanError }}</p>

            <div class="aksi">
                <button type="button" @click="$router.push('/accounting/transaksi/po')" class="tbl">Batal</button>
                <button type="submit" class="tbl tbl--utama" :disabled="sedangProses">
                    {{ sedangProses ? 'Menyimpan...' : 'Terbitkan PO' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AutoComplete from 'primevue/autocomplete'
import { useAuth } from '@/composables/useAuth'
import { bacaError } from '@/utils/error'
import { usePurchaseOrder } from '@/features/accounting/composables/usePurchaseOrder'

const router = useRouter()
const { profil } = useAuth()
const {
    listEntitas, listSupplier, listProduk, sedangProses, pesanError, previewNomor,
    muatDataMaster, muatPreviewNomor, cariProduk, buatProdukBaru, simpanPO
} = usePurchaseOrder()

// POST master/produk/ hanya untuk ADMIN/SUPERVISOR — opsi "buat produk
// baru" disembunyikan untuk role lain, bukan cuma dinonaktifkan.
const bisaBuatProduk = computed(() => ['ADMIN', 'SUPERVISOR'].includes(profil.value?.role))

const hariIni = () => {
    const t = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
    return t.toISOString().slice(0, 10)
}
const rp = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
const angka = (n) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })

const itemKosong = () => ({
    produk: null, unit_kg: null, total_unit: null, harga_per_kg: null,
})

const draf = reactive({
    entitas_id: '',
    suplier_id: '',
    tanggal: hariIni(),
    tanggal_kirim_diminta: '',
    catatan: '',
    items: [itemKosong()],
})

onMounted(async () => {
    await muatDataMaster()
    previewNomor.value = 'Pilih entitas & tanggal'
})

watch([() => draf.entitas_id, () => draf.tanggal], async ([entitas, tanggal]) => {
    if (entitas && tanggal) {
        await muatPreviewNomor(entitas, tanggal)
    } else {
        previewNomor.value = 'Pilih entitas & tanggal'
    }
})

// ── Pencarian produk untuk AutoComplete ──────────────────────────────
const saranProduk = ref([])
const label = (p) => ({ ...p, label: `${p.kode} — ${p.nama}` })

const cariProdukUntukForm = async (event) => {
    const q = event.query?.trim() || ''
    const hasil = (q ? await cariProduk(q) : listProduk.value).map(label)
    const sudahAda = hasil.some(p => p.nama.toLowerCase() === q.toLowerCase())

    saranProduk.value = (bisaBuatProduk.value && q && !sudahAda)
        ? [...hasil, { baru: true, nama: q, label: `+ Buat produk baru: "${q}"` }]
        : hasil
}

const pilihProduk = async (item, event) => {
    const dipilih = event.value
    if (!dipilih?.baru) return

    pesanError.value = ''
    try {
        item.produk = label(await buatProdukBaru(dipilih.nama))
    } catch (err) {
        pesanError.value = bacaError(err, 'Gagal membuat produk baru.')
        item.produk = null
    }
}

const qty = (item) => {
    const kg = Number(item.unit_kg) || 0
    const unit = Number(item.total_unit) || 0
    return kg > 0 ? kg * unit : unit
}
const subtotal = (item) => qty(item) * (Number(item.harga_per_kg) || 0)

const subtotalSemua = computed(() => draf.items.reduce((s, i) => s + subtotal(i), 0))

const tambahItem = () => draf.items.push(itemKosong())
const hapusItem = (i) => {
    if (draf.items.length > 1) draf.items.splice(i, 1)
}

const kirim = async () => {
    pesanError.value = ''
    const kosong = draf.items.some(i => !i.produk?.id || !(qty(i) > 0))
    if (kosong) {
        pesanError.value = 'Setiap item butuh produk dan jumlah unit minimal 1. Unit/kg boleh dikosongkan untuk barang hitungan (pcs).'
        return
    }

    const hasil = await simpanPO({
        entitas_id: draf.entitas_id,
        suplier_id: draf.suplier_id,
        tanggal: draf.tanggal,
        tanggal_kirim_diminta: draf.tanggal_kirim_diminta || null,
        catatan: draf.catatan,
        items: draf.items.map(i => ({
            produk_id: i.produk.id,
            qty_pesan: qty(i),
            harga_per_kg: Number(i.harga_per_kg) || 0,
            satuan: i.produk.satuan_kode,
        })),
    }, true)

    if (hasil.success) {
        alert('Purchase Order berhasil diterbitkan!')
        router.push('/accounting/transaksi/po')
    }
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
    color: #9ca3af;
}

.remah a {
    color: #6b7280;
    text-decoration: none;
}

.remah a:hover {
    color: #111827;
    text-decoration: underline;
}

.judul {
    margin: 0;
    font-size: 1.625rem;
    font-weight: 700;
    letter-spacing: -.02em;
    color: #111827;
}

.lencana-draft {
    background: #e5e7eb;
    color: #374151;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    display: inline-block;
}

.panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 1.25rem;
}

.panel__kepala {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
}

.panel__judul {
    margin: 0;
    font-size: .9375rem;
    font-weight: 700;
    color: #1f2937;
}

.panel__sub {
    margin: .15rem 0 0;
    font-size: .75rem;
    color: #6b7280;
}

.isi {
    padding: 1.25rem;
}

.baris3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.1rem;
}

.baris2 {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
    margin-bottom: 1.1rem;
}

@media (max-width: 760px) {

    .baris3,
    .baris2 {
        grid-template-columns: 1fr;
    }
}

.isian {
    display: block;
}

.isian__label {
    display: block;
    margin-bottom: .4rem;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #6b7280;
}

.isian__label em {
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
}

.isian input,
.isian select {
    width: 100%;
    font-family: inherit;
    font-size: .875rem;
    color: #1f2937;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: .6rem .7rem;
    transition: border-color 0.15s;
}

.isian input:focus,
.isian select:focus {
    outline: none;
    border-color: #0f172a;
    box-shadow: 0 0 0 1px #0f172a;
}

.isian__bantu {
    display: block;
    margin-top: .35rem;
    font-size: .6875rem;
    color: #9ca3af;
}

.nomor {
    padding: .6rem .7rem;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 0.375rem;
    font-size: .875rem;
    font-weight: 600;
    color: #374151;
}

.nomor__kosong {
    color: #9ca3af;
    font-weight: 400;
}

.tabel {
    padding: 0 1.25rem 1rem;
    overflow-x: auto;
}

.tabel__kepala,
.tabel__baris {
    display: grid;
    grid-template-columns: 2.5fr .8fr .8fr .9fr 1.2fr 1.3fr 2rem;
    gap: .5rem;
    align-items: center;
    min-width: 48rem;
}

.tabel__kepala {
    padding: .85rem 0 .5rem;
    font-size: .625rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #9ca3af;
}

.tabel__baris {
    padding: .35rem 0;
}

.ka {
    text-align: right;
}

.tabel__baris input {
    width: 100%;
    font-family: inherit;
    font-size: .8125rem;
    color: #1f2937;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: .5rem .6rem;
}

.tabel__baris input.ka {
    text-align: right;
}

.tabel__baris input:focus {
    outline: none;
    border-color: #0f172a;
}

.hitung {
    text-align: right;
    font-size: .8125rem;
    color: #6b7280;
}

.hitung--tebal {
    color: #111827;
    font-weight: 600;
}

.opsi-baru {
    color: #065f46;
    font-weight: 600;
}

.hapus {
    font-family: inherit;
    font-size: 1.125rem;
    line-height: 1;
    color: #d1d5db;
    background: none;
    border: none;
    cursor: pointer;
    padding: .25rem;
}

.hapus:hover:not(:disabled) {
    color: #ef4444;
}

.hapus:disabled {
    opacity: .3;
    cursor: default;
}

.total {
    padding: 1rem 1.25rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.total__baris {
    display: flex;
    justify-content: space-between;
    padding: .3rem 0;
    font-size: .8125rem;
    color: #6b7280;
    max-width: 20rem;
    margin-left: auto;
}

.total__baris--akhir {
    margin-top: .4rem;
    padding-top: .7rem;
    border-top: 1px solid #e5e7eb;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #111827;
}

.galat {
    margin: 0 0 1rem;
    padding: .7rem .9rem;
    background: #fef2f2;
    border-radius: 0.375rem;
    font-size: .8125rem;
    color: #b91c1c;
    line-height: 1.5;
}

.aksi {
    display: flex;
    gap: .6rem;
    justify-content: flex-end;
    margin-bottom: 2rem;
}

.tbl {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    font-size: .8125rem;
    font-weight: 600;
    color: #374151;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    padding: .6rem 1.25rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s ease;
}

.tbl:hover {
    border-color: #9ca3af;
    background: #f9fafb;
}

.tbl--outline {
    color: #065f46;
    border-color: #e5e7eb;
    background: #ffffff;
}

.tbl--outline:hover {
    border-color: #065f46;
    color: #065f46;
}

.tbl--utama {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
}

.tbl--utama:hover:not(:disabled) {
    background: #1e293b;
    border-color: #1e293b;
}

.tbl--utama:disabled {
    opacity: .5;
    cursor: not-allowed;
}
</style>