// src/composables/useAuth.js
import { ref, computed } from 'vue'
import api from '@/utils/api'
import { MODUL as MODUL_KATALOG } from '@/config/modules' // <-- Impor Katalog UI

// STATE LEVEL MODUL: Dideklarasikan di luar fungsi agar semua 
// komponen yang memanggil useAuth() merujuk ke memori yang sama.
const token = ref(localStorage.getItem('token') || null)
const profil = ref(JSON.parse(localStorage.getItem('profil') || 'null'))
const modul = ref(JSON.parse(localStorage.getItem('modul') || '[]'))

const sedangProses = ref(false)

// Label tampilan saja — BUKAN aturan akses. Otorisasi modul selalu datang
// dari backend lewat `modul`/bisaAkses, tidak pernah dari peta ini.
const PERAN_LABEL = {
    SUPERVISOR: 'Supervisor',
    STAFF: 'Staf',
    PRODUKSI: 'Produksi',
    GUDANG: 'Gudang',
    SALES: 'Sales',
    AKUNTAN: 'AKUNTAN',
}

export function useAuth() {
    const masuk = computed(() => !!token.value)

    // Router guard memanggil fungsi ini untuk mengecek izin akses rute
    const bisaAkses = (kode) => modul.value.some((m) => m.kode === kode)

    // ProfilSerializer (staff_user/serializers.py) sudah mengirim `nama` dan
    // `entitas_default_kode` langsung sebagai field flat — bukan nested di
    // `akun`, dan `nama_lengkap` sendiri TIDAK ada di respons. role_display
    // tidak dikirim backend sama sekali, jadi diturunkan lokal dari role.
    const kartu = computed(() => profil.value && {
        nama: profil.value.nama || profil.value.username || 'Pengguna',
        role: profil.value.role,
        role_display: PERAN_LABEL[profil.value.role] || profil.value.role || 'Staf',
        entitas_default_kode: profil.value.entitas_default_kode ?? null,
    })

    const simpan = (data) => {
        token.value = data.token
        profil.value = data.profil

        // ==============================================================
        // OVERRIDE FRONTEND
        // Mengubah paksa balasan backend dengan daftar modul berdasarkan 
        // properti 'roles' yang baru saja ditambahkan di config/modules.js
        // ==============================================================
        const userRole = data.profil?.role || ''

        // Memfilter MODUL_KATALOG dan membentuk ulang menjadi format array 
        // object { kode: 'nama_modul' } agar sama persis seperti format backend
        const overrideModul = MODUL_KATALOG
            .filter(m => m.roles && m.roles.includes(userRole))
            .map(m => ({ kode: m.id }))

        // Jika mapping role frontend ada isinya, gunakan itu. 
        // Jika kosong (misal role belum didaftarkan), gunakan bawaan dari backend.
        const modulDiizinkan = overrideModul.length > 0 ? overrideModul : (data.modul || [])

        modul.value = modulDiizinkan

        localStorage.setItem('token', data.token)
        localStorage.setItem('profil', JSON.stringify(data.profil))
        localStorage.setItem('modul', JSON.stringify(modulDiizinkan))
    }

    const keluar = () => {
        token.value = null
        profil.value = null
        modul.value = []

        localStorage.removeItem('token')
        localStorage.removeItem('profil')
        localStorage.removeItem('modul')
    }

    const login = async (username, password) => {
        sedangProses.value = true
        try {
            const { data } = await api.post('auth/login/', { username, password })
            simpan(data)
            return { success: true, data }
        } catch (err) {
            const pesan = err.response?.data?.detail || 'Username atau password salah.'
            return { success: false, message: pesan }
        } finally {
            sedangProses.value = false
        }
    }

    const register = async (payload) => {
        sedangProses.value = true
        try {
            await api.post('auth/register/', payload)
            return { success: true }
        } catch (err) {
            const pesan = err.response?.data?.detail || 'Pendaftaran gagal. Username atau email mungkin sudah terdaftar.'
            return { success: false, message: pesan }
        } finally {
            sedangProses.value = false
        }
    }

    const logout_api = async () => {
        try {
            await api.post('auth/logout/')
        } catch {
        } finally {
            keluar()
        }
    }

    return {
        token, profil, modul, sedangProses,
        masuk, bisaAkses, kartu,
        simpan, keluar, login, logout: logout_api,
        register
    }
}