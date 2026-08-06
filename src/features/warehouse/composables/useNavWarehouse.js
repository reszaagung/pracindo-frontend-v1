import { useRoute } from 'vue-router'

export function useNavWarehouse() {
    const route = useRoute()

    // Daftar menu untuk Sidebar Gudang
    const menu = [
        {
            id: 'penerimaan',
            label: 'Penerimaan Barang',
            ikon: 'pi-box',
            rute: '/warehouse',
            activate: true
        },
        {
            id: 'selisih',
            label: 'Laporan Selisih',
            ikon: 'pi-exclamation-triangle',
            rute: '/warehouse/selisih',
            activate: true
        },
        {
            id: 'packaging',
            label: 'Packaging & Hasil',
            ikon: 'pi-gift',
            rute: '/warehouse/packaging', // Pastikan rute ini ada di router/index.js Anda
            activate: true
        }
    ]

    const aktif = (ruteTujuan) => {
        if (!route) return false
        // Sorot menu jika sedang di rute tersebut atau sub-rutenya
        if (ruteTujuan === '/warehouse') {
            return route.path === '/warehouse' || route.path.startsWith('/warehouse/penerimaan')
        }
        return route.path.startsWith(ruteTujuan)
    }

    return {
        menu,
        aktif
    }
}