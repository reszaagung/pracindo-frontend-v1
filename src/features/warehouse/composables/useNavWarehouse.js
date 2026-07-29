/**
 * src/features/warehouse/composables/useNavWarehouse.js
 * =====================================================
 * Konfigurasi menu sidebar untuk Ruang Kerja Gudang.
 * Difokuskan murni pada 4 operasi utama gudang.
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { ROLE } from '@/config/modules'

export const MENU_WAREHOUSE = [
    {
        id: 'wh-packaging',
        label: 'Packaging',
        ringkas: 'Pengemasan barang jadi',
        ikon: 'pi-box',
        rute: '/warehouse/packaging',
        roles: [ROLE.GUDANG, ROLE.PRODUKSI],
        activate: true,
    },
    {
        id: 'wh-received',
        label: 'Received',
        ringkas: 'Penerimaan barang',
        ikon: 'pi-download',
        rute: '/warehouse/received',
        roles: [ROLE.GUDANG],
        activate: true,
    },
    {
        id: 'wh-received-package',
        label: 'Received Package',
        ringkas: 'Penerimaan kemasan',
        ikon: 'pi-check-square',
        rute: '/warehouse/received-package',
        roles: [ROLE.GUDANG],
        activate: true,
    },
    {
        id: 'wh-retur',
        label: 'Retur',
        ringkas: 'Pengembalian barang',
        ikon: 'pi-sync',
        rute: '/warehouse/retur',
        roles: [ROLE.GUDANG],
        activate: true,
    }
]

export function useNavWarehouse() {
    const route = useRoute()
    const { role, isSupervisor } = useAuth()

    /**
     * Filter menu berdasarkan hak akses pengguna yang sedang login.
     */
    const menu = computed(() =>
        MENU_WAREHOUSE.filter(m =>
            isSupervisor.value || !m.roles?.length || m.roles.includes(role.value)
        )
    )

    /**
     * Logika agar menu sidebar menyala sesuai URL saat ini.
     * Menggunakan exact match atau sub-path match untuk mencegah false positive.
     */
    const aktif = (item_rute) => {
        return route.path === item_rute || route.path.startsWith(`${item_rute}/`)
    }

    /**
     * Mengambil data item menu yang sedang aktif saat ini.
     */
    const sekarang = computed(() => MENU_WAREHOUSE.find(m => aktif(m.rute)) ?? null)

    return {
        menu,
        aktif,
        sekarang
    }
}