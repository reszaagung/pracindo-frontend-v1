// src/features/accounting/composables/useNavTransaksi.js

import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useNavTransaksi() {
    const route = useRoute()
    const transaksi = [
        {
            id: 'po',
            label: 'Purchase Order',
            rute: '/accounting/transaction/po',
            ikon: 'pi-shopping-cart',
            activate: true,
            warna: 'bg-teal-500'
        }
    ]

    const aktif = (rute) => {
        return route.path.startsWith(rute)
    }

    return {
        transaksi,
        aktif
    }
}