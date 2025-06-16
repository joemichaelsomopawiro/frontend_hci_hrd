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
                    <button class="btn-icon" @click="viewEmployee(employee.id)" title="Lihat Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" @click="editEmployee(employee.id)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" @click="deleteEmployee(employee.id)" title="Hapus">
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
.employee-list-container {
  min-height: 100vh;
  background: #f7fafd;
  padding: 28px 0;
}

.page-header {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 28px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.07);
  border: 1.5px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
}

.back-btn {
  background: #f3f4f6;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2563eb;
  font-size: 1.25rem;
  transition: background 0.18s;
}
.back-btn:hover {
  background: #e5e7eb;
}

.page-title h1 {
  margin: 0;
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
}
.page-title p {
  margin: 6px 0 0 0;
  color: #64748b;
  font-size: 1.05rem;
}

.header-actions {
  display: flex;
  gap: 14px;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  box-shadow: 0 1px 4px 0 rgb(37 99 235 / 0.07);
  transition: background 0.18s, box-shadow 0.18s;
}
.btn-primary:hover {
  background: #1746b3;
  box-shadow: 0 6px 18px 0 rgb(37 99 235 / 0.13);
}

.employee-list-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.07);
  border: 1.5px solid #e5e7eb;
}

.stats-summary {
  display: flex;
  gap: 22px;
  margin-bottom: 28px;
}
.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px 0 rgb(37 99 235 / 0.04);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #e6edfa;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.stat-icon.success {
  background: #e7f6ef;
  color: #10b981;
}
.stat-info h3 {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: #1e293b;
}
.stat-info p {
  margin: 4px 0 0 0;
  color: #64748b;
  font-size: 1.05rem;
}

.controls-section {
  margin-bottom: 22px;
}
.search-controls {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}
.search-box {
  position: relative;
  flex: 1;
  min-width: 220px;
}
.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
}
.search-input {
  width: 100%;
  padding: 0.78rem 1rem 0.78rem 2.5rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: #f9fafb;
  transition: border-color 0.18s;
}
.search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
}

.filter-select {
  padding: 0.78rem 1.1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: #f9fafb;
  min-width: 170px;
  transition: border-color 0.18s;
}
.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
}
.table-container {
  overflow-x: auto;
}
.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}
.modern-table th {
  background: #f3f4f6;
  padding: 1rem 0.9rem;
  text-align: left;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}
.modern-table td {
  padding: 1rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  background: #fff;
}
.table-row:hover {
  background: #f9fafb;
}
.employee-info strong {
  display: block;
  color: #1e293b;
  font-weight: 600;
}
.employee-info small {
  color: #64748b;
  font-size: 0.88rem;
}
.job-title {
  background: #e6edfa;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 0.98rem;
  font-weight: 600;
}
.salary-info strong {
  display: block;
  color: #1e293b;
  font-weight: 600;
}
.salary-info small {
  color: #64748b;
  font-size: 0.88rem;
}
.training-count {
  background: #e6edfa;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 0.98rem;
  font-weight: 600;
}
.documents-list {
  position: relative;
}
.doc-count {
  background: #f3f4f6;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 7px;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
}
.doc-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  z-index: 1000;
  min-width: 200px;
  display: none;
}
.doc-count:hover .doc-tooltip {
  display: block;
}
.doc-link {
  display: block;
  padding: 7px 0;
  color: #2563eb;
  text-decoration: none;
  font-size: 0.98rem;
}
.doc-link:hover {
  color: #1746b3;
}
.no-docs {
  color: #64748b;
  font-style: italic;
  font-size: 0.98rem;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-icon {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  background: #f3f4f6;
  color: #2563eb;
  transition: background 0.18s, color 0.18s;
}
.btn-icon:hover {
  background: #2563eb;
  color: #fff;
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}
.empty-state i {
  font-size: 60px;
  margin-bottom: 16px;
  color: #e5e7eb;
}
.empty-state h3 {
  margin: 0 0 10px 0;
  color: #1e293b;
}
.empty-state p {
  margin: 0 0 25px 0;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 14px;
}
.pagination-btn {
  background: #f3f4f6;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2563eb;
  font-size: 1.1rem;
  transition: background 0.18s;
}
.pagination-btn:hover:not(:disabled) {
  background: #2563eb;
  color: #fff;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-info {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
}
.notification {
  position: fixed;
  top: 22px;
  right: 22px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
  min-width: 220px;
  box-shadow: 0 8px 24px 0 rgb(0 0 0 / 0.09);
}
.notification.success { background: #10b981; }
.notification.error { background: #ef4444; }
.notification.info { background: #2563eb; }
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@media (max-width: 900px) {
  .employee-list-content { padding: 18px 4px; }
  .page-header { padding: 18px 10px; }
  .stats-summary { flex-direction: column; gap: 10px; }
}
@media (max-width: 600px) {
  .employee-list-content { padding: 6px 2px; }
  .page-header { padding: 10px 2px; }
  .stat-item { padding: 12px 7px; }
  .modern-table th, .modern-table td { padding: 0.7rem 0.4rem; }
}
</style>
