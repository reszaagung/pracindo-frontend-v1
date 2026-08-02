import { ref, computed } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

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

    // "Menunggu barang" — cermin PurchaseOrderQuerySet.terbuka() di backend.
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
            // Entitas tidak punya endpoint sendiri (app core, sengaja tidak
            // diekspos) — ikut di GET auth/portal/, sudah tersaring lewat
            // entitas_terlihat() sesuai izin pengguna. Lihat SPEK-BACKEND.md §3.1.
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

    const muatPreviewNomor = async (entitasId, tanggal) => {
        if (!entitasId || !tanggal) {
            previewNomor.value = 'Pilih entitas & tanggal'
            return
        }
        try {
            const { data } = await api.get('akunting/purchase-order/preview-nomor/', {
                params: { entitas: entitasId, tanggal: tanggal }
            })
            previewNomor.value = data.nomor || 'TIDAK TERSEDIA'
        } catch {
            previewNomor.value = 'GAGAL MEMUAT NOMOR'
        }
    }

    /**
     * Pencarian produk untuk AutoComplete — dipanggil ulang tiap ketikan
     * karena listProduk (preload) cuma memuat sebagian katalog (berpaginasi).
     */
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

    /**
     * Buat produk baru langsung dari form PO. Hanya boleh dipanggil kalau
     * pemanggil sudah memastikan role ADMIN/SUPERVISOR — backend menolak
     * role lain dengan 403.
     * ponytail: jenis dipatok BAHAN_BAKU dan satuan dipatok 'kg' (konteks PO
     * pembelian bahan baku). Tambahkan pemilih jenis/satuan kalau kelak PO
     * juga dipakai untuk memesan barang jadi/kemasan.
     */
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
        sedangProses.value = true
        pesanError.value = ''
        try {
            const payloadItems = form.items
                .filter(i => i.produk_id && parseFloat(i.qty_pesan) > 0)
                .map(i => {
                    const produk = listProduk.value.find(p => p.id === i.produk_id)
                    return {
                        produk_id: i.produk_id,
                        qty_pesan: String(i.qty_pesan),
                        harga_per_kg: String(i.harga_per_kg),
                        satuan: i.satuan || produk?.satuan_kode || 'kg',
                    }
                })

            if (!payloadItems.length) {
                pesanError.value = 'Minimal harus ada 1 item dengan produk dan kuantitas lebih dari 0.'
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
        // Form Exports
        listEntitas, listSupplier, listProduk, sedangProses,
        pesanError, previewNomor, muatDataMaster, muatPreviewNomor,
        cariProduk, buatProdukBaru, simpanPO
    }
}
