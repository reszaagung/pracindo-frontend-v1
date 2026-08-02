<template>
    <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-lg w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">

            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-slate-900">Registrasi Staff</h2>
                <p class="mt-2 text-sm text-slate-600">Lengkapi data diri Anda untuk akses Pracindo ERP</p>
            </div>

            <!-- Pesan Sukses -->
            <div v-if="sukses" class="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-md text-center space-y-4">
                <i class="pi pi-check-circle text-4xl text-teal-500"></i>
                <h3 class="text-lg font-medium text-teal-800">Pendaftaran Berhasil</h3>
                <p class="text-sm text-teal-700">{{ sukses }}</p>
                <router-link to="/login"
                    class="inline-block mt-4 text-sm font-medium text-teal-600 hover:text-teal-800">
                    &larr; Lanjut ke halaman Login
                </router-link>
            </div>

            <!-- Form Pendaftaran -->
            <form v-else class="mt-8 space-y-5" @submit.prevent="handleDaftar">
                <div v-if="pesan" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p class="text-sm text-red-700">{{ pesan }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                    <input v-model="daftarForm.nama_lengkap" type="text" required
                        class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Username</label>
                        <input v-model="daftarForm.username" type="text" required
                            class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Telepon / WhatsApp</label>
                        <input v-model="daftarForm.telepon" type="text"
                            class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700">Email</label>
                    <input v-model="daftarForm.email" type="email" required
                        class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Password</label>
                        <input v-model="daftarForm.password" type="password" required minlength="10"
                            class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                        <input v-model="daftarForm.password2" type="password" required minlength="10"
                            class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
                    </div>
                </div>

                <button type="submit" :disabled="sedangProses"
                    class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-colors">
                    <i v-if="sedangProses" class="pi pi-spin pi-spinner mr-2"></i>
                    {{ sedangProses ? 'Mengirim Data...' : 'Kirim Pendaftaran' }}
                </button>

                <div class="text-center mt-4">
                    <router-link to="/login" class="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Batal
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { daftar, sedangProses } = useAuth()

const daftarForm = reactive({
    nama_lengkap: '',
    username: '',
    email: '',
    telepon: '',
    password: '',
    password2: ''
})

const sukses = ref('')
const pesan = ref('')

const handleDaftar = async () => {
    pesan.value = ''
    sukses.value = ''

    if (daftarForm.password !== daftarForm.password2) {
        pesan.value = 'Password dan Konfirmasi Password tidak cocok.'
        return
    }

    const hasil = await daftar({ ...daftarForm })

    if (!hasil.success) {
        pesan.value = hasil.message
        return
    }

    sukses.value = 'Pendaftaran terkirim. Akun bisa dipakai setelah disetujui Supervisor.'
    Object.assign(daftarForm, {
        nama_lengkap: '', username: '', email: '',
        telepon: '', password: '', password2: '',
    })

    // Opsional: Otomatis pindah ke halaman login setelah 3 detik
    // setTimeout(() => router.push('/login'), 3000)
}
</script>