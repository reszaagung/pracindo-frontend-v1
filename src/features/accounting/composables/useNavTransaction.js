import { useRoute } from 'vue-router'

export function useNavTransaksi() {
    const route = useRoute()

    const transaksi = [
        {
            id: 'po',
            label: 'Purchase Order',
            ikon: 'pi-file-edit',
            rute: '/accounting/input/po',
            activate: true
        },
        {
            id: 'pembelian',
            label: 'Pembelian Langsung',
            ikon: 'pi-shop',
            rute: '/accounting/input/pembelian',
            activate: false
        },
        {
            id: 'pembayaran',
            label: 'Pembayaran',
            ikon: 'pi-wallet',
            rute: '/accounting/input/pembayaran',
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