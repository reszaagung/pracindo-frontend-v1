import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/utils/api'
// paymentHelper.js sudah dihapus — utils/format.js yang menggantikannya, dan
// statusTagihan() adalah satu-satunya bagian calculatePOFinance yang layak
// dipertahankan (alasannya di kepala utils/format.js).
import { statusTagihan } from '@/utils/format'

export function useDocument() {
    const isLoading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const uploadForm = reactive({
        po_reference: '',
        document_type: 'Invoice',
        document_number: '',
        partner_name: '',
        upload_date: new Date().toISOString().split('T')[0]
    })

    const auditGroupedDocs = ref([])

    const fetchDocuments = async () => {
        isLoading.value = true
        try {
            // Asumsi: Backend sekarang mengirim data PO sekaligus status dokumennya
            // Sesuaikan endpoint ini dengan spesifikasi API backend Anda
            const response = await api.get('purchase-order/')

            let realPOs = Array.isArray(response.data) ? response.data
                : (response.data?.results || response.data?.data || [response.data])

            const mappedData = realPOs.map(po => {
                const poId = po.id_transaksi || po.po_no || 'UNKNOWN_PO'

                const financeStatus = statusTagihan(po) || 'Pending'

                // AMBIL DARI BACKEND, bukan dari LocalStorage.
                // Asumsi: backend mengirim nested object `dokumen_audit`
                let savedFiles = po.dokumen_audit || {
                    invoice: { exists: false, doc_no: '-', date: '-' },
                    faktur_pajak: { exists: false, doc_no: '-', date: '-' },
                    surat_jalan: { exists: false, doc_no: '-', date: '-' }
                }

                let namaPartner = po.nama_supplier || po.supplier?.nama_suplier || '-'

                return {
                    po_id: poId,
                    partner: namaPartner,
                    date: po.tanggal || '-',
                    files: savedFiles,
                    payment_status: financeStatus
                }
            })

            auditGroupedDocs.value = mappedData
        } catch (error) {
            console.error("Gagal mengambil data PO dari server:", error)
        } finally {
            isLoading.value = false
        }
    }

    const getComplianceStats = (files) => {
        if (!files) return { count: 0, percentage: 0, isComplete: false }

        const totalRequired = 3
        let uploadedCount = 0

        if (files.invoice?.exists) uploadedCount++
        if (files.faktur_pajak?.exists) uploadedCount++
        if (files.surat_jalan?.exists) uploadedCount++

        return {
            count: uploadedCount,
            percentage: Math.round((uploadedCount / totalRequired) * 100),
            isComplete: uploadedCount === totalRequired
        }
    }

    const totalTransactions = computed(() => auditGroupedDocs.value.length)
    const fullyCompliantCount = computed(() => auditGroupedDocs.value.filter(item => getComplianceStats(item.files).isComplete).length)
    const missingDocsCount = computed(() => totalTransactions.value - fullyCompliantCount.value)

    const filteredAuditData = computed(() => {
        return auditGroupedDocs.value.filter(item => {
            const stats = getComplianceStats(item.files)
            const matchFilter = statusFilter.value === 'all' ||
                (statusFilter.value === 'lengkap' && stats.isComplete) ||
                (statusFilter.value === 'tidak_lengkap' && !stats.isComplete)

            const safePoId = String(item.po_id || '').toLowerCase()
            const safePartner = String(item.partner || '').toLowerCase()
            const safeQuery = String(searchQuery.value || '').toLowerCase()

            const matchSearch = safePoId.includes(safeQuery) || safePartner.includes(safeQuery)

            return matchFilter && matchSearch
        })
    })

    // FUNGSI INI KINI MENEMBAK API BACKEND
    const handleUploadDocument = async () => {
        if (!uploadForm.po_reference || !uploadForm.document_number) return false

        isLoading.value = true
        try {
            // Sesuaikan endpoint API ini dengan Django Anda
            await api.post('dokumen-audit/', {
                po_reference: uploadForm.po_reference,
                document_type: uploadForm.document_type,
                document_number: uploadForm.document_number,
                upload_date: uploadForm.upload_date
            })

            // Refresh Single Source of Truth dari backend setelah berhasil
            await fetchDocuments()
            return true
        } catch (error) {
            console.error("Gagal upload dokumen:", error)
            alert("Gagal menyimpan dokumen ke server.")
            return false
        } finally {
            isLoading.value = false
        }
    }

    // FUNGSI INI KINI MENEMBAK API BACKEND
    const hapusDokumen = async (item, type) => {
        if (confirm(`Hapus dokumen ${type} ini secara permanen dari server?`)) {
            isLoading.value = true
            try {
                // Sesuaikan endpoint API ini dengan Django Anda
                await api.delete(`dokumen-audit/${item.po_id}/`, {
                    data: { document_type: type }
                })

                await fetchDocuments() // Refresh data dari backend
            } catch (error) {
                console.error("Gagal menghapus dokumen:", error)
                alert("Gagal menghapus dokumen dari server.")
            } finally {
                isLoading.value = false
            }
        }
    }

    onMounted(() => {
        fetchDocuments()
    })

    return {
        isLoading,
        searchQuery,
        statusFilter,
        uploadForm,
        auditGroupedDocs,
        totalTransactions,
        fullyCompliantCount,
        missingDocsCount,
        filteredAuditData,
        getComplianceStats,
        handleUploadDocument,
        hapusDokumen,
        fetchDocuments
    }
}