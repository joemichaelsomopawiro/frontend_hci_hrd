<template>
  <div class="morning-reflection-container">
    <div class="reflection-header">
      <div class="header-content">
        <div class="header-left">
          <h2>Renungan Pagi</h2>
          <p class="current-time">{{ currentTime }}</p>
          <p class="current-date">{{ currentDate }}</p>
        </div>
        <div class="header-right">
          <div class="status-badge" :class="statusClass">
            <i :class="statusIcon"></i>
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="reflection-content">
      <!-- Today's Status -->
      <div class="today-status">
        <h3>Status Hari Ini</h3>
        <div class="status-card" :class="todayStatusClass">
          <i :class="todayStatusIcon"></i>
          <div class="status-info">
            <h4>{{ todayStatusTitle }}</h4>
            <p>{{ todayStatusDescription }}</p>
          </div>
        </div>
      </div>

      <!-- Attendance Section -->
      <div class="attendance-section" v-if="isTodayWorshipDay">
        <h3>Absensi Renungan</h3>
        <div class="attendance-card">
          <div class="attendance-info">
            <p><strong>Nama:</strong> {{ userName }}</p>
            <p><strong>Role:</strong> {{ userRole }}</p>
            <p><strong>Waktu:</strong> {{ currentTime }}</p>
          </div>
          
          <div class="attendance-actions">
            <button 
              v-if="!hasAttendedToday" 
              @click="markAttendance" 
              class="btn-attend"
              :disabled="isLoading"
            >
              <i class="fas fa-check-circle"></i>
              {{ isLoading ? 'Memproses...' : 'Hadir Renungan' }}
            </button>
            
            <div v-else class="attended-status">
              <i class="fas fa-check-circle"></i>
              <span>Sudah Absen Hari Ini</span>
              <small>{{ attendanceTime }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Zoom Meeting Section -->
      <div class="zoom-section" v-if="isTodayWorshipDay">
        <h3>Link Zoom Renungan</h3>
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
              :disabled="!canJoinZoom"
            >
              <i class="fab fa-zoom"></i>
              {{ zoomButtonText }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Attendance History -->
      <div class="history-section">
        <h3>Riwayat Absensi Renungan</h3>
        <div class="history-list">
          <div 
            v-for="record in recentAttendance" 
            :key="record.id"
            class="history-item"
          >
            <div class="history-date">
              <span class="date">{{ formatDate(record.date) }}</span>
              <span class="day">{{ getDayName(record.date) }}</span>
            </div>
            <div class="history-status">
              <i :class="getAttendanceIcon(record.status)"></i>
              <span>{{ getAttendanceText(record.status) }}</span>
            </div>
            <div class="history-time">
              {{ record.time || '-' }}
            </div>
          </div>
          
          <div v-if="recentAttendance.length === 0" class="no-history">
            <i class="fas fa-calendar-times"></i>
            <p>Belum ada riwayat absensi renungan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useGaStore } from '../stores/gaStore'

export default {
  name: 'MorningReflection',
  setup() {
    const store = useGaStore()
    const currentTime = ref('')
    const currentDate = ref('')
    const timeInterval = ref(null)
    const isLoading = ref(false)
    const hasAttendedToday = ref(false)
    const attendanceTime = ref('')
    const recentAttendance = ref([])

    // Update time function
    const updateTime = () => {
      const now = new Date()
      const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
      
      currentTime.value = jakartaTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      currentDate.value = jakartaTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Computed properties
    const userName = computed(() => {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) return 'User'
        const user = JSON.parse(userStr)
        return user.nama_lengkap || user.name || 'User'
      } catch {
        return 'User'
      }
    })

    const userRole = computed(() => {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) return 'Employee'
        const user = JSON.parse(userStr)
        return user.role || user.position || 'Employee'
      } catch {
        return 'Employee'
      }
    })

    const isTodayWorshipDay = computed(() => store.isTodayWorshipDay)
    
    const todayStatusClass = computed(() => {
      return isTodayWorshipDay.value ? 'worship-day' : 'regular-day'
    })
    
    const todayStatusIcon = computed(() => {
      return isTodayWorshipDay.value ? 'fas fa-praying-hands' : 'fas fa-briefcase'
    })
    
    const todayStatusTitle = computed(() => {
      return isTodayWorshipDay.value ? 'Hari Renungan' : 'Hari Kerja Biasa'
    })
    
    const todayStatusDescription = computed(() => {
      return isTodayWorshipDay.value 
        ? 'Hari ini adalah hari renungan. Silakan bergabung dalam sesi renungan pagi.'
        : 'Hari ini adalah hari kerja biasa. Tidak ada sesi renungan.'
    })

    const statusClass = computed(() => {
      const status = store.zoomTimeStatus
      return {
        'status-before': status === 'Tutup',
        'status-active': status === 'Hadir', 
        'status-after': status === 'Tutup'
      }
    })

    const statusIcon = computed(() => {
      const status = store.zoomTimeStatus
      switch(status) {
        case 'Hadir': return 'fas fa-video'
        case 'Tutup': return 'fas fa-clock'
        default: return 'fas fa-info-circle'
      }
    })

    const statusText = computed(() => {
      const status = store.zoomTimeStatus
      switch(status) {
        case 'Hadir': return 'Sedang Berlangsung'
        case 'Tutup': return 'Belum Dimulai / Sudah Selesai'
        default: return 'Tidak Aktif'
      }
    })

    const canJoinZoom = computed(() => {
      return isTodayWorshipDay.value && (store.zoomTimeStatus === 'Hadir' || store.testingMode)
    })

    const zoomButtonText = computed(() => {
      if (!isTodayWorshipDay.value) return 'Tidak Ada Renungan'
      if (store.zoomTimeStatus === 'Hadir' || store.testingMode) return 'Gabung Sekarang'
      if (store.zoomTimeStatus === 'Tutup') return 'Belum Dimulai / Sudah Selesai'
      return 'Tidak Tersedia'
    })

    // Methods
    const markAttendance = async () => {
      if (isLoading.value || hasAttendedToday.value) return
      
      isLoading.value = true
      try {
        const attendanceData = {
          user_name: userName.value,
          user_role: userRole.value,
          attendance_time: new Date().toISOString(),
          type: 'morning_reflection'
        }
        
        await store.submitAttendance(attendanceData)
        hasAttendedToday.value = true
        attendanceTime.value = currentTime.value
        
        // Refresh attendance history
        await loadAttendanceHistory()
        
      } catch (error) {
        console.error('Error marking attendance:', error)
        alert('Gagal mencatat kehadiran. Silakan coba lagi.')
      } finally {
        isLoading.value = false
      }
    }

    const joinZoomMeeting = () => {
      if (!canJoinZoom.value) return
      store.joinZoomMeeting()
    }

    const loadAttendanceHistory = async () => {
      try {
        // Load recent 7 days attendance history
        const history = await store.fetchMorningReflectionHistory()
        recentAttendance.value = history.slice(0, 7)
        
        // Check if user attended today
        const today = new Date().toISOString().split('T')[0]
        const todayRecord = history.find(record => 
          record.date === today && record.user_name === userName.value
        )
        
        if (todayRecord) {
          hasAttendedToday.value = true
          attendanceTime.value = todayRecord.time
        }
      } catch (error) {
        console.error('Error loading attendance history:', error)
      }
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const getDayName = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', { weekday: 'short' })
    }

    const getAttendanceIcon = (status) => {
      switch(status) {
        case 'present': return 'fas fa-check-circle text-success'
        case 'absent': return 'fas fa-times-circle text-danger'
        default: return 'fas fa-minus-circle text-muted'
      }
    }

    const getAttendanceText = (status) => {
      switch(status) {
        case 'present': return 'Hadir'
        case 'absent': return 'Tidak Hadir'
        default: return 'Tidak Ada Data'
      }
    }

    // Lifecycle
    onMounted(() => {
      updateTime()
      timeInterval.value = setInterval(updateTime, 1000)
      store.updateCurrentTime()
      loadAttendanceHistory()
    })

    onUnmounted(() => {
      if (timeInterval.value) {
        clearInterval(timeInterval.value)
      }
    })

    return {
      currentTime,
      currentDate,
      isLoading,
      hasAttendedToday,
      attendanceTime,
      recentAttendance,
      userName,
      userRole,
      isTodayWorshipDay,
      todayStatusClass,
      todayStatusIcon,
      todayStatusTitle,
      todayStatusDescription,
      statusClass,
      statusIcon,
      statusText,
      canJoinZoom,
      zoomButtonText,
      markAttendance,
      joinZoomMeeting,
      formatDate,
      getDayName,
      getAttendanceIcon,
      getAttendanceText
    }
  }
}
</script>

