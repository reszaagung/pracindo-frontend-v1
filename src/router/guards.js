/**
 * router/guards.js
 * =================
 * Proteksi rute berdasarkan Data-Driven UI dari backend.
 * Menggunakan kembalian modul dari /api/auth/login/.
 */

import { useAuth } from '@/composables/useAuth'

export const useGuards = (router) => {
  router.beforeEach((to, from) => {
    const auth = useAuth()

    if (to.meta?.publik) {
      if (auth.masuk.value && (to.name === 'login' || to.name === 'register')) {
        return { name: 'dashboard' }
      }
      return true
    }

    if (!auth.masuk.value) {
      return { name: 'login', query: { next: to.fullPath } }
    }


    if (to.meta?.modul && !auth.bisaAkses(to.meta.modul)) {
      alert('Akses Ditolak: Anda tidak memiliki wewenang untuk membuka modul ini.')
      return from.name ? false : { name: 'dashboard' }
    }

    return true
  })
}