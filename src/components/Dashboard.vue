<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ employees.length }}</h3>
            <p>Total Karyawan</p>
            <span class="stat-change positive">+{{ newEmployeesThisMonth }} bulan ini</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ activeEmployees }}</h3>
            <p>Karyawan Aktif</p>
            <span class="stat-change positive">{{ Math.round((activeEmployees/employees.length)*100) || 0 }}% aktif</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalTrainings }}</h3>
            <p>Total Pelatihan</p>
            <span class="stat-change">Sertifikasi karyawan</span>
          </div>
        </div>
        <div class="stat-card">
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

      <MyLeaveQuotas />
      <div v-if="showNotification" class="notification" :class="notificationType">
        <i :class="notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ notificationMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// 1. IMPORT KOMPONEN BARU
import MyLeaveQuotas from '@/components/MyLeaveQuotas.vue';

export default {
  name: 'Dashboard',
  // 2. DAFTARKAN KOMPONEN BARU
  components: {
    MyLeaveQuotas,
  },
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
:root {
  --primary-color: #2563eb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --info-color: #06b6d4;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
  --shadow: 0 2px 8px 0 rgb(0 0 0 / 0.07);
  --shadow-lg: 0 8px 24px 0 rgb(0 0 0 / 0.09);
}

.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background: var(--gray-50);
}
.dashboard-content {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 2rem 1.5rem;
  box-shadow: var(--shadow);
  border: 1.5px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px) scale(1.01);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.quick-actions-card {
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 1.7rem 1.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.quick-actions-card h3 {
  margin: 0 0 1.3rem 0;
  font-size: 1.13rem;
  font-weight: 700;
  color: var(--text-primary);
}
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
}
.quick-action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1.5px solid var(--gray-100);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background: var(--gray-50);
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
}
.quick-action-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px) scale(1.01);
  background: var(--bg-secondary);
}
.quick-action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}
.quick-action-content h4 {
  margin: 0 0 0.18rem 0;
  font-weight: 600;
  color: var(--gray-900);
  font-size: 1.02rem;
}
.quick-action-content p {
  margin: 0;
  font-size: 0.93rem;
  color: var(--gray-600);
}

/* Notification */
.notification {
  position: fixed;
  top: 22px;
  right: 22px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
  min-width: 220px;
  box-shadow: var(--shadow-lg);
}
.notification.success { background: var(--success-color); }
.notification.error { background: var(--warning-color); }
.notification.info { background: var(--info-color); }

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Responsive */
@media (max-width: 900px) {
  .dashboard-content { padding: 1.2rem 0.5rem; }
  .stats-grid { gap: 1rem; }
  .quick-actions-grid { grid-template-columns: 1fr; }
  .stat-card { flex-direction: column; align-items: flex-start; }
  .section-header { flex-direction: column; gap: 0.7rem; align-items: stretch; }
}
@media (max-width: 600px) {
  .dashboard-content { padding: 0.5rem 0.1rem; }
  .stat-card { padding: 1.2rem 0.8rem; }
  .quick-actions-card { padding: 1.1rem 0.7rem; }
}
</style>