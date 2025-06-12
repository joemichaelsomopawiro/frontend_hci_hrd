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
          <div class="action-buttons">
            <router-link to="/lihat-data-pegawai" class="btn-secondary">
              <i class="fas fa-list"></i>
              Lihat Data Pegawai
            </router-link>
            <router-link to="/tambah-pegawai-baru" class="btn-primary">
              <i class="fas fa-plus"></i>
              Tambah Pegawai Baru
            </router-link>
          </div>
        </div>
        
        <!-- Quick Actions Card -->
        <div class="quick-actions-card">
          <h3>Aksi Cepat</h3>
          <div class="quick-actions-grid">
            <router-link to="/lihat-data-pegawai" class="quick-action-item">
              <div class="quick-action-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="quick-action-content">
                <h4>Data Pegawai</h4>
                <p>Lihat dan kelola semua data pegawai</p>
              </div>
            </router-link>
            
            <router-link to="/tambah-pegawai-baru" class="quick-action-item">
              <div class="quick-action-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <div class="quick-action-content">
                <h4>Tambah Pegawai</h4>
                <p>Daftarkan pegawai baru ke sistem</p>
              </div>
            </router-link>
            
            <div class="quick-action-item" @click="generateReport">
              <div class="quick-action-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <div class="quick-action-content">
                <h4>Laporan</h4>
                <p>Generate laporan pegawai</p>
              </div>
            </div>
            
            <div class="quick-action-item" @click="exportData">
              <div class="quick-action-icon">
                <i class="fas fa-download"></i>
              </div>
              <div class="quick-action-content">
                <h4>Export Data</h4>
                <p>Download data dalam format Excel</p>
              </div>
            </div>
          </div>
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
      apiUrl: 'http://localhost:8000',
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
    };
  },
  computed: {
    activeEmployees() {
      return this.employees.filter(emp => emp.status === 'active' || !emp.status).length;
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
    }
  },
  mounted() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/employees`);
        this.employees = response.data.data || response.data || [];
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showNotificationMessage('Gagal mengambil data karyawan', 'error');
        this.employees = [];
      }
    },
    calculateTotalSalary(employee) {
      const gaji = parseFloat(employee.gaji_pokok) || 0;
      const tunjangan = parseFloat(employee.tunjangan_jabatan) || 0;
      const bonus = parseFloat(employee.bonus) || 0;
      return gaji + tunjangan + bonus;
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount);
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    generateReport() {
      this.showNotificationMessage('Fitur laporan akan segera tersedia', 'info');
    },
    exportData() {
      this.showNotificationMessage('Fitur export data akan segera tersedia', 'info');
    },
    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
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

.section-header h2, .section-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), #6366f1);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
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

.btn-secondary {
  background: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

/* Quick Actions Card */
.quick-actions-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.quick-actions-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--gray-100);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-action-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.quick-action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color), #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.quick-action-content h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: var(--gray-900);
}

.quick-action-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

/* Recent Activity Section */
.recent-activity-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.view-all-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.view-all-link:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--gray-100);
  border-radius: 8px;
  transition: all 0.2s;
}

.activity-item:hover {
  background: var(--gray-50);
  border-color: var(--gray-200);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: var(--gray-900);
}

.activity-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.activity-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-activity {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--gray-500);
}

.empty-activity i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--gray-300);
}

.empty-activity p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
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
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-icon.view {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary-color);
}

.btn-icon.view:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
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
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1000;
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

.notification.info {
  background: var(--info-color);
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
