<template>
  <div class="input-jatah-container">
    <!-- Header -->
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

    <!-- Filter -->
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

    <!-- Table -->
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

    <!-- Modal Add/Edit -->
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
:root {
  /* Enhanced Professional Color Palette */
  --primary-color: #1e40af;
  --primary-light: #3b82f6;
  --primary-dark: #1e3a8a;
  --primary-bg: #eff6ff;
  --primary-border: #bfdbfe;
  
  --success-color: #059669;
  --success-light: #10b981;
  --success-bg: #ecfdf5;
  --success-border: #a7f3d0;
  
  --warning-color: #d97706;
  --warning-light: #f59e0b;
  --warning-bg: #fffbeb;
  --warning-border: #fde68a;
  
  --error-color: #dc2626;
  --error-light: #ef4444;
  --error-bg: #fef2f2;
  --error-border: #fecaca;
  
  --info-color: #0891b2;
  --info-light: #06b6d4;
  --info-bg: #f0f9ff;
  --info-border: #7dd3fc;
  
  /* Enhanced Gray Scale */
  --gray-25: #fcfcfd;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Enhanced Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Transitions */
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-jatah-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: var(--gray-25);
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, white 0%, var(--gray-50) 100%);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-100);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--info-color) 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.page-title p {
  color: var(--gray-600);
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
}

.filters-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-100);
}

.filter-group {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.875rem 1.25rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 180px;
  background: white;
  color: var(--gray-700);
  transition: var(--transition);
  cursor: pointer;
}

.filter-select:hover {
  border-color: var(--gray-300);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.table-section {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-100);
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
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--gray-800);
  border-bottom: 2px solid var(--gray-200);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modern-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
  transition: var(--transition);
}

.table-row:hover {
  background: linear-gradient(135deg, var(--gray-25) 0%, var(--gray-50) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.employee-info strong {
  font-weight: 700;
  color: var(--gray-900);
  font-size: 0.95rem;
  line-height: 1.4;
}

.employee-info small {
  color: var(--gray-500);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: var(--gray-100);
  border-radius: var(--radius-sm);
  display: inline-block;
  width: fit-content;
}

.quota-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-direction: column;
}

.quota-used {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--primary-color);
}

.quota-separator {
  color: var(--gray-400);
  font-weight: 600;
}

.quota-total {
  color: var(--gray-600);
  font-weight: 600;
}

.quota-bar {
  width: 80px;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.quota-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
  transition: var(--transition-slow);
  border-radius: var(--radius-sm);
  position: relative;
}

.quota-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.quota-progress.sick {
  background: linear-gradient(90deg, var(--warning-color) 0%, var(--warning-light) 100%);
}

.quota-progress.emergency {
  background: linear-gradient(90deg, var(--error-color) 0%, var(--error-light) 100%);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

.btn-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.btn-icon:hover::before {
  left: 100%;
}

.btn-icon.edit {
  background: var(--warning-bg);
  color: var(--warning-color);
  border: 2px solid var(--warning-border);
}

.btn-icon.edit:hover {
  background: var(--warning-color);
  color: white;
  border-color: var(--warning-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon.delete {
  background: var(--error-bg);
  color: var(--error-color);
  border: 2px solid var(--error-border);
}

.btn-icon.delete:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
  background: linear-gradient(135deg, var(--gray-25) 0%, var(--gray-50) 100%);
  border-radius: var(--radius-lg);
  margin: 2rem;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: var(--gray-300);
  background: linear-gradient(135deg, var(--gray-300) 0%, var(--gray-400) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-state h3 {
  margin-bottom: 0.75rem;
  color: var(--gray-700);
  font-size: 1.5rem;
  font-weight: 700;
}

.empty-state p {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 650px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--gray-100);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 2px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--gray-25) 0%, var(--gray-50) 100%);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.close-btn {
  background: var(--gray-100);
  border: 2px solid var(--gray-200);
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--error-color);
  color: white;
  border-color: var(--error-color);
  transform: scale(1.05);
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--gray-800);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  color: var(--gray-700);
  background: var(--gray-25);
  transition: var(--transition);
  box-sizing: border-box;
}

.form-input:hover {
  border-color: var(--gray-300);
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 4px var(--primary-bg);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: var(--gray-400);
  font-weight: 400;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.modal-footer {
  padding: 1.5rem 2rem 2rem 2rem;
  border-top: 2px solid var(--gray-100);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: var(--gray-25);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  border: 2px solid var(--primary-color);
  padding: 1rem 2rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-dark);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
  padding: 1rem 2rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
}

.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
  transition: left 0.5s;
}

.btn-secondary:hover::before {
  left: 100%;
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
  color: var(--gray-800);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  font-size: 0.75rem;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  animation: slideIn 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: none;
  max-width: 250px;
  min-width: 180px;
}

.notification.success {
  background: var(--success-color);
  border-color: rgba(255, 255, 255, 0.2);
}

.notification.error {
  background: var(--error-color);
  border-color: rgba(255, 255, 255, 0.2);
}

.notification i {
  font-size: 0.75rem;
  opacity: 0.9;
}

@keyframes slideIn {
  from {
    transform: translateX(100%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* Enhanced Responsive Design */
@media (max-width: 1024px) {
  .input-jatah-container {
    padding: 1.5rem;
  }
  
  .page-header {
    padding: 2rem;
  }
  
  .page-title h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .input-jatah-container {
    padding: 1rem;
    background: white;
  }
  
  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .page-title h1 {
    font-size: 1.75rem;
  }
  
  .page-title p {
    font-size: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .filters-section {
    padding: 1.5rem;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-select {
    min-width: auto;
    width: 100%;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .quota-bar {
    width: 60px;
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.875rem 1.5rem;
    font-size: 0.85rem;
  }
  
  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .page-title h1 {
    font-size: 1.5rem;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-state i {
    font-size: 3rem;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
  }
}
</style>
