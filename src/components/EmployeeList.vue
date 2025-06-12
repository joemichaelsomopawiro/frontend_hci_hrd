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
          <div class="stat-icon primary">
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
              <tr v-for="employee in paginatedEmployees" :key="employee.id" class="table-row">
                <td>
                  <div class="employee-info">
                    <strong>{{ employee.nama_lengkap }}</strong>
                    <small>{{ employee.tingkat_pendidikan }}</small>
                  </div>
                </td>
                <td>{{ employee.nik }}</td>
                <td>{{ employee.nip || '-' }}</td>
                <td>
                  <span class="job-title">{{ employee.jabatan_saat_ini }}</span>
                </td>
                <td>
                  <div class="salary-info">
                    <strong>Rp {{ formatCurrency(calculateTotalSalary(employee)) }}</strong>
                    <small>Gaji: {{ formatCurrency(employee.gaji_pokok) }}</small>
                  </div>
                </td>
                <td>
                  <span class="training-count">
                    {{ employee.trainings ? employee.trainings.length : 0 }} pelatihan
                  </span>
                </td>
                <td>
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
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon view" @click="viewEmployee(employee.id)" title="Lihat Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit" @click="editEmployee(employee.id)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" @click="deleteEmployee(employee.id)" title="Hapus">
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
        console.error('Error fetching employees:', error)
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
          console.error('Error deleting employee:', error)
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
.employee-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-header {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.back-btn {
  background: #f8f9fa;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.back-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.page-title h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

.page-title p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 15px;
  margin-bottom: 25px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.employee-list-content {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 14px;
}

.controls-section {
  margin-bottom: 25px;
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
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  min-width: 180px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.table-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.modern-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.modern-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.table-row:hover {
  background: #f8f9fa;
}

.employee-info strong {
  display: block;
  color: #2c3e50;
  font-weight: 600;
}

.employee-info small {
  color: #6c757d;
  font-size: 12px;
}

.job-title {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.salary-info strong {
  display: block;
  color: #2c3e50;
  font-weight: 600;
}

.salary-info small {
  color: #6c757d;
  font-size: 12px;
}

.training-count {
  background: #f3e5f5;
  color: #7b1fa2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.documents-list {
  position: relative;
}

.doc-count {
  background: #fff3e0;
  color: #f57c00;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.doc-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
  display: none;
}

.doc-count:hover .doc-tooltip {
  display: block;
}

.doc-link {
  display: block;
  padding: 5px 0;
  color: #667eea;
  text-decoration: none;
  font-size: 12px;
}

.doc-link:hover {
  color: #764ba2;
}

.no-docs {
  color: #6c757d;
  font-style: italic;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-icon.view {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-icon.view:hover {
  background: #bbdefb;
  transform: translateY(-2px);
}

.btn-icon.edit {
  background: #fff3e0;
  color: #f57c00;
}

.btn-icon.edit:hover {
  background: #ffe0b2;
  transform: translateY(-2px);
}

.btn-icon.delete {
  background: #ffebee;
  color: #d32f2f;
}

.btn-icon.delete:hover {
  background: #ffcdd2;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #dee2e6;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #495057;
}

.empty-state p {
  margin: 0 0 25px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 25px;
  padding: 20px;
}

.pagination-btn {
  background: #f8f9fa;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  color: #495057;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
}

.notification.error {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
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
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    font-size: 12px;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 10px 8px;
  }
}
</style>