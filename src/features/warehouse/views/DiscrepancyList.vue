<!--
  features/warehouse/views/DiscrepancyList.vue
  ==============================================
  Daftar laporan selisih. Filter status di frontend — tidak ada
  ?status= terverifikasi di kontrak laporan-selisih/ (SPEK-BACKEND.md
  §3.3), jadi tidak menebak parameter yang belum terbukti ada.

  "Ajukan ke suplier" terbuka untuk semua pengguna modul gudang (tidak
  ada gerbang peran akunting di endpoint ini) — beda dari
  selesaikan/tutup yang memang milik akunting dan tidak dibangun di sini.
-->
<template>
    <div class="halaman">
        <header class="kepala">
            <div>
                <h1 class="judul">Laporan Selisih</h1>
                <p class="sub">Selisih berat, kekurangan kirim, dan barang ditolak</p>
            </div>
        </header>

        <div class="saring">
            <button v-for="opt in SARINGAN" :key="opt.nilai" class="chip"
                :class="{ 'chip--aktif': saring === opt.nilai }" @click="saring = opt.nilai">
                {{ opt.label }}
            </button>
        </div>

        <p v-if="galat" class="galat">{{ galat }}</p>

        <div class="tabel-wrap">
            <table class="tabel">
                <thead>
                    <tr>
                        <th>Nomor</th>
                        <th>Jenis</th>
                        <th class="ka">Qty selisih</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="s in tampil" :key="s.id">
                        <td class="tebal">{{ s.nomor }}</td>
                        <td>{{ s.jenis }}</td>
                        <td class="ka">{{ angka(s.qty_selisih, 3) }}</td>
                        <td><span class="lencana" :class="kelasStatus(s.status)">{{ s.status }}</span></td>
                        <td class="ka">
                            <button v-if="s.status === 'DIBUKA'" class="tombol tombol--kecil" :disabled="sedangProses"
                                @click="ajukanKlaim(s)">
                                Ajukan
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="kartu-list">
            <div v-for="s in tampil" :key="s.id" class="kartu">
                <div class="kartu__baris1">
                    <span class="tebal">{{ s.nomor }}</span>
                    <span class="lencana" :class="kelasStatus(s.status)">{{ s.status }}</span>
                </div>
                <p class="kartu__sub">{{ s.jenis }} · {{ angka(s.qty_selisih, 3) }}</p>
                <button v-if="s.status === 'DIBUKA'" class="tombol tombol--kecil" :disabled="sedangProses"
                    @click="ajukanKlaim(s)">
                    Ajukan ke suplier
                </button>
            </div>
        </div>

        <p v-if="!sedangProses && tampil.length === 0" class="kosong">Tidak ada laporan selisih.</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDiscrepancy } from '../composables/useDiscrepancy'
import { useToast } from '@/composables/useToast'
import { angka } from '@/utils/format'

const SARINGAN = [
    { nilai: 'semua', label: 'Semua' },
    { nilai: 'DIBUKA', label: 'Dibuka' },
    { nilai: 'DIAJUKAN', label: 'Diajukan' },
    { nilai: 'DISELESAIKAN', label: 'Diselesaikan' },
    { nilai: 'DITUTUP', label: 'Ditutup' },
]

const { daftarSelisih, sedangProses, galat, muatSelisih, ajukan } = useDiscrepancy()
const toast = useToast()

const saring = ref('semua')
const tampil = computed(() => saring.value === 'semua'
    ? daftarSelisih.value
    : daftarSelisih.value.filter(s => s.status === saring.value))

const kelasStatus = (status) => ({
    DIBUKA: 'lencana--kuning',
    DIAJUKAN: 'lencana--biru',
    DISEPAKATI: 'lencana--biru',
    DISELESAIKAN: 'lencana--hijau',
    DITUTUP: 'lencana--redup',
}[status] ?? 'lencana--redup')

const ajukanKlaim = async (s) => {
    const hasil = await ajukan(s.id)
    if (hasil.success) {
        toast.success('Klaim diajukan ke suplier.')
        muatSelisih()
    } else {
        toast.error(hasil.message)
    }
}

onMounted(() => muatSelisih())
</script>

<style scoped>
.halaman {
    max-width: 72rem;
    margin: 0 auto;
}

.kepala {
    margin-bottom: 1rem;
}

.judul {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--teks);
}

.sub {
    margin: .3rem 0 0;
    font-size: .875rem;
    color: var(--redup);
}

.saring {
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
}

.chip {
    font-family: inherit;
    font-size: .75rem;
    font-weight: 600;
    color: var(--redup);
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: 999px;
    padding: .4rem .9rem;
    cursor: pointer;
}

.chip--aktif {
    color: #fff;
    background: var(--biru);
    border-color: var(--biru);
}

.galat {
    padding: .75rem 1rem;
    background: var(--merah-latar);
    color: var(--merah);
    border-radius: var(--lengkung-kecil);
    font-size: .8125rem;
    margin-bottom: 1rem;
}

.tabel-wrap {
    background: var(--panel);
    border: 1px solid var(--garis);
    border-radius: var(--lengkung);
    overflow: hidden;
}

.tabel {
    width: 100%;
    border-collapse: collapse;
}

.tabel th {
    text-align: left;
    font-size: .6875rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--redup-2);
    padding: .85rem 1rem;
    border-bottom: 1px solid var(--garis);
}

.tabel td {
    padding: .75rem 1rem;
    font-size: .8125rem;
    color: var(--teks-2);
    border-bottom: 1px solid var(--garis);
}

.ka {
    text-align: right;
}

.tebal {
    font-weight: 600;
    color: var(--teks);
}

.lencana {
    font-size: .6875rem;
    font-weight: 700;
    padding: .2rem .55rem;
    border-radius: 999px;
}

.lencana--kuning {
    color: var(--kuning);
    background: var(--kuning-latar);
}

.lencana--biru {
    color: var(--biru);
    background: var(--biru-latar);
}

.lencana--hijau {
    color: var(--hijau);
    background: var(--hijau-latar);
}

.lencana--redup {
    color: var(--redup);
    background: var(--latar);
}

.tombol {
    font-family: inherit;
    font-weight: 600;
    color: var(--teks);
    background: var(--panel);
    border: 1px solid var(--garis-tegas);
    border-radius: var(--lengkung-kecil);
    cursor: pointer;
}

.tombol--kecil {
    font-size: .75rem;
    padding: .4rem .8rem;
}

.tombol:disabled {
    opacity: .5;
    cursor: not-allowed;
}

.kartu-list {
    display: none;
}

.kosong {
    padding: 3rem 1rem;
    text-align: center;
    color: var(--redup);
    font-size: .875rem;
}

@media (max-width: 768px) {
    .tabel-wrap {
        display: none;
    }

    .kartu-list {
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }

    .kartu {
        background: var(--panel);
        border: 1px solid var(--garis);
        border-radius: var(--lengkung);
        padding: 1rem;
    }

    .kartu__baris1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: .35rem;
    }

    .kartu__sub {
        margin: 0 0 .6rem;
        font-size: .8125rem;
        color: var(--redup);
    }
}
</style>
