<template>
  <div class="dashboard-container">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ employees.length }}</h3>
          <p>Total Karyawan</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ activeEmployees }}</h3>
          <p>Karyawan Aktif</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalTrainings }}</h3>
          <p>Total Pelatihan</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="stat-content">
          <h3>Rp {{ formatCurrency(totalSalary) }}</h3>
          <p>Total Gaji Bulanan</p>
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
          <div class="zoom-icon-container">
            <i class="fab fa-zoom"></i>
          </div>
          <div class="zoom-details">
            <h4>Renungan Pagi Bersama</h4>
            <p>Bergabunglah dalam sesi renungan pagi untuk memulai hari dengan penuh berkat</p>
            <div class="zoom-time">
              <i class="fas fa-clock"></i>
              <span>07:00 - 07:30 WIB</span>
            </div>
            <div class="zoom-participants">
              <i class="fas fa-users"></i>
              <span>Seluruh Karyawan Hope Channel Indonesia</span>
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
            {{ zoomTimeStatus === 'Hadir' ? 'Gabung Zoom Meeting' : 'Waktu Absensi Ditutup' }}
          </button>
          <div class="zoom-status-info" v-if="zoomTimeStatus !== 'Hadir'">
            <i class="fas fa-info-circle"></i>
            <span>Meeting hanya tersedia pada jam 07:00 - 07:30 WIB</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Notification -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <i class="fas" :class="{
        'fa-check-circle': notificationType === 'success',
        'fa-exclamation-triangle': notificationType === 'warning',
        'fa-times-circle': notificationType === 'error',
        'fa-info-circle': notificationType === 'info'
      }"></i>
      <span>{{ notificationMessage }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useGaStore } from '../stores/gaStore'

export default {
  name: 'EmployeeDashboard',
  setup() {
    const gaStore = useGaStore()
    const employees = ref([])
    const loading = ref(true)
    const error = ref(null)
    const showNotification = ref(false)
    const notificationMessage = ref('')
    const notificationType = ref('success')

    const activeEmployees = computed(() => {
      return employees.value.filter(emp => emp.status === 'active').length
    })

    const newEmployeesThisMonth = computed(() => {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      return employees.value.filter(emp => {
        const createdDate = new Date(emp.created_at)
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear
      }).length
    })

    const totalTrainings = computed(() => {
      return employees.value.reduce((total, emp) => {
        return total + (emp.trainings ? emp.trainings.length : 0)
      }, 0)
    })

    const totalSalary = computed(() => {
      return employees.value.reduce((total, emp) => {
        const salary = parseFloat(emp.gaji_pokok || 0)
        const allowance = parseFloat(emp.tunjangan || 0)
        return total + salary + allowance
      }, 0)
    })

    const isTodayWorshipDay = computed(() => {
      return gaStore.isTodayWorshipDay
    })

    const zoomTimeStatus = computed(() => {
      return gaStore.zoomTimeStatus
    })

    const fetchEmployees = async () => {
      try {
        loading.value = true
        const response = await axios.get('http://localhost:8000/api/employees')
        employees.value = response.data.data || response.data
      } catch (err) {
        console.error('Error fetching employees:', err)
        error.value = 'Gagal memuat data karyawan'
        employees.value = []
      } finally {
        loading.value = false
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID').format(amount)
    }

    const joinZoomMeeting = () => {
      if (zoomTimeStatus.value === 'Hadir') {
        window.open('https://zoom.us/j/your-meeting-id', '_blank')
      }
    }

    const showNotificationMessage = (message, type = 'success') => {
      notificationMessage.value = message
      notificationType.value = type
      showNotification.value = true
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }

    onMounted(() => {
      fetchEmployees()
    })

    return {
      employees,
      loading,
      error,
      activeEmployees,
      newEmployeesThisMonth,
      totalTrainings,
      totalSalary,
      isTodayWorshipDay,
      zoomTimeStatus,
      formatCurrency,
      joinZoomMeeting,
      showNotification,
      notificationMessage,
      notificationType,
      showNotificationMessage
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

.stat-content p {
  margin: 0.25rem 0 0 0;
  color: #718096;
  font-weight: 500;
}

.zoom-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
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
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.75rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.hadir {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.status-badge.tutup {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.status-badge.belum {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
}

.zoom-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
}

.zoom-info {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.zoom-icon-container {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
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
  line-height: 1.6;
}

.zoom-time, .zoom-participants {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.zoom-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-zoom {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.btn-zoom:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn-zoom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
}

.zoom-status-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  font-size: 0.875rem;
  justify-content: center;
}

.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  color: white;
}

.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state {
  background: rgba(245, 101, 101, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #48bb78;
}

.notification.error {
  background: #f56565;
}

.notification.warning {
  background: #ed8936;
}

.notification.info {
  background: #4299e1;
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
  .dashboard-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .zoom-info {
    flex-direction: column;
    text-align: center;
  }
  
  .zoom-icon-container {
    align-self: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
