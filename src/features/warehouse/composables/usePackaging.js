import { ref, reactive } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function usePackaging() {
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref(null)
    const feedback = ref(null)
    const wipList = ref([]) // Akan berisi daftar tangki terpakai
    const produkList = ref([])
    const akunList = ref([])

    const form = reactive({
        wip_id: '', // Di backend, ini akan merujuk pada ID Tangki (BatchTangki)
        cairan_dipakai: null,
        pemilik_id: '',
        produk_id: '',
        qty_unit: 0,
        no_batch_fg: ''
    })

    const muatDataAwal = async () => {
        isLoading.value = true
        error.value = null
        try {
            // [UBAH]: Mengambil data dari inventory/tanki/ alih-alih wip-tersedia/
            const [resTanki, resProduk, resAkun] = await Promise.all([
                api.get('inventory/tanki/'),
                api.get('produksi/produk/'),
                api.get('entitas/akun/')
            ])

            const semuaTanki = resTanki.data?.results || resTanki.data || []

            // [UBAH]: Membangun Array Dropdown khusus tangki yang berisi adonan
            wipList.value = semuaTanki
                .filter(t => t.aktif && t.isi && t.isi.length > 0)
                .map(t => {
                    // Kalkulasi info isi tangki untuk label UI
                    const namaAdonan = t.isi.map(i => i.nama_bahan).join(' + ')
                    const sesiNomor = t.isi[0].sesi_asal_nomor || 'Murni Fisik'
                    const totalQty = t.isi.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)

                    return {
                        id: t.id,
                        label: `${t.nama} (${sesiNomor}) - ${namaAdonan} [Stok: ${totalQty} KG]`,
                        maks_qty: totalQty
                    }
                })

            produkList.value = resProduk.data?.results || resProduk.data || []
            akunList.value = resAkun.data?.results || resAkun.data || []
        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat data referensi packaging.')
        } finally {
            isLoading.value = false
        }
    }

    const resetForm = () => {
        form.wip_id = ''
        form.cairan_dipakai = null
        form.pemilik_id = ''
        form.produk_id = ''
        form.qty_unit = 0
        form.no_batch_fg = ''
        error.value = null
        feedback.value = null
    }

    const catatPackaging = async () => {
        isSaving.value = true
        error.value = null
        feedback.value = null

        try {
            const payload = {
                wip_id: form.wip_id, // Berisi ID Tangki
                cairan_dipakai: form.cairan_dipakai,
                pemilik_id: form.pemilik_id,
                produk_id: form.produk_id,
                qty_unit: form.qty_unit,
                no_batch_fg: form.no_batch_fg
            }

            await api.post('inventory/barang-jadi/pack-wip/', payload)
            feedback.value = { tipe: 'ok', teks: 'Packaging berhasil dicatat dan stok barang jadi bertambah.' }
            await muatDataAwal()

            form.cairan_dipakai = null
            form.qty_unit = 0
            form.no_batch_fg = ''

        } catch (err) {
            const msg = bacaError(err, 'Gagal mencatat packaging.')
            error.value = msg
            feedback.value = { tipe: 'galat', teks: msg }
        } finally {
            isSaving.value = false
        }
    }

    return {
        isLoading,
        isSaving,
        feedback,
        error,
        form,
        wipList,
        produkList,
        akunList,
        muatDataAwal,
        resetForm,
        catatPackaging
    }
}