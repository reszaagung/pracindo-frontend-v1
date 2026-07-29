import { ref } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function useProduksi() {
    const isLoading = ref(false)
    const isMenyimpan = ref(false)
    const error = ref(null)

    const tankiList = ref([])
    const tankiTujuanList = ref([])
    const bahanList = ref([])
    const daftarTanki = ref([])

    const muatReferensi = async () => {
        isLoading.value = true
        error.value = null
        try {
            // Membaca data referensi tangki dari inventory dan bahan baku dari saldo stock-raw
            const [resTanki, resBahan] = await Promise.all([
                api.get('inventory/tanki/'),
                api.get('stock-raw/saldo/')
            ])

            const semuaTanki = resTanki.data?.results || resTanki.data || []
            tankiList.value = semuaTanki.filter(t => t.aktif && ['MIXING', 'BLENDING'].includes(t.jenis))
            tankiTujuanList.value = semuaTanki.filter(t => t.aktif)

            const semuaBahan = resBahan.data?.results || resBahan.data || []
            // Ekstrak nama bahan baku yang unik dari saldo
            const namaBahanUnik = [...new Set(semuaBahan.map(b => b.nama_bahan))]
            bahanList.value = namaBahanUnik.map(nama => ({ id: nama, nama_bahan: nama }))

        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat data referensi (Tangki & Bahan Baku).')
        } finally {
            isLoading.value = false
        }
    }

    const simpanPemakaianBahan = async (payload) => {
        isMenyimpan.value = true
        error.value = null
        try {
            const response = await api.post('produksi/sesi/input-bahan/', payload)
            return { success: true, data: response.data }
        } catch (err) {
            const msg = bacaError(err, 'Gagal mencatat data produksi ke sistem.')
            error.value = msg
            return { success: false, message: msg }
        } finally {
            isMenyimpan.value = false
        }
    }

    const muatTanki = async () => {
        isLoading.value = true
        error.value = null
        try {
            const res = await api.get('inventory/tanki/')
            const rawData = res.data?.results || res.data || []

            daftarTanki.value = rawData.map(t => {
                const isTerpakai = t.isi && t.isi.length > 0

                const sesiNomor = isTerpakai && t.isi[0].sesi_asal_nomor
                    ? t.isi[0].sesi_asal_nomor
                    : (isTerpakai ? 'Adonan WIP / Murni Fisik' : null)

                const namaProduk = isTerpakai
                    ? t.isi.map(i => i.nama_bahan).join(' + ')
                    : ''

                return {
                    ...t,
                    status: isTerpakai ? 'TERPAKAI' : 'KOSONG',
                    sesi_nomor: sesiNomor,
                    nama_produk: namaProduk
                }
            })
        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat status tangki.')
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        isMenyimpan,
        error,
        tankiList,
        tankiTujuanList,
        bahanList,
        daftarTanki,
        muatReferensi,
        simpanPemakaianBahan,
        muatTanki
    }
}