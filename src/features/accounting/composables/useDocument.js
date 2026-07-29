/**
 * src/features/accounting/composables/useDocument.js
 * ===================================================
 * Kontrol kelengkapan dokumen PO — TERSAMBUNG API. 
 *
 * ALUR AKUNTANSI ERP:
 * Layar audit ini HANYA memunculkan PO yang barangnya sudah diterima 
 * oleh tim Gudang (Goods Receipt). PO yang belum tiba tidak akan 
 * masuk ke dalam antrean audit dokumen.
 */

import { reactive, ref, computed } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

const WAJIB = [
    { key: 'invoice', jenis: 'INVOICE', label: 'Invoice' },
    { key: 'faktur_pajak', jenis: 'FAKTUR', label: 'Faktur Pajak' },
    { key: 'surat_jalan', jenis: 'SURAT_JALAN', label: 'Surat Jalan' },
]

const LABEL_KE_JENIS = {
    'Invoice': 'INVOICE',
    'Faktur Pajak': 'FAKTUR',
    'Surat Jalan': 'SURAT_JALAN',
}

const slotKosong = () => ({ exists: false, doc_no: '', file: null, id: null, oleh: '', pada: null })

export function useDocument() {
    const daftarPO = ref([])
    const daftarLampiran = ref([])
    const isLoading = ref(false)
    const sedangSimpan = ref(false)
    const error = ref(null)

    const searchQuery = ref('')
    const statusFilter = ref('all')

    const uploadForm = reactive({
        po_id: null,
        po_reference: '',
        partner_name: '',
        document_type: 'Invoice',
        document_number: '',
        file: null,
    })

    /** 
     * Fungsi pengekstrak array agar kebal terhadap berbagai variasi struktur 
     * JSON dari backend Django (menghindari error .filter is not a function).
     */
    const ekstrakArray = (responseData) => {
        if (!responseData) return []
        if (Array.isArray(responseData)) return responseData
        if (Array.isArray(responseData.results)) return responseData.results
        if (Array.isArray(responseData.data)) return responseData.data
        return [responseData]
    }

    const muat = async () => {
        isLoading.value = true
        error.value = null
        try {
            const [po, lampiran] = await Promise.all([
                api.get('purchase-order/'),
                api.get('dokumen/lampiran/'),
            ])

            // Ekstrak data dengan aman
            daftarPO.value = ekstrakArray(po.data)
            daftarLampiran.value = ekstrakArray(lampiran.data)

        } catch (err) {
            error.value = bacaError(err, 'Gagal memuat data dokumen.')
        } finally {
            isLoading.value = false
        }
    }

    const lampiranPerPO = computed(() => {
        const peta = new Map()
        for (const l of daftarLampiran.value) {
            if (!l.purchase_order) continue
            if (!peta.has(l.purchase_order)) peta.set(l.purchase_order, new Map())
            const per = peta.get(l.purchase_order)
            if (!per.has(l.jenis)) per.set(l.jenis, l)
        }
        return peta
    })

    const filesUntuk = (poId) => {
        const files = { invoice: slotKosong(), faktur_pajak: slotKosong(), surat_jalan: slotKosong() }
        const per = lampiranPerPO.value.get(poId)
        if (!per) return files
        for (const w of WAJIB) {
            const l = per.get(w.jenis)
            if (l) {
                files[w.key] = {
                    exists: true,
                    doc_no: l.nomor_dokumen || '(tanpa nomor)',
                    file: l.file,
                    id: l.id,
                    oleh: l.diunggah_oleh_username || '',
                    pada: l.diunggah_pada,
                }
            }
        }
        return files
    }

    const getComplianceStats = (files) => {
        const count = WAJIB.filter(w => files?.[w.key]?.exists).length
        return { count, percentage: Math.round((count / WAJIB.length) * 100), isComplete: count === WAJIB.length }
    }

    const auditData = computed(() =>
        daftarPO.value
            // Filter Mutlak: Pastikan PO aktif & barang BUKAN "belum diterima"
            .filter(po => po.aktif !== false && String(po.status_penerimaan || '').toUpperCase() !== 'BELUM_DITERIMA')
            .map(po => {
                const files = filesUntuk(po.id)
                return {
                    // Penambahan fallback yang luas jika nama kolom serializer berubah-ubah
                    po_id: po.nomor || po.po_no || po.id_transaksi || '—',
                    id: po.id,
                    partner: po.suplier_detail?.nama || po.nama_supplier || po.supplier?.nama_suplier || '—',
                    date: po.tanggal,
                    status_penerimaan: po.status_penerimaan,
                    payment_status: po.status_pembayaran,
                    files,
                    lengkap: getComplianceStats(files).isComplete,
                }
            }),
    )

    const filteredAuditData = computed(() => {
        const q = searchQuery.value.trim().toLowerCase()
        return auditData.value
            .filter(x => {
                if (statusFilter.value === 'lengkap') return x.lengkap
                if (statusFilter.value === 'tidak_lengkap') return !x.lengkap
                return true
            })
            .filter(x => !q
                || x.po_id.toLowerCase().includes(q)
                || x.partner.toLowerCase().includes(q))
    })

    const totalTransactions = computed(() => auditData.value.length)
    const fullyCompliantCount = computed(() => auditData.value.filter(x => x.lengkap).length)
    const missingDocsCount = computed(() => auditData.value.filter(x => !x.lengkap).length)

    const siapkanUpload = (row, docLabel = 'Invoice') => {
        uploadForm.po_id = row.id
        uploadForm.po_reference = row.po_id
        uploadForm.partner_name = row.partner
        uploadForm.document_type = docLabel
        uploadForm.document_number = ''
        uploadForm.file = null
        error.value = null
    }

    const setFile = (fileList) => {
        uploadForm.file = fileList && fileList.length ? fileList[0] : null
    }

    const handleUploadDocument = async () => {
        if (!uploadForm.po_id) return { success: false, message: 'PO tidak dikenali.' }
        if (!uploadForm.file) return { success: false, message: 'Pilih berkas dokumen dulu.' }

        const jenis = LABEL_KE_JENIS[uploadForm.document_type]
        if (!jenis) return { success: false, message: 'Jenis dokumen tidak dikenal.' }

        sedangSimpan.value = true
        try {
            const fd = new FormData()
            fd.append('purchase_order', uploadForm.po_id)
            fd.append('jenis', jenis)
            fd.append('file', uploadForm.file)
            if (uploadForm.document_number) fd.append('nomor_dokumen', uploadForm.document_number)

            await api.post('dokumen/lampiran/', fd)
            await muat()
            return { success: true }
        } catch (err) {
            const pesan = bacaError(err, 'Gagal mengunggah dokumen.')
            error.value = pesan
            return { success: false, message: pesan }
        } finally {
            sedangSimpan.value = false
        }
    }

    return {
        isLoading, sedangSimpan, error,
        searchQuery, statusFilter, uploadForm,
        filteredAuditData, totalTransactions, fullyCompliantCount, missingDocsCount,
        getComplianceStats, muat, siapkanUpload, setFile, handleUploadDocument,
        WAJIB, LABEL_KE_JENIS,
    }
}