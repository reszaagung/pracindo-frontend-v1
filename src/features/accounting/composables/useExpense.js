import { ref } from 'vue';
import api from '@/utils/api'

export function useExpense() {
  const daftarBelanja = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const dashboardSummary = ref({
    saldo_kas: 0,
    total_pengeluaran: 0,
    total_pemasukan: 0
  });

  const fetchSemuaBelanja = async (entitas = 'PT') => {
    isLoading.value = true;
    error.value = null;
    try {
      // KOREKSI 1: Menghapus '/api/' agar tidak dobel URL-nya
      const response = await api.get('keuangan/pengeluaran/', {
        params: { entitas }
      });
      let data = response.data?.results || response.data?.data || response.data || [];
      if (!Array.isArray(data)) data = [data];

      daftarBelanja.value = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    } catch (err) {
      console.error("Gagal mengambil data pengeluaran:", err);
      error.value = "Gagal memuat data pengeluaran dari server.";
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDashboardSummary = async (entitas = 'PT') => {
    try {
      const response = await api.get('keuangan/pengeluaran/dashboard-summary/', {
        params: { entitas }
      });
      dashboardSummary.value = response.data;
    } catch (err) {
      console.error("Gagal mengambil ringkasan dashboard:", err);
    }
  };

  const tambahPengeluaran = async (payload) => {
    const formData = new FormData();

    formData.append('entitas', payload.entitas);
    formData.append('kategori', payload.kategori);
    formData.append('nama_pengeluaran', payload.nama_pengeluaran);
    formData.append('pemohon', payload.pemohon);
    formData.append('nominal', payload.nominal);

    if (payload.bukti_nota instanceof File) {
      formData.append('bukti_nota', payload.bukti_nota);
    }

    try {
      // KOREKSI 2: Menggunakan api.post() dan mengirim formData (bukan params entitas)
      const response = await api.post('keuangan/pengeluaran/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchSemuaBelanja(payload.entitas);
      await fetchDashboardSummary(payload.entitas);

      return { success: true, data: response.data };
    } catch (err) {
      console.error("Error dari server:", err.response?.data);
      return {
        success: false,
        message: err.response?.data?.detail || err.response?.data?.message || "Terjadi kesalahan saat menyimpan data."
      };
    }
  };

  return {
    daftarBelanja,
    isLoading,
    error,
    dashboardSummary,
    fetchSemuaBelanja,
    fetchDashboardSummary,
    tambahPengeluaran
  };
}