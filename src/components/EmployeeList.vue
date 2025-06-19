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
          <div class="stat-icon success">
            <i class="fas fa-user-check"></i>
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
            <i class="fas fa-search"></i>
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
                <td class="number-cell">
                  <span class="row-number">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
                </td>
                <td>
                  <div class="employee-info">
                    <div class="employee-name">
                      <i class="fas fa-user employee-icon"></i>
                      <strong>{{ employee.nama_lengkap }}</strong>
                    </div>
                    <small class="employee-education">{{ employee.tingkat_pendidikan }}</small>
                  </div>
                </td>
                <td>
                  <div class="nik-info">
                    <i class="fas fa-id-card field-icon"></i>
                    <span>{{ employee.nik }}</span>
                  </div>
                </td>
                <td>
                  <div class="nip-info">
                    <i class="fas fa-id-badge field-icon"></i>
                    <span>{{ employee.nip || '-' }}</span>
                  </div>
                </td>
                <td>
                  <span class="job-title">
                    <i class="fas fa-briefcase field-icon"></i>
                    {{ employee.jabatan_saat_ini }}
                  </span>
                </td>
                <td>
                  <div class="salary-info">
                    <div class="total-salary">
                      <i class="fas fa-money-bill-wave field-icon"></i>
                      <strong>Rp {{ formatCurrency(calculateTotalSalary(employee)) }}</strong>
                    </div>
                    <small class="base-salary">Gaji Pokok: Rp {{ formatCurrency(employee.gaji_pokok) }}</small>
                  </div>
                </td>
                <td>
                  <div class="training-info">
                    <i class="fas fa-graduation-cap field-icon"></i>
                    <span class="training-count">
                      {{ employee.trainings ? employee.trainings.length : 0 }} pelatihan
                    </span>
                  </div>
                </td>
                <td>
                  <div class="documents-info">
                    <i class="fas fa-folder field-icon"></i>
                    <div class="documents-list">
                      <span v-if="employee.documents && employee.documents.length" class="doc-count">
                        {{ employee.documents.length }} dokumen
                        <div class="doc-tooltip">
                          <a
                            v-for="doc in employee.documents"
                            :key="doc.id"
                            :href="`${apiUrl}/storage/${doc.file_path}`"
                            target="_blank"
                            class="doc-link"
                          >
                            <i class="fas fa-file-pdf"></i>
                            {{ doc.document_type }}
                          </a>
                        </div>
                      </span>
                      <span v-else class="no-docs">Tidak ada</span>
                    </div>
                  </div>
                </td>
                <td>
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
      apiUrl: 'http://localhost:8000'
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
/* Container utama */
.employee-list-container {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.page-header {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.page-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 600;
}

.stat-item {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.stat-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
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

/* Header */
.page-header {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.back-btn:hover {
  background: #4b5563;
}

.page-title h1 {
  margin: 0;
  color: var(--text-primary); /* Ganti dari #1f2937 */
  font-size: 1.8rem;
  font-weight: 600;
}

.page-title p {
  margin: 5px 0 0 0;
  color: var(--text-secondary); /* Ganti dari #6b7280 */
  font-size: 0.9rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stat-icon.success {
  background: #10b981;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Search Section */
.controls-section {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.search-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  font-size: 0.9rem;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: var(--bg-secondary);
  font-size: 0.9rem;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Tabel Sederhana */
.table-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-collapse: collapse;
}

.modern-table th {
  background: var(--bg-tertiary); /* Ganti dari #f8f9fa */
  color: var(--text-primary); /* Ganti dari #374151 */
  font-weight: 600;
  padding: 15px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

/* Tambahkan hover effect untuk table row */
.modern-table tbody tr:hover {
  background: var(--bg-tertiary) !important;
}

.modern-table td {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 15px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.modern-table tr:hover {
  background-color: #f9fafb;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

/* Nomor urut */
.number-column {
  width: 70px;
  text-align: center;
}

.number-cell {
  text-align: center;
  width: 60px;
}

.row-number {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
}

/* Info karyawan */
.employee-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.employee-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.employee-icon {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.employee-education {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* Field dengan icon */
.nik-info, .nip-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-icon {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.job-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

/* Salary info */
.salary-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.total-salary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #059669;
}

.base-salary {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* Training dan Documents */
.training-info, .documents-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.training-count, .doc-count {
  color: var(--text-primary);
}

.no-docs {
  color: #9ca3af;
  font-style: italic;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.view-btn {
  background: #3b82f6;
  color: white;
}

.view-btn:hover {
  background: #2563eb;
}

.edit-btn {
  background: #f59e0b;
  color: white;
}

.edit-btn:hover {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

/* Pagination Sederhana */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0 10px;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 15px;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Notifikasi */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.notification.success {
  background: #10b981;
}

.notification.error {
  background: #ef4444;
}

.notification.info {
  background: #3b82f6;
}

/* Responsive */
@media (max-width: 768px) {
  .employee-list-container {
    padding: 15px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 10px 8px;
  }
  
  .btn-icon {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
}
</style>
