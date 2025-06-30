<template>
    <div class="action-section">
      <div class="section-header">
        <h2>Jatah Cuti Anda (Tahun {{ year }})</h2>
      </div>
      <div class="quota-container">
        <div v-if="loading" class="loading-state">
          <p>Memuat data jatah cuti...</p>
        </div>
        <div v-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>
        <div v-if="!loading && quotas.length > 0" class="quota-grid">
          <div v-for="quota in quotas" :key="quota.name" class="quota-card">
            <div class="card-header">
              <h4 class="card-title">{{ quota.name }}</h4>
            </div>
            <div class="card-body">
              <p class="quota-usage">
                <span class="used">{{ quota.used }}</span>
                <span class="separator">/</span>
                <span class="total">{{ quota.total }}</span>
                <span class="unit">Hari</span>
              </p>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: calculateProgress(quota.used, quota.total) + '%' }"
                ></div>
              </div>
              <p class="quota-remaining">Sisa: {{ quota.total - quota.used }} Hari</p>
            </div>
          </div>
        </div>
         <div v-if="!loading && quotas.length === 0 && !error" class="empty-state">
          <p>Data jatah cuti untuk tahun ini tidak ditemukan.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import { apiClient } from '@/services/authService';

export default {
  name: 'MyLeaveQuotas',
  data() {
    return {
      quotas: [],
      loading: true,
      error: null,
      year: new Date().getFullYear(),
    };
  },
  mounted() {
    this.fetchMyQuotas();
  },
  methods: {
    async fetchMyQuotas() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/leave-quotas/my-current');

        if (response.data && response.data.success) {
          const rawQuota = response.data.data;

          // Pengecekan penting jika backend mengembalikan data kosong
          if (!rawQuota) {
            this.error = "Data kuota tidak ditemukan untuk akun Anda. Silakan hubungi HR.";
            this.quotas = [];
            return;
          }

          this.year = rawQuota.year || new Date().getFullYear();

          // =============================================================
          // INI BAGIAN LOGIKA TRANSFORMASI YANG SUDAH DIPERBAIKI
          // Kita akan langsung mengambil data dari rawQuota, bukan leaveTypes
          // =============================================================
          this.quotas = [
            { name: 'Cuti Tahunan',    total: rawQuota.annual_leave_quota,      used: rawQuota.annual_leave_used },
            { name: 'Cuti Sakit',      total: rawQuota.sick_leave_quota,        used: rawQuota.sick_leave_used },
            { name: 'Cuti Darurat',    total: rawQuota.emergency_leave_quota,   used: rawQuota.emergency_leave_used },
            { name: 'Cuti Melahirkan', total: rawQuota.maternity_leave_quota,   used: rawQuota.maternity_leave_used },
            { name: 'Cuti Ayah',       total: rawQuota.paternity_leave_quota,   used: rawQuota.paternity_leave_used },
            { name: 'Cuti Menikah',    total: rawQuota.marriage_leave_quota,    used: rawQuota.marriage_leave_used },
            { name: 'Cuti Duka',       total: rawQuota.bereavement_leave_quota, used: rawQuota.bereavement_leave_used },
          ].map(q => ({
              ...q,
              total: q.total || 0, // Fallback ke 0 jika null/undefined
              used: q.used || 0,
            }))
            .filter(quota => quota.total > 0); // Hanya tampilkan cuti yang jatahnya > 0

        } else {
          // Jika success: false dari backend
          this.error = response.data.message || "Gagal memuat data jatah cuti.";
          this.quotas = [];
        }
      } catch (err) {
        // Jika terjadi error network atau status 4xx/5xx
        if (err.response && err.response.data && err.response.data.message) {
          this.error = err.response.data.message;
        } else {
          this.error = "Gagal terhubung ke server untuk memuat jatah cuti.";
        }
        console.error('Error fetching my leave quotas:', err);
        this.quotas = []; // Kosongkan kuota jika error
      } finally {
        this.loading = false;
      }
    },
    calculateProgress(used, total) {
      if (total === 0 || total === null) return 0;
      return (used / total) * 100;
    },
  },
};
</script>
  
  <style scoped>
  .action-section {
    background: white;
    padding: 2rem;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-top: 2.5rem;
  }
  .section-header {
    margin-bottom: 1.5rem;
  }
  .section-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }
  
  .quota-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  .quota-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.2s ease-in-out;
  }
  .quota-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
  .card-header {
    background-color: #f3f4f6;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
  }
  .card-body {
    padding: 1.25rem;
  }
  .quota-usage {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: baseline;
  }
  .used {
    color: #2563eb;
  }
  .separator {
    color: #d1d5db;
    margin: 0 0.5rem;
  }
  .total {
    font-size: 1.25rem;
    color: #6b7280;
  }
  .unit {
      font-size: 0.875rem;
      color: #6b7280;
      margin-left: 0.5rem;
  }
  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e5e7eb;
    border-radius: 9999px;
    margin-bottom: 0.5rem;
  }
  .progress-fill {
    height: 100%;
    background-color: #2563eb;
    border-radius: 9999px;
    transition: width 0.5s ease-in-out;
  }
  .quota-remaining {
    font-size: 0.875rem;
    color: #4b5563;
    text-align: right;
  }
  .loading-state, .error-state, .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    background-color: #f9fafb;
    border-radius: 8px;
  }
  </style>