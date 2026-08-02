/**
 * features/work-order/composables/useWorkOrder.js
 * ================================================
 * work_order BELUM DIMODELKAN sama sekali di backend (SPEK-BACKEND.md §8.3:
 * "Belum dimodelkan") — tidak ada kontrak endpoint resmi untuk ditembak.
 * Selama itu benar, satu-satunya sumber data adalah fixture di src/mock/
 * (VITE_USE_MOCK=true). Kalau mock dimatikan tanpa kontrak backend, komposabel
 * ini menyatakan dengan jelas bahwa fitur menunggu backend — tidak menebak URL.
 */

import { ref, computed } from 'vue'
import { pakaiMock, WORK_ORDER_MOCK, STAFF_MOCK } from '@/mock'

const PESAN_BELUM_ADA_BACKEND =
    'Modul work order belum tersedia — menunggu backend (SPEK-BACKEND.md §8.3).'

let idBerikutnya = Math.max(0, ...WORK_ORDER_MOCK.map((wo) => wo.id)) + 1

export function useWorkOrder(accessCard) {
    const mading = ref([])
    const semuaWO = ref([])
    const staffList = ref([])
    const isLoading = ref(false)
    const sedangApprove = ref(null)
    const error = ref(null)

    const staffId = computed(() => accessCard?.value?.profil_staff_id ?? null)
    const username = computed(() => accessCard?.value?.username ?? '')

    const bisaApprove = (wo) =>
        !wo.selesai && wo.penugasan?.some(p => p.staff === staffId.value)
    const sayaBuat = computed(() =>
        semuaWO.value.filter(wo => wo.dibuat_oleh_username === username.value)
    )

    const terlambat = computed(() => mading.value.filter(wo => wo.terlambat))

    const fetchMading = async () => {
        isLoading.value = true
        error.value = null

        if (pakaiMock) {
            mading.value = WORK_ORDER_MOCK.filter((wo) => !wo.selesai)
            isLoading.value = false
            return
        }

        error.value = PESAN_BELUM_ADA_BACKEND
        isLoading.value = false
    }

    const fetchSemua = async ({ selesai = null } = {}) => {
        isLoading.value = true

        if (pakaiMock) {
            semuaWO.value = selesai === null
                ? WORK_ORDER_MOCK
                : WORK_ORDER_MOCK.filter((wo) => wo.selesai === selesai)
            isLoading.value = false
            return
        }

        error.value = PESAN_BELUM_ADA_BACKEND
        isLoading.value = false
    }

    const fetchStaffList = async () => {
        if (pakaiMock) {
            staffList.value = STAFF_MOCK
            return
        }

        error.value = PESAN_BELUM_ADA_BACKEND
        console.error(PESAN_BELUM_ADA_BACKEND)
    }

    /**
     * @param {string} judul
     * @param {string} deskripsi
     * @param {number[]} staffIds
     * @param {string} tanggal
     * @param {string|null} deadline
     */
    const buatWO = async ({ judul, deskripsi = '', staffIds, tanggal, deadline = null }) => {
        if (!staffIds?.length) {
            return { success: false, message: 'Minimal tag 1 staf.' }
        }

        if (!pakaiMock) {
            return { success: false, message: PESAN_BELUM_ADA_BACKEND }
        }

        isLoading.value = true
        const wo = {
            id: idBerikutnya++,
            judul, deskripsi, tanggal, deadline,
            selesai: false, terlambat: false,
            dibuat_oleh_username: username.value,
            penugasan: staffIds.map((staff) => ({ staff })),
        }
        WORK_ORDER_MOCK.push(wo)
        await fetchMading()
        isLoading.value = false
        return { success: true, wo }
    }

    /** Satu approval menutup WO untuk semua yang ditag. */
    const approveWO = async (wo) => {
        if (!pakaiMock) {
            return { success: false, message: PESAN_BELUM_ADA_BACKEND }
        }

        sedangApprove.value = wo.id
        const target = WORK_ORDER_MOCK.find((w) => w.id === wo.id)
        if (target) target.selesai = true
        await fetchMading()
        sedangApprove.value = null
        return { success: true }
    }

    return {
        mading, semuaWO, staffList, isLoading, error, sedangApprove,
        staffId, bisaApprove, sayaBuat, terlambat,
        fetchMading, fetchSemua, fetchStaffList, buatWO, approveWO,
    }
}
