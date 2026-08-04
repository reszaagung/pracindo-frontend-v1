import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'

import '@/assets/tema.css'

const app = createApp(App)

// Tanpa ini, error saat render (mis. computed yang melempar) bikin layar
// kosong tanpa jejak — lihat ARSITEKTUR-RBAC.md §4.
app.config.errorHandler = (err, instance, info) => {
    const nama = instance?.$options?.name || instance?.$options?.__name || 'komponen tidak dikenal'
    console.error(`[errorHandler] ${nama} (${info}):`, err)
}

app.use(createPinia())
app.use(router)
app.use(ToastService)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: 'none'
        }
    }
})

app.mount('#app')