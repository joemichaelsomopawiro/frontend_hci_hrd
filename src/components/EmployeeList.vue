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

/* Tambahkan CSS ini di bagian <style scoped> */

/* Kolom nomor urut */
.number-column {
  width: 60px;
  text-align: center;
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.number-cell {
  text-align: center;
  background: #f8fafc;
  border-right: 2px solid #e2e8f0;
}

.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Styling untuk field dengan ikon */
.field-icon {
  color: #6b7280;
  margin-right: 8px;
  font-size: 0.875rem;
  width: 16px;
  text-align: center;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-icon {
  color: #3b82f6;
  font-size: 1rem;
}

.employee-education {
  color: #6b7280;
  font-style: italic;
  margin-left: 24px;
}

.nik-info, .nip-info {
  display: flex;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.job-title {
  display: flex;
  align-items: center;
  background: #eff6ff;
  padding: 6px 12px;
  border-radius: 20px;
  color: #1d4ed8;
  font-weight: 500;
  font-size: 0.875rem;
}

.salary-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-salary {
  display: flex;
  align-items: center;
  color: #059669;
  font-weight: 600;
}

.base-salary {
  color: #6b7280;
  font-size: 0.75rem;
  margin-left: 24px;
}

.training-info {
  display: flex;
  align-items: center;
  color: #7c3aed;
}

.documents-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.documents-list {
  position: relative;
}

.doc-count {
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
}

.no-docs {
  color: #9ca3af;
  font-style: italic;
}

/* Action buttons styling */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.view-btn {
  background: #eff6ff;
  color: #2563eb;
}

.view-btn:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

.edit-btn {
  background: #fef3c7;
  color: #d97706;
}

.edit-btn:hover {
  background: #fde68a;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

/* Responsive table */
.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row:hover .number-cell {
  background: #f1f5f9;
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
