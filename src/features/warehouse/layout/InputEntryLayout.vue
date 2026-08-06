<template>
    <div class="min-h-screen bg-[#F8FAFC] font-sans flex w-full relative">

        <!-- Mobile Header & Back Button -->
        <div class="md:hidden fixed top-0 left-0 w-full bg-slate-900 h-16 flex items-center px-4 z-50 shadow-md">
            <button @click="goBack"
                class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                <i class="pi pi-arrow-left"></i>
            </button>
            <span class="ml-4 text-white font-bold truncate">{{ title }}</span>
        </div>

        <!-- Sidebar Minimalis (Desktop) -->
        <aside
            class="hidden md:flex w-20 bg-slate-900 flex-col fixed h-screen z-50 items-center py-6 shadow-xl transition-all">

            <!-- Tombol Kembali -->
            <button @click="goBack"
                class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 hover:scale-105 transition-all shadow-md group"
                title="Kembali ke Dashboard">
                <i class="pi pi-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
            </button>

            <div class="flex-1"></div>

            <!-- Inisial User -->
            <div
                class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm border border-slate-700 shadow-inner">
                RM
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 ml-0 md:ml-20 pt-20 md:pt-8 p-4 md:p-8 lg:p-10 w-full min-h-screen flex flex-col">

            <!-- Header Halaman (Hanya tampil di Desktop) -->
            <header class="hidden md:block mb-8 shrink-0 max-w-5xl mx-auto w-full">
                <p v-if="breadcrumb" class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {{ breadcrumb }}
                </p>
                <h1 class="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                    {{ title }}
                </h1>
            </header>

            <!-- Slot untuk Form Entry (Received, Packaging, dll) -->
            <div class="flex-1 w-full max-w-5xl mx-auto">
                <slot />
            </div>

        </main>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNavInputEntry } from '../composables/useNavInputEntry'

const router = useRouter()
const { title, breadcrumb, customBackAction, resetNav } = useNavInputEntry()

const goBack = () => {
    if (customBackAction.value) {
        customBackAction.value()
    } else {
        resetNav()
        router.back()
    }
}
</script>

<style scoped>
/* Transisi masuk yang halus untuk form di dalamnya */
main {
    animation: fadeIn 0.4s ease-out;
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
</style>