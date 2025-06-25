<template>
  <div class="employee-dashboard">
    <div class="dashboard-header">
      <h1>Dashboard Karyawan</h1>
      <p>Selamat datang, {{ userName }}</p>
      <div class="employee-info">
        <span class="role-badge">{{ userRole }}</span>
        <div class="manager-info" v-if="managerInfo.name">
          <i class="fas fa-user-tie"></i>
          <span>Manager: {{ managerInfo.name }} ({{ managerInfo.type }})</span>
        </div>
      </div>
    </div>

      <!-- Zoom Meeting Section -->
      <div class="zoom-section" v-if="isTodayWorshipDay">
        <div class="section-header">
          <h2>Renungan Pagi</h2>
          <div class="zoom-status">
            <span class="status-badge" :class="zoomTimeStatus.toLowerCase()">{{ zoomTimeStatus }}</span>
          </div>
        </div>
        <div class="zoom-card">
          <div class="zoom-info">
            <i class="fab fa-zoom"></i>
            <div class="zoom-details">
              <h4>Renungan Pagi Bersama</h4>
              <p>Bergabunglah dalam sesi renungan pagi</p>
              <div class="zoom-time">
                <i class="fas fa-clock"></i>
                <span>07:00 - 07:30 WIB</span>
              </div>
            </div>
          </div>
          <div class="zoom-actions">
            <button 
              @click="joinZoomMeeting" 
              class="btn-zoom"
              :disabled="zoomTimeStatus !== 'Hadir'"
            >
              <i class="fab fa-zoom"></i>
              {{ zoomTimeStatus === 'Hadir' ? 'Gabung Zoom' : 'Waktu Absensi Ditutup' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Employee Management Section - Only visible to HR -->
      <div class="action-section" v-if="isHRUser">
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
</template>

<script>
import authService from '../services/authService'
import axios from 'axios'
import { useGaStore } from '../stores/gaStore'
import MyLeaveQuotas from './MyLeaveQuotas.vue'

export default {
  name: 'Dashboard',
  components: {
    MyLeaveQuotas
  },
  data() {
    return {
      gaStore: useGaStore(),
      userName: '',
      userRole: '',
      managerInfo: {
        name: '',
        type: ''
      },
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success'
    }
  },
  computed: {
    isTodayWorshipDay() {
      return this.gaStore.isTodayWorshipDay
    },
    zoomTimeStatus() {
      return this.gaStore.zoomTimeStatus
    },
    isHRUser() {
      // Check if user role is HR or has HR permissions
      return this.userRole === 'HR' || this.userRole === 'HR Manager' || this.userRole === 'Human Resources'
    }
  },
  async mounted() {
    await this.loadUserData();
    await this.loadManagerInfo();
  },
  methods: {
    async loadUserData() {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          console.warn('No user data found in localStorage')
          this.userName = 'Karyawan'
          return
        }
        
        const user = JSON.parse(userStr)
        this.userName = user.nama_lengkap || user.name || user.fullName || 'Karyawan'
        this.userRole = user.role
      } catch (error) {
        console.error('Error loading user data:', error)
        this.userName = 'Karyawan'
      }
    },

    async loadManagerInfo() {
      try {
        const managerRole = this.getManagerForRole(this.userRole);
        this.managerInfo.name = managerRole;
        this.managerInfo.type = managerRole;
      } catch (error) {
        console.error('Error loading manager info:', error)
      }
    },

    getManagerForRole(employeeRole) {
      if (!employeeRole) return 'Atasan';
      const hierarchy = {
        'Finance': 'HR Manager',
        'General Affairs': 'HR Manager',
        'Office Assistant': 'HR Manager',
        'Producer': 'Program Manager',
        'Creative': 'Program Manager',
        'Production': 'Program Manager',
        'Editor': 'Program Manager',
        'Social Media': 'Distribution Manager',
        'Promotion': 'Distribution Manager',
        'Graphic Design': 'Distribution Manager',
        'Hopeline Care': 'Distribution Manager'
      };
      return hierarchy[employeeRole] || 'Atasan';
    },

    joinZoomMeeting() {
      if (this.zoomTimeStatus === 'Hadir') {
        window.open('https://zoom.us/j/your-meeting-id', '_blank')
      }
    },

    generateReport() {
      this.showNotificationMessage('Fitur laporan akan segera tersedia', 'info')
    },

    exportData() {
      this.showNotificationMessage('Fitur export data akan segera tersedia', 'info')
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message
      this.notificationType = type
      this.showNotification = true
      setTimeout(() => {
        this.showNotification = false
      }, 3000)
    }
  }
};
</script>

<style scoped>
.employee-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-header h1 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
}

.dashboard-header p {
  margin: 0 0 1rem 0;
  color: #718096;
  font-size: 1.1rem;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.role-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.875rem;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.action-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-secondary, .btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.quick-actions-card {
  margin-top: 1.5rem;
}

.quick-actions-card h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 700;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.quick-action-item {
  background: rgba(102, 126, 234, 0.05);
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-action-item:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.quick-action-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.quick-action-content h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-weight: 600;
  font-size: 1rem;
}

.quick-action-content p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

/* Zoom Section Styles */
.zoom-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  color: white;
}

.zoom-section .section-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.zoom-section .section-header h2 {
  color: white;
  font-size: 1.75rem;
}

.zoom-status .status-badge {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.zoom-status .status-badge.hadir {
  background: rgba(34, 197, 94, 0.9);
  border-color: rgba(34, 197, 94, 0.5);
}

.zoom-status .status-badge.tutup {
  background: rgba(239, 68, 68, 0.9);
  border-color: rgba(239, 68, 68, 0.5);
}

.zoom-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.zoom-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.zoom-info .fab.fa-zoom {
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.zoom-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.zoom-details p {
  margin: 0 0 1rem 0;
  opacity: 0.9;
}

.zoom-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.btn-zoom {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.btn-zoom:hover:not(:disabled) {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-zoom:disabled {
  background: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
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
  min-width: 250px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.notification.success {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.notification.error {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.notification.info {
  background: linear-gradient(135deg, #4299e1, #3182ce);
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

/* Responsive */
@media (max-width: 768px) {
  .employee-dashboard {
    padding: 1rem;
  }
  
  .dashboard-header,
  .action-section,
  .zoom-section {
    padding: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .action-buttons {
    justify-content: stretch;
  }
  
  .btn-secondary,
  .btn-primary {
    flex: 1;
    justify-content: center;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .zoom-card {
    flex-direction: column;
    text-align: center;
  }
  
  .zoom-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>