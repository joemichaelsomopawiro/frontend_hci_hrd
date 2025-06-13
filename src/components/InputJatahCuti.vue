<template>
  <div class="input-jatah-container">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <h1>Input Jatah Cuti</h1>
          <p>Kelola dan atur jatah cuti karyawan per tahun</p>
        </div>
        <button @click="showModal = true" class="btn-primary">
          <i class="fas fa-plus"></i>
          Tambah Jatah Cuti
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-group">
        <select v-model="filters.year" @change="loadQuotas" class="filter-select">
          <option value="">Semua Tahun</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        <select v-model="filters.employee_id" @change="loadQuotas" class="filter-select">
          <option value="">Semua Karyawan</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.nama_lengkap }}</option>
        </select>
        <button @click="loadQuotas" class="btn-secondary">
          <i class="fas fa-sync"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Quota Table -->
    <div class="table-section">
      <div class="table-container" v-if="quotas.length">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Tahun</th>
              <th>Cuti Tahunan</th>
              <th>Cuti Sakit</th>
              <th>Cuti Darurat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quota in quotas" :key="quota.id" class="table-row">
              <td>
                <div class="employee-info">
                  <strong>{{ quota.employee?.nama_lengkap || 'N/A' }}</strong>
                  <small>{{ quota.employee?.jabatan_saat_ini || '' }}</small>
                </div>
              </td>
              <td>{{ quota.year }}</td>
              <td>
                <div class="quota-info">
                  <span class="quota-used">{{ quota.annual_leave_used }}</span>
                  <span class="quota-separator">/</span>
                  <span class="quota-total">{{ quota.annual_leave_quota }}</span>
                  <div class="quota-bar">
                    <div 
                      class="quota-progress" 
                      :style="{ width: getQuotaPercentage(quota.annual_leave_used, quota.annual_leave_quota) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <div class="quota-info">
                  <span class="quota-used">{{ quota.sick_leave_used }}</span>
                  <span class="quota-separator">/</span>
                  <span class="quota-total">{{ quota.sick_leave_quota }}</span>
                  <div class="quota-bar">
                    <div 
                      class="quota-progress sick" 
                      :style="{ width: getQuotaPercentage(quota.sick_leave_used, quota.sick_leave_quota) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <div class="quota-info">
                  <span class="quota-used">{{ quota.emergency_leave_used }}</span>
                  <span class="quota-separator">/</span>
                  <span class="quota-total">{{ quota.emergency_leave_quota }}</span>
                  <div class="quota-bar">
                    <div 
                      class="quota-progress emergency" 
                      :style="{ width: getQuotaPercentage(quota.emergency_leave_used, quota.emergency_leave_quota) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editQuota(quota)" class="btn-icon edit" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteQuota(quota.id)" class="btn-icon delete" title="Hapus">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <h3>Belum ada data jatah cuti</h3>
        <p>Mulai dengan menambahkan jatah cuti untuk karyawan</p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingQuota ? 'Edit Jatah Cuti' : 'Tambah Jatah Cuti' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Karyawan *</label>
            <select v-model="form.employee_id" class="form-input" required>
              <option value="">Pilih karyawan...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.nama_lengkap }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Tahun *</label>
            <select v-model="form.year" class="form-input" required>
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Jatah Cuti Tahunan *</label>
              <input type="number" v-model="form.annual_leave_quota" class="form-input" min="0" required />
            </div>
            <div class="form-group">
              <label>Jatah Cuti Sakit *</label>
              <input type="number" v-model="form.sick_leave_quota" class="form-input" min="0" required />
            </div>
          </div>
          <div class="form-group">
            <label>Jatah Cuti Darurat *</label>
            <input type="number" v-model="form.emergency_leave_quota" class="form-input" min="0" required />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Batal</button>
          <button @click="saveQuota" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <i :class="notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'InputJatahCuti',
  data() {
    return {
      quotas: [],
      employees: [],
      showModal: false,
      editingQuota: null,
      isSubmitting: false,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      filters: {
        year: new Date().getFullYear(),
        employee_id: ''
      },
      form: {
        employee_id: '',
        year: new Date().getFullYear(),
        annual_leave_quota: 12,
        sick_leave_quota: 12,
        emergency_leave_quota: 2
      },
      apiUrl: 'http://localhost:8000'
    }
  },
  computed: {
    availableYears() {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
    }
  },
  mounted() {
    this.loadEmployees()
    this.loadQuotas()
  },
  methods: {
    async loadEmployees() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/employees`)
        this.employees = response.data || []
      } catch (error) {
        console.error('Error loading employees:', error)
        this.showNotificationMessage('Gagal memuat data karyawan', 'error')
      }
    },
    async loadQuotas() {
      try {
        const params = new URLSearchParams()
        if (this.filters.year) params.append('year', this.filters.year)
        if (this.filters.employee_id) params.append('employee_id', this.filters.employee_id)
        
        const response = await axios.get(`${this.apiUrl}/api/leave-quotas?${params}`)
        this.quotas = response.data.data || []
      } catch (error) {
        console.error('Error loading quotas:', error)
        this.showNotificationMessage('Gagal memuat data jatah cuti', 'error')
      }
    },
    async saveQuota() {
      this.isSubmitting = true
      try {
        if (this.editingQuota) {
          await axios.put(`${this.apiUrl}/api/leave-quotas/${this.editingQuota.id}`, this.form)
          this.showNotificationMessage('Jatah cuti berhasil diperbarui', 'success')
        } else {
          await axios.post(`${this.apiUrl}/api/leave-quotas`, this.form)
          this.showNotificationMessage('Jatah cuti berhasil ditambahkan', 'success')
        }
        this.closeModal()
        this.loadQuotas()
      } catch (error) {
        console.error('Error saving quota:', error)
        this.showNotificationMessage(error.response?.data?.message || 'Gagal menyimpan jatah cuti', 'error')
      } finally {
        this.isSubmitting = false
      }
    },
    async deleteQuota(id) {
      if (!confirm('Yakin ingin menghapus jatah cuti ini?')) return
      
      try {
        await axios.delete(`${this.apiUrl}/api/leave-quotas/${id}`)
        this.showNotificationMessage('Jatah cuti berhasil dihapus', 'success')
        this.loadQuotas()
      } catch (error) {
        console.error('Error deleting quota:', error)
        this.showNotificationMessage('Gagal menghapus jatah cuti', 'error')
      }
    },
    editQuota(quota) {
      this.editingQuota = quota
      this.form = {
        employee_id: quota.employee_id,
        year: quota.year,
        annual_leave_quota: quota.annual_leave_quota,
        sick_leave_quota: quota.sick_leave_quota,
        emergency_leave_quota: quota.emergency_leave_quota
      }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingQuota = null
      this.form = {
        employee_id: '',
        year: new Date().getFullYear(),
        annual_leave_quota: 12,
        sick_leave_quota: 12,
        emergency_leave_quota: 2
      }
    },
    getQuotaPercentage(used, total) {
      return total > 0 ? Math.min((used / total) * 100, 100) : 0
    },
    showNotificationMessage(message, type) {
      this.notificationMessage = message
      this.notificationType = type
      this.showNotification = true
      setTimeout(() => {
        this.showNotification = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
/* Gunakan style yang sama dari file CSS yang sudah ada */
.input-jatah-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.page-title p {
  color: var(--gray-600);
  font-size: 1.1rem;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
}

.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.modern-table th {
  background: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
  white-space: nowrap;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: top;
}

.table-row:hover {
  background: var(--gray-50);
}

.employee-info strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--gray-900);
}

.employee-info small {
  color: var(--gray-500);
  font-size: 0.75rem;
}

.quota-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: column;
}

.quota-used {
  font-weight: 600;
  color: var(--primary-color);
}

.quota-separator {
  color: var(--gray-400);
}

.quota-total {
  color: var(--gray-600);
}

.quota-bar {
  width: 60px;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.quota-progress {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.quota-progress.sick {
  background: var(--warning-color);
}

.quota-progress.emergency {
  background: var(--error-color);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.btn-icon.edit {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.btn-icon.edit:hover {
  background: var(--warning-color);
  color: white;
}

.btn-icon.delete {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-icon.delete:hover {
  background: var(--error-color);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--gray-300);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--gray-700);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-500);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--gray-700);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: var(--gray-300);
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: var(--success-color);
}

.notification.error {
  background: var(--error-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .input-jatah-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
