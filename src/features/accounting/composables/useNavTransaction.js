import { useRoute } from 'vue-router'

export function useNavTransaksi() {
    const route = useRoute()

    const transaksi = [
        {
            id: 'po',
            label: 'Purchase Order',
            ikon: 'pi-file-edit',
            rute: '/accounting/transaksi/po',
            activate: true
        },
        {
            id: 'pembelian',
            label: 'Pembelian Langsung',
            ikon: 'pi-shop',
            rute: '/accounting/transaksi/pembelian',
            activate: false
        },
        {
            id: 'pembayaran',
            label: 'Pembayaran',
            ikon: 'pi-wallet',
            rute: '/accounting/transaksi/pembayaran',
            activate: false
        }
    ]

    const aktif = (ruteMenu) => {
        return route.path.startsWith(ruteMenu)
    }

    return {
        transaksi,
        aktif
    }
}