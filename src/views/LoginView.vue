<!--
  src/views/LoginView.vue
  ========================
  UI/UX dipertahankan sepenuhnya menggunakan PrimeVue dan Tailwind v4.
  Logika telah disinkronkan dengan:
  1. Parameter `next` dari router guards.
  2. Penangkap notifikasi token kedaluwarsa.
  3. Tautan Registrasi Staff yang mengarah ke /register.
-->
<template>
    <div class="min-h-screen w-full font-sans text-slate-800 bg-white flex overflow-hidden">

        <!-- ── kiri: panel ilustrasi (desktop) ─────────────────── -->
        <div class="hidden lg:flex lg:w-[55%] flex-col justify-center relative p-16 xl:p-24 border-r border-slate-200">
            <div class="absolute top-12 left-16 xl:left-24 flex items-center gap-3">
                <img :src="logoPracindo" alt="Logo Pracindo"
                    class="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1" />
                <span class="font-bold text-xl text-teal-700 tracking-tight">Pracindo Supply Chain Management</span>
            </div>

            <div class="w-full z-10 mt-8">
                <h1 class="text-5xl lg:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
                    Aplikasi <br>
                    Utama untuk <br>
                    <span class="text-teal-600">Kontrol Manufaktur.</span>
                </h1>

                <p class="text-base text-slate-600 mb-8 font-medium leading-relaxed max-w-xl pr-8">
                    Aplikasi untuk mengelola rantai pasok, proses produksi, pembukuan,
                    inventaris gudang, hingga distribusi lapangan.
                </p>

                <div class="relative w-full max-w-[700px] mt-2">
                    <img :src="ilustrationImg" alt="Ilustrasi Central Hub"
                        class="w-full aspect-[16/9] lg:aspect-[21/10] object-contain object-left drop-shadow-md rounded-xl" />
                </div>
            </div>
        </div>

        <!-- ── kanan: form login ───────────────────────────────── -->
        <div class="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 relative bg-slate-50 lg:bg-white">

            <div
                class="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 transition-all duration-300">

                <div class="flex lg:hidden flex-col items-center gap-3 mb-8">
                    <img :src="logoPracindo" alt="Logo Pracindo"
                        class="w-20 h-20 object-contain rounded-xl border border-slate-200 p-1.5" />
                    <span class="font-bold text-2xl text-teal-600 tracking-tight">Pracindo Jaya Mandiri</span>
                </div>

                <div class="animate-fade-in flex flex-col">
                    <h2 class="text-xl font-bold text-slate-800 mb-6 text-center">Login Staff</h2>

                    <form class="space-y-4" @submit.prevent="handleLogin">
                        <InputText ref="isianPertama" v-model="form.identifier" placeholder="Username atau email"
                            autocomplete="username" required :disabled="sedangProses"
                            class="w-full rounded-xl! bg-slate-50/50 border-slate-300 py-3.5! px-4! text-[15px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all" />

                        <div class="relative">
                            <InputText v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                placeholder="Kata Sandi" autocomplete="current-password" required
                                :disabled="sedangProses"
                                class="w-full rounded-xl! bg-slate-50/50 border-slate-300 py-3.5! px-4! pr-12! text-[15px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all" />
                            <button type="button"
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                :aria-label="showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
                                @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
                            </button>
                        </div>

                        <!-- Pesan Error / Notifikasi Sesi -->
                        <p v-if="pesan" role="alert"
                            class="bg-red-50 border border-red-100 text-red-600 text-sm leading-relaxed rounded-xl px-4 py-3 whitespace-pre-line">
                            {{ pesan }}
                        </p>

                        <Button type="submit" :label="sedangProses ? 'Memeriksa...' : 'Login'" :loading="sedangProses"
                            :disabled="sedangProses"
                            class="w-full justify-center mt-4! bg-teal-600! hover:bg-teal-700! border-none! rounded-xl! py-3.5! text-[17px] font-bold! text-white! transition-colors shadow-sm" />
                    </form>

                    <div class="border-b border-slate-200 w-full mt-6 mb-5"></div>

                    <!-- Tautan ke Halaman Pendaftaran -->
                    <p class="text-center text-[14px] text-slate-500 font-medium">
                        Belum punya akun? <br>
                        <router-link to="/register"
                            class="text-teal-600 hover:text-teal-700 font-bold transition-colors">
                            Registrasi Staff
                        </router-link>
                    </p>

                    <p class="mt-5 pt-4 border-t border-slate-200 text-xs text-slate-400 leading-relaxed">
                        Satu sesi aktif per akun — masuk di perangkat lain akan menutup sesi ini.
                    </p>
                </div>
            </div>

            <div
                class="absolute bottom-8 text-center flex items-center justify-center gap-1.5 text-slate-400 text-sm font-medium">
                <i class="pi pi-shield text-xs"></i> Pracindo Central Hub
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useAuth } from '@/composables/useAuth'
import { rutePertamaSiap } from '@/config/modules'

import logoPracindo from '@/assets/logo_pt.svg'
import ilustrationImg from '@/assets/ilustration.jpg'

const route = useRoute()
const router = useRouter()
const { login, sedangProses, bisaAkses, modul } = useAuth()

const form = reactive({ identifier: '', password: '' })
const showPassword = ref(false)
const pesan = ref('')
const isianPertama = ref(null)

onMounted(() => {
    isianPertama.value?.$el?.focus?.()
    if (route.query.sesi === 'berakhir') {
        pesan.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
        router.replace({ query: {} })
    }
})

const handleLogin = async () => {
    pesan.value = ''
    const hasil = await login(form.identifier.trim(), form.password)

    if (!hasil.success) {
        pesan.value = hasil.message
        form.password = ''
        return
    }

    // login() sudah memanggil simpan(), jadi bisaAkses() dan modul sudah
    // memuat data yang baru saat baris-baris di bawah ini berjalan.
    const tujuan = route.query.next
    if (bolehKe(tujuan)) {
        router.push(tujuan)
        return
    }

    router.push(rutePertamaSiap(modul.value) ?? { name: 'dashboard' })
}

/**
 * Apakah `next` layak diikuti?
 *
 * Guard mengirim `next` apa adanya dari URL, jadi isinya belum tepercaya:
 *   - harus path internal — '//situs-lain.com' adalah open redirect,
 *     dan `startsWith('/')` saja tidak menangkapnya
 *   - harus benar-benar ada rutenya, bukan jatuh ke catch-all 404
 *   - modulnya harus lolos bisaAkses, kalau tidak pengguna login lalu
 *     langsung dilempar guard ke halaman Akses Ditolak
 */
const bolehKe = (tujuan) => {
    if (typeof tujuan !== 'string' || !tujuan.startsWith('/')) return false
    if (tujuan === '/' || tujuan.startsWith('//')) return false

    const cocok = router.resolve(tujuan)
    if (cocok.name === 'NotFound') return false

    const kodeModul = cocok.meta?.modul
    return !kodeModul || bisaAkses(kodeModul)
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {
    .animate-fade-in {
        animation: none;
    }
}
</style>