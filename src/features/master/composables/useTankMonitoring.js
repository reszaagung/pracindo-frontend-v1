import { ref } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function useTankMonitoring() {
    const isLoading = ref(false)
    const error = ref(null)
    const daftarTanki = ref([])

    const muatTanki = async () => {
        isLoading.value = true
        error.value = null
        try {
            const res = await api.get('inventory/tanki/')
            const rawData = res.data?.results || res.data || []

            daftarTanki.value = rawData.map(t => {
                const isTerpakai = t.isi && t.isi.length > 0
                let sesiNomor = null
                if (isTerpakai) {
                    const isiPertama = t.isi[0]
                    sesiNomor = isiPertama.no_batch
                        || isiPertama.sesi_asal_nomor
                        || 'Adonan WIP / Murni Fisik'
                }

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
            error.value = bacaError(err, 'Gagal memuat status tangki dari server.')
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        daftarTanki,
        muatTanki
    }
}