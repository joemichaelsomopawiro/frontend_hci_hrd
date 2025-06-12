<template>
  <div class="dashboard-container">
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ employees.length }}</h3>
            <p>Total Karyawan</p>
            <span class="stat-change positive">+{{ newEmployeesThisMonth }} bulan ini</span>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ activeEmployees }}</h3>
            <p>Karyawan Aktif</p>
            <span class="stat-change positive">{{ Math.round((activeEmployees/employees.length)*100) || 0 }}% aktif</span>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalTrainings }}</h3>
            <p>Total Pelatihan</p>
            <span class="stat-change">Sertifikasi karyawan</span>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-content">
            <h3>Rp {{ formatCurrency(totalSalary) }}</h3>
            <p>Total Gaji Bulanan</p>
            <span class="stat-change positive">Termasuk tunjangan</span>
          </div>
        </div>
      </div>

      <!-- Action Section -->
      <div class="action-section">
        <div class="section-header">
          <h2>Manajemen Karyawan</h2>
          <router-link to="/add-employee" class="btn-primary">
            <i class="fas fa-plus"></i>
            Tambah Karyawan Baru
          </router-link>
        </div>
      </div>

      <!-- Employee Table -->
      <div class="table-section">
        <div class="table-header">
          <h3>Daftar Karyawan</h3>
          <div class="table-controls">
            <input 
              type="text" 
              placeholder="Cari karyawan..." 
              v-model="searchQuery"
              class="search-input"
            />
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
          <h3>Belum ada data karyawan</h3>
          <p>Mulai dengan menambahkan karyawan pertama Anda</p>
          <router-link to="/add-employee" class="btn-primary">
            Tambah Karyawan
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
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      employees: [],
      searchQuery: '',
      filterDepartment: '',
      currentPage: 1,
      itemsPerPage: 10,
      apiUrl: 'http://localhost:8000',
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
    };
  },
  computed: {
    activeEmployees() {
      return this.employees.length;
    },
    newEmployeesThisMonth() {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return this.employees.filter(emp => {
        const startDate = new Date(emp.tanggal_mulai_kerja);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      }).length;
    },
    totalTrainings() {
      return this.employees.reduce((total, emp) => {
        return total + (emp.trainings ? emp.trainings.length : 0);
      }, 0);
    },
    totalSalary() {
      return this.employees.reduce((total, emp) => {
        return total + this.calculateTotalSalary(emp);
      }, 0);
    },
    filteredEmployees() {
      let filtered = this.employees;
      
      if (this.searchQuery) {
        filtered = filtered.filter(emp => 
          emp.nama_lengkap.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          emp.nik.includes(this.searchQuery) ||
          emp.jabatan_saat_ini.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      if (this.filterDepartment) {
        filtered = filtered.filter(emp => 
          emp.jabatan_saat_ini.toLowerCase().includes(this.filterDepartment.toLowerCase())
        );
      }
      
      return filtered;
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredEmployees.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/employees`);
        this.employees = response.data;
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showNotificationMessage('Gagal mengambil data karyawan', 'error');
      }
    },
    calculateTotalSalary(employee) {
      const gaji = parseFloat(employee.gaji_pokok) || 0;
      const tunjangan = parseFloat(employee.tunjangan) || 0;
      const bonus = parseFloat(employee.bonus) || 0;
      return gaji + tunjangan + bonus;
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount);
    },
    viewEmployee(id) {
      this.$router.push(`/employee/${id}`);
    },
    editEmployee(id) {
      this.$router.push(`/edit-employee/${id}`);
    },
    async deleteEmployee(id) {
      if (confirm('Apakah Anda yakin ingin menghapus karyawan ini beserta semua data terkait?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${id}`);
          this.fetchEmployees();
          this.showNotificationMessage('Karyawan berhasil dihapus', 'success');
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus karyawan', 'error');
        }
      }
    },
    showNotificationMessage(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }
  },
};
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.dashboard-content {
  width: 100%;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border-left: 4px solid;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-card.primary { border-left-color: var(--primary-color); }
.stat-card.success { border-left-color: var(--success-color); }
.stat-card.warning { border-left-color: var(--warning-color); }
.stat-card.info { border-left-color: var(--info-color); }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon { background-color: rgba(37, 99, 235, 0.1); color: var(--primary-color); }
.stat-card.success .stat-icon { background-color: rgba(16, 185, 129, 0.1); color: var(--success-color); }
.stat-card.warning .stat-icon { background-color: rgba(245, 158, 11, 0.1); color: var(--warning-color); }
.stat-card.info .stat-icon { background-color: rgba(6, 182, 212, 0.1); color: var(--info-color); }

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--gray-900);
}

.stat-content p {
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 500;
}

.stat-change.positive {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

/* Action Section */
.action-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* Search and Filter */
.search-filter {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.search-input:focus, .filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th {
  background-color: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
}

.employee-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
}

.employee-table tbody tr:hover {
  background-color: var(--gray-50);
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
}

.employee-info {
  display: flex;
  align-items: center;
}

.employee-details h4 {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--gray-900);
}

.employee-details p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-badge.inactive {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.training-count, .doc-count {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.documents-list {
  position: relative;
}

.doc-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  display: none;
  min-width: 200px;
}

.documents-list:hover .doc-tooltip {
  display: block;
}

.doc-link {
  display: block;
  padding: 0.25rem 0;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.doc-link:hover {
  text-decoration: underline;
}

.no-docs {
  color: var(--gray-400);
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon.view {
  background-color: rgba(6, 182, 212, 0.1);
  color: var(--info-color);
}

.btn-icon.edit {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.btn-icon.delete {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.btn-icon:hover {
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.empty-state i {
  font-size: 4rem;
  color: var(--gray-400);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray-500);
  margin-bottom: 2rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--gray-300);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 500;
  color: var(--gray-700);
}

/* Notification */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background-color: var(--success-color);
}

.notification.error {
  background-color: var(--error-color);
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

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .employee-table {
    min-width: 800px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
