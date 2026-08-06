/**
 * router/guards.js
 * =================
 * Proteksi rute berdasarkan Data-Driven UI dari backend.
 * Menggunakan kembalian modul dari /api/auth/login/.
 *
 * Guard ini TIDAK menyimpan aturan peran apa pun. Satu-satunya sumber izin
 * adalah `auth.bisaAkses()`, yang membaca daftar modul kiriman backend.
 * Rute pendaratan juga tidak lagi ditulis di sini — diambil dari katalog
 * lewat `rutePertamaSiap()`, supaya path yang berubah cukup disunting di
 * satu file (pernah kena 404 waktu path akunting bergeser).
 */

import { useAuth } from '@/composables/useAuth'
import { rutePertamaSiap } from '@/config/modules'

export const useGuards = (router) => {
  router.beforeEach((to) => {
    const auth = useAuth()

    if (to.meta?.publik) {
      if (auth.masuk.value && (to.name === 'login' || to.name === 'register')) {
        return rutePertamaSiap(auth.modul.value) ?? { name: 'dashboard' }
      }
      return true
    }

    if (!auth.masuk.value) {
      return { name: 'login', query: { next: to.fullPath } }
    }

    if (to.meta?.modul && !auth.bisaAkses(to.meta.modul)) {
      return { name: 'akses-ditolak', query: { modul: to.meta.modul } }
    }

    return true
  })
}
