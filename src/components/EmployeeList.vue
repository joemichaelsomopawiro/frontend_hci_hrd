<template>
  <div class="employee-list-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-btn" title="Kembali">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="page-title">
          <h1>Data Pegawai</h1>
          <p>Hope Channel Indonesia - Enterprise HR System</p>
        </div>
        <div class="header-actions">
          <router-link to="/tambah-pegawai-baru" class="btn-primary">
            <i class="fas fa-plus"></i>
            Tambah Pegawai
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Memuat data pegawai...</p>
      </div>
    </div>

    <!-- Employee List Content -->
    <div v-else class="employee-list-content">
      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>{{ employees.length }}</h3>
            <p>Total Pegawai</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <i class="fas fa-user"></i>
          </div>
          <div class="stat-info">
            <h3>{{ activeEmployees }}</h3>
            <p>Pegawai Aktif</p>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="controls-section">
        <div class="search-controls">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Cari pegawai..." 
              v-model="searchQuery"
              class="search-input"
            />
          </div>
          <select v-model="filterDepartment" class="filter-select">
            <option value="">Semua Departemen</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Production">Production</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      <!-- Employee Table -->
      <div class="table-section">
        <div class="table-container" v-if="filteredEmployees.length">
          <table class="modern-table">
            <thead>
              <tr>
                <th class="number-column">No</th>
                <th>Nama Lengkap</th>
                <th>NIK</th>
                <th>NIP</th>
                <th>Jabatan</th>
                <th>Gaji Total</th>
                <th>Pelatihan</th>
                <th>Dokumen</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(employee, index) in paginatedEmployees" :key="employee.id" class="table-row">
                <td class="number-cell" data-label="No">
                  <span class="row-number">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
                </td>
                <td class="name-cell" data-label="Nama Lengkap">
                  <div class="employee-info">
                    <div class="employee-name">
                      <strong>{{ employee.nama_lengkap }}</strong>
                    </div>
                    <div class="employee-education">{{ employee.tingkat_pendidikan }}</div>
                  </div>
                </td>
                <td class="id-cell" data-label="NIK">
                  <div class="id-info">{{ employee.nik }}</div>
                </td>
                <td class="id-cell" data-label="NIP">
                  <div class="id-info">{{ employee.nip || '-' }}</div>
                </td>
                <td class="position-cell" data-label="Jabatan">
                  <div class="position-info">{{ employee.jabatan_saat_ini }}</div>
                </td>
                <td class="salary-cell" data-label="Gaji Total">
                  <div class="salary-info">
                    <div class="total-salary">
                      <strong>Rp {{ formatCurrency(calculateTotalSalary(employee)) }}</strong>
                    </div>
                    <div class="base-salary">Gaji Pokok: Rp {{ formatCurrency(employee.gaji_pokok) }}</div>
                  </div>
                </td>
                <td class="training-cell" data-label="Pelatihan">
                  <div class="training-info">
                    <span class="training-count">
                      {{ employee.trainings ? employee.trainings.length : 0 }} pelatihan
                    </span>
                  </div>
                </td>
                <td class="documents-cell" data-label="Dokumen">
                  <div class="documents-info">
                      <span v-if="employee.documents && employee.documents.length" class="doc-count">
                        {{ employee.documents.length }} dokumen
                      </span>
                      <span v-else class="no-docs">Tidak ada</span>
                  </div>
                </td>
                <td class="actions-cell" data-label="Aksi">
                  <div class="action-buttons">
                    <button class="btn-icon view-btn" @click="viewEmployee(employee.id)" title="Lihat Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" @click="editEmployee(employee.id)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" @click="deleteEmployee(employee.id)" title="Hapus">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-state">
          <i class="fas fa-users"></i>
          <h3>Belum ada data pegawai</h3>
          <p>Mulai dengan menambahkan pegawai pertama Anda</p>
          <router-link to="/tambah-pegawai-baru" class="btn-primary">
            Tambah Pegawai
          </router-link>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="pagination-info">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-right"></i>
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
  name: 'EmployeeList',
  data() {
    return {
      employees: [],
      loading: true,
      searchQuery: '',
      filterDepartment: '',
      currentPage: 1,
      itemsPerPage: 10,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      apiUrl: 'http://127.0.0.1:8000'
    }
  },
  computed: {
    activeEmployees() {
      return this.employees.filter(emp => emp.status === 'active' || !emp.status).length
    },
    filteredEmployees() {
      let filtered = this.employees
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(emp => 
          emp.nama_lengkap?.toLowerCase().includes(query) ||
          emp.nik?.toLowerCase().includes(query) ||
          emp.nip?.toLowerCase().includes(query) ||
          emp.jabatan_saat_ini?.toLowerCase().includes(query)
        )
      }
      
      if (this.filterDepartment) {
        filtered = filtered.filter(emp => 
          emp.department === this.filterDepartment
        )
      }
      
      return filtered
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredEmployees.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage)
    }
  },
  methods: {
    async fetchEmployees() {
      try {
        this.loading = true
        const response = await axios.get(`${this.apiUrl}/api/employees`)
        this.employees = response.data.data || response.data || []
      } catch (error) {
        this.showNotificationMessage('Gagal memuat data pegawai', 'error')
        this.employees = []
      } finally {
        this.loading = false
      }
    },
    viewEmployee(id) {
      this.$router.push(`/employee/${id}`)
    },
    editEmployee(id) {
      this.$router.push(`/edit-employee/${id}`)
    },
    async deleteEmployee(id) {
      if (confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${id}`)
          this.showNotificationMessage('Pegawai berhasil dihapus', 'success')
          this.fetchEmployees()
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus pegawai', 'error')
        }
      }
    },
    calculateTotalSalary(employee) {
      const gaji = parseFloat(employee.gaji_pokok) || 0
      const tunjangan = parseFloat(employee.tunjangan_jabatan) || 0
      const bonus = parseFloat(employee.bonus) || 0
      return gaji + tunjangan + bonus
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount)
    },
    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message
      this.notificationType = type
      this.showNotification = true
      setTimeout(() => {
        this.showNotification = false
      }, 3000)
    }
  },
  mounted() {
    this.fetchEmployees()
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    filterDepartment() {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
/* Employee List Container */
.employee-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-xl);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: var(--spacing-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-base);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.page-title h1 {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
}

.page-title p {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.stat-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease;
}

.stat-item:hover {
  border-color: var(--border-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}

.stat-info h3 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.stat-info p {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  margin: var(--spacing-xs) 0 0 0;
  font-weight: 500;
}

/* Table Styles */
.employee-table {
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.table-header {
  background: var(--bg-tertiary);
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.table-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

/* Search Section */
.controls-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.search-controls {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: border-color 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.filter-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Tabel Sederhana seperti Excel */
.table-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
}

.modern-table {
  width: 100%;
  background: var(--bg-card);
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  min-width: 1000px;
}

.modern-table th {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  border-bottom: 2px solid var(--border-color);
  font-size: var(--font-size-sm);
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.modern-table td {
  background: var(--bg-card);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light);
  padding: var(--spacing-md) var(--spacing-lg);
  vertical-align: middle;
  white-space: nowrap;
}

.modern-table tr {
  transition: background-color 0.2s ease;
}

/* Hover sederhana seperti Excel */
.modern-table tbody tr:hover {
  background: var(--bg-tertiary);
}

.modern-table tr:last-child td {
  border-bottom: none;
}

/* Kolom dengan lebar yang optimal */
.number-column {
  width: 60px;
  text-align: center;
}

.name-column {
  width: 200px;
  min-width: 180px;
}

.id-column {
  width: 140px;
  min-width: 120px;
}

.position-column {
  width: 150px;
  min-width: 130px;
}

.salary-column {
  width: 180px;
  min-width: 160px;
}

.training-column {
  width: 120px;
  text-align: center;
}

.documents-column {
  width: 140px;
  text-align: center;
}

.actions-column {
  width: 120px;
  text-align: center;
}

/* Nomor urut sederhana */
.number-cell {
  text-align: center;
  width: 60px;
}

.row-number {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  font-weight: 600;
  font-size: var(--font-size-xs);
  display: inline-block;
  min-width: 24px;
  text-align: center;
  border: 1px solid var(--border-color);
}

/* Info karyawan sederhana */
.name-cell {
  width: 200px;
  min-width: 180px;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.employee-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  line-height: 1.3;
}

.employee-education {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* ID Info sederhana */
.id-cell {
  width: 140px;
  min-width: 120px;
}

.id-info {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

/* Position Info sederhana */
.position-cell {
  width: 150px;
  min-width: 130px;
}

.position-info {
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  line-height: 1.3;
}

/* Salary info sederhana */
.salary-cell {
  width: 180px;
  min-width: 160px;
}

.salary-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.total-salary {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.base-salary {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: 400;
}

/* Training dan Documents sederhana */
.training-cell {
  width: 120px;
  text-align: center;
}

.documents-cell {
  width: 140px;
  text-align: center;
}

.training-info, .documents-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.training-count, .doc-count {
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.no-docs {
  color: var(--text-muted);
  font-style: italic;
  font-size: var(--font-size-sm);
}

/* Actions cell sederhana */
.actions-cell {
  width: 120px;
  text-align: center;
}

/* Tombol Aksi Sederhana */
.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  align-items: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  transition: all 0.2s ease;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.view-btn:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.edit-btn:hover {
  background: var(--bg-tertiary);
  color: var(--warning-color);
  border-color: var(--warning-color);
}

.delete-btn:hover {
  background: var(--bg-tertiary);
  color: var(--error-color);
  border-color: var(--error-color);
}

/* Pagination Sederhana */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
}

.pagination-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* Loading State Sederhana */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: var(--text-muted);
  font-size: var(--font-size-base);
  margin: 0;
}

/* Empty State Sederhana */
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.empty-state p {
  color: var(--text-muted);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-xl);
}

/* Notification Sederhana */
.notification {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-md);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  min-width: 300px;
  max-width: 400px;
}

.notification.success {
  border-left: 4px solid var(--success-color);
}

.notification.error {
  border-left: 4px solid var(--error-color);
}

.notification i {
  font-size: var(--font-size-base);
}

.notification.success i {
  color: var(--success-color);
}

.notification.error i {
  color: var(--error-color);
}

/* Responsive Design yang Sederhana */
@media (max-width: 768px) {
  .employee-list-container {
    padding: var(--spacing-md);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .page-title h1 {
    font-size: var(--font-size-xl);
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .stat-item {
    padding: var(--spacing-md);
    min-height: auto;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-base);
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
  
  .search-controls {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .search-box {
    min-width: auto;
  }
  
  .search-box input,
  .filter-select {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
  }
  
  /* Mobile Table Layout - Sederhana */
  .table-container {
    overflow: visible;
  }
  
  .modern-table {
    min-width: auto;
    display: block;
  }
  
  .modern-table thead {
    display: none;
  }
  
  .modern-table tbody {
    display: block;
  }
  
  .modern-table tr {
    display: block;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-sm);
  }
  
  .modern-table td {
    display: block;
    border: none;
    padding: var(--spacing-sm) 0;
    text-align: left;
    white-space: normal;
  }
  
  .modern-table td::before {
    content: attr(data-label) ": ";
    font-weight: 600;
    color: var(--text-primary);
    display: inline-block;
    width: 100px;
    margin-right: var(--spacing-sm);
  }
  
  /* Mobile specific cell styles */
  .number-cell {
    text-align: left;
    width: auto;
  }
  
  .number-cell::before {
    content: "No: ";
  }
  
  .name-cell::before {
    content: "Nama: ";
  }
  
  .id-cell::before {
    content: attr(data-label) ": ";
  }
  
  .position-cell::before {
    content: "Jabatan: ";
  }
  
  .salary-cell::before {
    content: "Gaji: ";
  }
  
  .training-cell::before {
    content: "Pelatihan: ";
  }
  
  .documents-cell::before {
    content: "Dokumen: ";
  }
  
  .actions-cell::before {
    content: "Aksi: ";
  }
  
  .actions-cell {
    text-align: left;
    width: auto;
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }
  
  .action-buttons {
    justify-content: flex-start;
    gap: var(--spacing-sm);
  }
  
  .btn-icon {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-xs);
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
  }
  
  .pagination-btn {
    min-width: 40px;
    height: 40px;
    font-size: var(--font-size-xs);
  }
  
  .notification {
    top: var(--spacing-md);
    right: var(--spacing-md);
    left: var(--spacing-md);
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .employee-list-container {
    padding: var(--spacing-sm);
  }
  
  .page-title h1 {
    font-size: var(--font-size-lg);
  }
  
  .page-title p {
    font-size: var(--font-size-xs);
  }
  
  .stat-item {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-sm);
  }
  
  .stat-info h3 {
    font-size: 1.25rem;
  }
  
  .controls-section {
    padding: var(--spacing-md);
  }
  
  .modern-table tr {
    padding: var(--spacing-md);
  }
  
  .modern-table td {
    padding: var(--spacing-xs) 0;
  }
  
  .modern-table td::before {
    width: 80px;
    font-size: var(--font-size-xs);
  }
  
  .row-number {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
    min-width: 28px;
  }
  
  .action-buttons {
    gap: var(--spacing-xs);
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-xs);
  }
  
  .employee-name {
    font-size: var(--font-size-sm);
  }
  
  .employee-education {
    font-size: var(--font-size-xs);
  }
  
  .id-info {
    font-size: var(--font-size-xs);
  }
  
  .position-info {
    font-size: var(--font-size-xs);
  }
  
  .total-salary {
    font-size: var(--font-size-xs);
  }
  
  .base-salary {
    font-size: var(--font-size-xs);
  }
  
  .training-count, .doc-count, .no-docs {
    font-size: var(--font-size-xs);
  }
}

/* Tooltip untuk dokumen - dihapus karena tidak user-friendly */
.doc-count {
  cursor: default;
}

/* Employee List Content */
.employee-list-content {
  background: var(--bg-primary);
}

/* Header Sederhana */
</style>