<style scoped>
.morning-reflection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.reflection-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.current-time {
  font-size: 18px;
  font-weight: 500;
  margin: 4px 0;
}

.current-date {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.status-badge.status-before {
  background: rgba(255, 193, 7, 0.2);
}

.status-badge.status-active {
  background: rgba(40, 167, 69, 0.2);
}

.status-badge.status-after {
  background: rgba(108, 117, 125, 0.2);
}

.reflection-content {
  display: grid;
  gap: 24px;
}

.today-status h3,
.attendance-section h3,
.zoom-section h3,
.history-section h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.status-card.worship-day {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-color: #fd7e14;
}

.status-card.regular-day {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
}

.status-card i {
  font-size: 32px;
  color: #495057;
}

.status-info h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.status-info p {
  margin: 0;
  color: #6c757d;
}

.attendance-card,
.zoom-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.attendance-info {
  margin-bottom: 16px;
}

.attendance-info p {
  margin: 4px 0;
  color: #495057;
}

.btn-attend {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-attend:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-attend:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.attended-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #28a745;
  font-weight: 500;
}

.attended-status small {
  color: #6c757d;
  margin-left: 8px;
}

.zoom-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zoom-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.zoom-info i {
  font-size: 32px;
  color: #0066cc;
}

.zoom-details h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.zoom-details p {
  margin: 0 0 8px 0;
  color: #6c757d;
}

.zoom-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #495057;
  font-size: 14px;
}

.btn-zoom {
  background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-zoom:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.btn-zoom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #6c757d;
}

.history-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date .date {
  font-weight: 500;
  color: #495057;
}

.history-date .day {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-time {
  text-align: right;
  color: #6c757d;
  font-size: 14px;
}

.no-history {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-history i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-muted {
  color: #6c757d !important;
}

@media (max-width: 768px) {
  .morning-reflection-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .zoom-card {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .history-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: center;
  }
}
</style>