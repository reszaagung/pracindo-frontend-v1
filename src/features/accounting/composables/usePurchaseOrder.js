import { ref, computed } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

// Helper bulan romawi (diletakkan di luar fungsi agar lebih hemat memori)
const getBulanRomawi = (dateObj) => {
    const romawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    return romawi[dateObj.getMonth()]
}

export function usePurchaseOrder() {
    // ==========================================
    // STATE UNTUK DAFTAR PO (LIST VIEW)
    // ==========================================
    const daftarPO = ref([])
    const isLoadingDaftar = ref(false)
    const cari = ref('')
    const saringStatus = ref('semua')

    // ==========================================
    // STATE UNTUK FORM PO (CREATE VIEW)
    // ==========================================
    const listEntitas = ref([])
    const listSupplier = ref([])
    const listProduk = ref([])
    const listSatuan = ref([])
    const sedangProses = ref(false)
    const pesanError = ref('')
    const previewNomor = ref('')

    // State baru untuk status periode
    const periodeDitutup = ref(false)

    // ==========================================
    // LOGIKA DAFTAR PO
    // ==========================================
    const muatDaftarPO = async () => {
        isLoadingDaftar.value = true
        try {
            const { data } = await api.get('akunting/purchase-order/')
            daftarPO.value = data.results || data || []
        } catch (err) {
            console.error('Gagal memuat daftar PO:', bacaError(err))
        } finally {
            isLoadingDaftar.value = false
        }
    }

    const tampil = computed(() => {
        const q = cari.value.trim().toLowerCase()
        return daftarPO.value
            .filter(po => saringStatus.value === 'semua' || po.status === saringStatus.value)
            .filter(po => !q
                || po.no_po?.toLowerCase().includes(q)
                || po.suplier_nama?.toLowerCase().includes(q))
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    })

    const belumDiterima = computed(() =>
        daftarPO.value.filter(po => ['TERKIRIM', 'SEBAGIAN'].includes(po.status))
    )

    const draftCount = computed(() =>
        daftarPO.value.filter(po => po.status === 'DRAFT').length
    )

    const totalBulanIni = computed(() => {
        const kini = new Date()
        return daftarPO.value
            .filter(po => {
                const d = new Date(po.tanggal)
                return d.getMonth() === kini.getMonth() && d.getFullYear() === kini.getFullYear()
            })
            .reduce((s, po) => s + Number(po.total_nilai ?? 0), 0)
    })

    // ==========================================
    // LOGIKA FORM PO
    // ==========================================
    const muatDataMaster = async () => {
        sedangProses.value = true
        pesanError.value = ''
        try {
            const [resPortal, resSupplier, resProduk] = await Promise.all([
                api.get('auth/portal/'),
                api.get('master/suplier/', { params: { ringkas: 1, aktif: true } }),
                api.get('master/produk/', { params: { ringkas: 1, aktif: true, jenis: 'BAHAN_BAKU' } })
            ])
            listEntitas.value = resPortal.data.entitas || []
            listSupplier.value = resSupplier.data.results || resSupplier.data || []
            listProduk.value = resProduk.data.results || resProduk.data || []
        } catch (err) {
            pesanError.value = bacaError(err, 'Gagal memuat data master (Entitas/Suplier/Produk).')
        } finally {
            sedangProses.value = false
        }
    }

    /**
     * Preview nomor PO dirakit di frontend.
     */
    const muatPreviewNomor = async (entitasId, tanggal) => {
        if (!entitasId || !tanggal) {
            previewNomor.value = 'Pilih entitas & tanggal'
            return
        }

        const entitas = listEntitas.value.find(e => e.id === entitasId)
        const kodeEntitas = entitas ? entitas.kode.toUpperCase() : ''

        const prefixMap = {
            'PT': 'PCJM',
            'CV': 'CV',
            'MARSINI': 'MRS',
            'AGUS': 'AGS'
        }

        const kodePrefix = prefixMap[kodeEntitas] || kodeEntitas || 'PCJM'
        const dateObj = new Date(tanggal)

        try {
            const response = await api.get('akunting/purchase-order/generate-id/', {
                params: { entitas: entitasId, tanggal: tanggal }
            })

            const nomorUrut = response.data?.urutan || '000'
            const tahun = dateObj.getFullYear()
            const bulanRomawi = getBulanRomawi(dateObj)

            previewNomor.value = `PO/${kodePrefix}/${tahun}/${bulanRomawi}/${nomorUrut}`
        } catch (err) {
            console.error(`Gagal men-generate ID PO untuk entitas ID ${entitasId}:`, err)
            const tahun = dateObj.getFullYear()
            const bulanRomawi = getBulanRomawi(dateObj)
            previewNomor.value = `PO/${kodePrefix}/${tahun}/${bulanRomawi}/XXX`
        }
    }

    /**
     * Mengecek status periode akuntansi berdasarkan Entitas dan Tanggal
     */
    const cekStatusPeriode = async (entitasId, tanggal) => {
        if (!entitasId || !tanggal) {
            periodeDitutup.value = false
            return
        }

        try {
            const { data } = await api.get('core/periode/status/', {
                params: { entitas: entitasId, tanggal: tanggal }
            })

            // Sesuaikan properti response dengan API aktual (misal: data.status, data.is_closed, dll)
            const status = data.status || data.kondisi
            periodeDitutup.value = (status === 'DITUTUP' || status === 'tutup' || data.is_closed === true)

            if (periodeDitutup.value) {
                pesanError.value = '' // Bersihkan pesan error lain agar UI fokus ke peringatan periode
            }
        } catch (err) {
            console.error('Gagal mengecek status periode:', err)
            // Fallback: anggap terbuka jika API gagal, agar form tidak terblokir permanen oleh error jaringan
            periodeDitutup.value = false
        }
    }

    const cariProduk = async (query) => {
        try {
            const { data } = await api.get('master/produk/', {
                params: { ringkas: 1, aktif: true, jenis: 'BAHAN_BAKU', search: query }
            })
            return data.results || data || []
        } catch {
            return []
        }
    }

    const buatProdukBaru = async (nama) => {
        const kode = `${nama.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 16)}-${Date.now().toString(36).slice(-4).toUpperCase()}`

        if (!listSatuan.value.length) {
            const { data } = await api.get('master/satuan/')
            listSatuan.value = data.results || data || []
        }
        const satuanKg = listSatuan.value.find(s => s.kode === 'kg') || listSatuan.value[0]
        if (!satuanKg) throw new Error('Belum ada data satuan di master.')

        const { data: produk } = await api.post('master/produk/', {
            kode,
            nama: nama.trim(),
            jenis: 'BAHAN_BAKU',
            satuan: satuanKg.id,
        })
        return { id: produk.id, kode: produk.kode, nama: produk.nama, satuan_kode: produk.satuan_kode, jenis: produk.jenis }
    }

    const simpanPO = async (form, isKirim = false) => {
        // Validasi ekstra di level state
        if (periodeDitutup.value) {
            pesanError.value = 'Tidak dapat menyimpan PO karena periode telah ditutup.'
            return { success: false, message: pesanError.value }
        }

        sedangProses.value = true
        pesanError.value = ''
        try {
            const payloadItems = form.items
                .filter(i => i.produk_id && parseFloat(i.qty_pesan) > 0)
                .map(i => ({
                    produk_id: i.produk_id,
                    qty_pesan: String(i.qty_pesan),
                    harga_per_kg: String(i.harga_per_kg || 0),
                    satuan: i.satuan || 'kg',
                }))

            if (!payloadItems.length) {
                pesanError.value = 'Minimal harus ada 1 item dengan produk dan Qty lebih dari 0.'
                return { success: false, message: pesanError.value }
            }

            const payload = {
                entitas_id: form.entitas_id,
                suplier_id: form.suplier_id,
                tanggal: form.tanggal,
                tanggal_kirim_diminta: form.tanggal_kirim_diminta || null,
                catatan: form.catatan,
                items: payloadItems
            }

            const res = await api.post('akunting/purchase-order/', payload)
            const idPO = res.data.id

            if (isKirim && idPO) {
                await api.post(`akunting/purchase-order/${idPO}/kirim/`)
            }

            await muatDaftarPO()
            return { success: true, data: res.data }

        } catch (err) {
            pesanError.value = bacaError(err, 'Gagal menyimpan PO.')
            return { success: false, message: pesanError.value }
        } finally {
            sedangProses.value = false
        }
    }

    return {
        // List Exports
        daftarPO, isLoadingDaftar, cari, saringStatus, tampil,
        belumDiterima, draftCount, totalBulanIni, muatDaftarPO,
        listEntitas, listSupplier, listProduk, sedangProses,
        pesanError, previewNomor, muatDataMaster, muatPreviewNomor,
        cariProduk, buatProdukBaru, simpanPO,
        periodeDitutup, cekStatusPeriode
    }
}