import { ref } from 'vue'
import api from '@/utils/api'
import { bacaError } from '@/utils/error'

export function usePurchaseOrder() {
    // State Master Data
    const listEntitas = ref([])
    const listSupplier = ref([])
    const listProduk = ref([])

    // State UI
    const sedangProses = ref(false)
    const pesanError = ref('')

    const muatDataMaster = async () => {
        sedangProses.value = true
        pesanError.value = ''
        try {
            const [resEntitas, resSupplier, resProduk] = await Promise.all([
                api.get('core/entitas/'),
                api.get('master/supplier/'),
                api.get('master/produk/')
            ])
            listEntitas.value = resEntitas.data
            listSupplier.value = resSupplier.data
            listProduk.value = resProduk.data
        } catch (err) {
            pesanError.value = bacaError(err, 'Gagal memuat data master formulir.')
        } finally {
            sedangProses.value = false
        }
    }

    /**
     * Menyimpan PO ke Lapis 4 (Akunting)
     */
    const simpanPO = async (formState) => {
        sedangProses.value = true
        pesanError.value = ''

        try {
            const payload = {
                entitas: formState.entitas_id,
                supplier: formState.supplier_id,
                tanggal: formState.tanggal,
                tanggal_kedatangan: formState.tanggal_kedatangan,
                catatan: formState.catatan,
                items: formState.items.map(item => ({
                    produk: item.produk_id,
                    qty: item.qty,
                    harga_satuan: item.harga_satuan
                }))
            }

            const { data } = await api.post('akunting/purchase-order/', payload)
            return { success: true, data }
        } catch (err) {
            const pesan = bacaError(err, 'Gagal menyimpan Purchase Order.')
            pesanError.value = pesan
            return { success: false, message: pesan }
        } finally {
            sedangProses.value = false
        }
    }

    return {
        listEntitas, listSupplier, listProduk,
        sedangProses, pesanError,
        muatDataMaster, simpanPO
    }
}