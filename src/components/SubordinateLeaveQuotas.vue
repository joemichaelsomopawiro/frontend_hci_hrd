<template>
  <div class="subordinate-quotas-section">
    <div class="section-header">
      <h2>Status & Jatah Cuti Karyawan (Tahun {{ new Date().getFullYear() }})</h2>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Memuat data jatah cuti tim...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="subordinates.length === 0" class="empty-state">
      <p>Anda belum memiliki data bawahan atau jatah cuti tim belum diatur.</p>
    </div>
    <div v-else class="table-container">
      <table class="quotas-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Nama Karyawan</th>
            <th>Jabatan</th>
            <th>Cuti Tahunan (Sisa/Total)</th>
            <th>Cuti Sakit (Sisa/Total)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in subordinates" :key="employee.id">
            <td>
              <span class="status-badge" :class="getStatusClass(employee.current_status)">
                {{ employee.current_status }}
              </span>
            </td>
            <td>{{ employee.nama_lengkap }}</td>
            <td>{{ employee.jabatan_saat_ini }}</td>
            <td>
              <span v-if="employee.leave_quotas && employee.leave_quotas.length > 0">
                <strong>{{ getRemainingQuota(employee.leave_quotas[0], 'annual') }}</strong>
                <small> (Dipakai: {{ employee.leave_quotas[0].annual_leave_used || 0 }} / Total: {{ employee.leave_quotas[0].annual_leave_quota || 0 }})</small>
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <span v-if="employee.leave_quotas && employee.leave_quotas.length > 0">
                <strong>{{ getRemainingQuota(employee.leave_quotas[0], 'sick') }}</strong>
                <small> (Dipakai: {{ employee.leave_quotas[0].sick_leave_used || 0 }} / Total: {{ employee.leave_quotas[0].sick_leave_quota || 0 }})</small>
              </span>
              <span v-else class="text-muted">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// Sesuaikan path jika service Anda berada di tempat lain
import { apiClient } from '@/services/authService';

export default {
  name: 'SubordinateLeaveQuotas',
  data() {
    return {
      subordinates: [],
      loading: true,
      error: null,
    };
  },
  async mounted() {
    await this.fetchSubordinateQuotas();
  },
  methods: {
    async fetchSubordinateQuotas() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/manager/subordinate-leave-quotas');
        if (response.data && response.data.success) {
          this.subordinates = response.data.data;
        } else {
            this.error = response.data.message || 'Gagal memuat data tim.';
        }
      } catch (err) {
        this.error = 'Terjadi kesalahan saat menghubungi server. Silakan coba lagi.';
        console.error('Error fetching subordinate leave quotas:', err);
      } finally {
        this.loading = false;
      }
    },
    getRemainingQuota(quota, type) {
        if (!quota) return 0;
        const total = quota[`${type}_leave_quota`] || 0;
        const used = quota[`${type}_leave_used`] || 0;
        return total - used;
    },
    getStatusClass(status) {
      if (!status) return 'status-absen';
      return 'status-' + status.toLowerCase();
    }
  },
};
</script>

<style scoped>
.subordinate-quotas-section {
  background: white;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 2.5rem;
}
.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}
.table-container {
  overflow-x: auto;
}
.quotas-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.quotas-table th,
.quotas-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.quotas-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
  text-transform: uppercase;
}
.quotas-table td {
  color: #374151;
}
.text-muted {
    color: #9ca3af;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: white;
  letter-spacing: 0.05em;
  display: inline-block;
}

.status-hadir {
  background-color: #10b981; /* Green */
}

.status-cuti {
  background-color: #3b82f6; /* Blue */
}

.status-absen {
  background-color: #ef4444; /* Red */
}
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 8px;
}

/* Dark mode support */
.dark-mode .subordinate-quotas-section {
  background: #1f2937;
  color: #f9fafb;
}

.dark-mode .section-header h2 {
  color: #f9fafb;
}

.dark-mode .quotas-table th {
  background-color: #374151;
  color: #d1d5db;
}

.dark-mode .quotas-table td {
  color: #e5e7eb;
  border-bottom-color: #4b5563;
}

.dark-mode .quotas-table th {
  border-bottom-color: #4b5563;
}

.dark-mode .loading-state,
.dark-mode .error-state,
.dark-mode .empty-state {
  background-color: #374151;
  color: #d1d5db;
}
</style>