<template>
  <div class="dashboard-container">
    <!-- Header Dashboard -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
        <h1>Dashboard</h1>
        <p>Selamat datang kembali, {{ userName }}!</p>
      </div>
        <div class="user-profile">
          <div class="user-avatar">
            <img v-if="userAvatar" 
                 :src="userAvatar" 
                 alt="Profile Avatar" 
                 class="avatar-image" />
            <span v-else>{{ getInitials(userName) }}</span>
        </div>
          <div class="user-details">
          <strong>{{ userName }}</strong>
          <span>{{ userRole }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Renungan Pagi Card -->
    <div class="worship-card-wrapper">
      <div class="worship-card" :class="{ 'active': zoomCountdown.canJoin, 'ended': zoomCountdown.ended }">
        <div class="worship-content">
          <div class="worship-header">
            <div class="worship-icon">
          <i class="fas fa-church"></i>
        </div>
            <div class="worship-info">
          <h3>Renungan Pagi Bersama</h3>
              <p>{{ getWorshipScheduleText() }} • {{ worshipConfig?.schedule?.startTime || '07:10' }} - {{ worshipConfig?.schedule?.endTime || '07:35' }} WIB</p>
              <div class="worship-status">
                <span v-if="todayAttendance" class="status-attended">
                  <i class="fas fa-check-circle"></i>
                  Sudah Hadir Hari Ini
                </span>
                <span v-else-if="zoomCountdown.canJoin" class="status-active">
                  <i class="fas fa-circle"></i>
                  Sesi Aktif
                </span>
                <span v-else-if="zoomCountdown.ended" class="status-ended">
                  <i class="fas fa-circle"></i>
                  Sesi Berakhir
                </span>
                <span v-else-if="!isTodayWorshipDay" class="status-not-worship-day">
                  <i class="fas fa-calendar"></i>
                  Bukan Hari Renungan
                </span>
                <span v-else class="status-waiting">
                  <i class="fas fa-circle"></i>
                  Menunggu Mulai
                </span>
              </div>
            </div>
          </div>
          
          <div class="worship-timer">
            <div class="timer-icon">
            <i class="fas fa-clock"></i>
            </div>
            <div class="timer-info">
              <span class="timer-message">{{ zoomCountdown.message }}</span>
              <span v-if="zoomCountdown.timeLeft" class="timer-countdown">{{ zoomCountdown.timeLeft }}</span>
            </div>
          </div>
          
          <div class="worship-actions">
            <button 
              @click="joinWorshipMeeting"
              class="btn btn-worship" 
              :class="{ 
                'btn-active': zoomCountdown.canJoin && !todayAttendance, 
                'btn-disabled': (!zoomCountdown.canJoin || todayAttendance) && isTodayWorshipDay,
                'btn-not-worship-day': !isTodayWorshipDay,
                'btn-attended': todayAttendance
              }"
              :disabled="!zoomCountdown.canJoin || todayAttendance || !isTodayWorshipDay"
            >
              <i class="fab fa-zoom"></i>
              <span>{{ getButtonText() }}</span>
            </button>
            
            <div class="worship-note">
              <i class="fas fa-info-circle"></i>
              <span>{{ getWorshipNote() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Komponen Kuota Cuti -->
    <SubordinateLeaveQuotas v-if="isManagerRole" />
    <MyLeaveQuotas v-else-if="userRole" />

    <!-- Notifikasi -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <i :class="notificationType === 'success' ? 'fas fa-check-circle' : notificationType === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle'"></i>
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import MyLeaveQuotas from './MyLeaveQuotas.vue';
import SubordinateLeaveQuotas from './SubordinateLeaveQuotas.vue';
import { useGaStore } from '../stores/gaStore';
import morningReflectionService from '../services/morningReflectionService';

// Import konfigurasi
import worshipConfigModule from '../config/worshipConfig.js';

// Gunakan konfigurasi dengan fallback
const worshipConfig = worshipConfigModule || {
  schedule: {
    worshipDays: [1, 3, 5],
    startTime: '07:10',
    endTime: '07:35'
  },
  zoomLink: 'https://us06web.zoom.us/j/81652212259?pwd=wbMvT70bX7b5pzXvFetOPY8T1pPVrK.1',
  messages: {
    notStarted: 'Renungan pagi akan dimulai dalam',
    active: 'Sesi renungan pagi sedang berlangsung',
    ended: 'Sesi renungan pagi telah berakhir',
    attendanceRecorded: 'Kehadiran renungan pagi berhasil dicatat!',
    attendanceFailed: 'Gagal mencatat kehadiran. Silakan coba lagi.',
    sessionNotActive: 'Sesi renungan belum dimulai atau sudah berakhir.'
  }
};

export default {
  name: 'Dashboard',
  components: {
    MyLeaveQuotas,
    SubordinateLeaveQuotas,
  },
  data() {
    return {
      gaStore: useGaStore(),
      userName: '',
      userRole: '',
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      // Untuk countdown timer
      zoomCountdownInterval: null,
      currentTime: new Date(),
      zoomLink: worshipConfig?.zoomLink || 'https://us06web.zoom.us/j/81652212259?pwd=wbMvT70bX7b5pzXvFetOPY8T1pPVrK.1',
      userAvatar: null, // Tambahkan untuk menyimpan avatar user
      todayAttendance: false, // Status kehadiran hari ini
      worshipConfig: worshipConfig, // Tambahkan worshipConfig ke data
    };
  },
  computed: {
    isTodayWorshipDay() {
      try {
        // Hanya tampilkan di hari yang dikonfigurasi
      const today = new Date().getDay();
        return worshipConfig?.schedule?.worshipDays?.includes(today) || false;
      } catch (error) {
        console.error('Error checking worship day:', error);
        return false;
      }
    },
    isManagerRole() {
      return ['HR', 'Program Manager', 'Distribution Manager'].includes(this.userRole);
    },
    isHRUser() {
        return this.userRole === 'HR';
    },
    // Computed property untuk countdown timer renungan pagi
    zoomCountdown() {
      try {
      const now = this.currentTime;
        const today = new Date().getDay();
        const isWorshipDay = worshipConfig?.schedule?.worshipDays?.includes(today) || false;
        
        // Jika bukan hari renungan, tampilkan pesan khusus
        if (!isWorshipDay) {
          const nextWorshipDay = this.getNextWorshipDay();
          return {
            message: `Renungan pagi berikutnya: ${nextWorshipDay}`,
            canJoin: false,
            ended: false,
            timeLeft: null,
            notWorshipDay: true
          };
        }
        
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Parse waktu dari konfigurasi
        const [startHour, startMinute] = (worshipConfig?.schedule?.startTime || '07:10').split(':').map(Number);
        const [endHour, endMinute] = (worshipConfig?.schedule?.endTime || '07:35').split(':').map(Number);
        
        // Set waktu renungan pagi dari konfigurasi
        const startTime = new Date(todayDate.getTime() + (startHour * 60 + startMinute) * 60 * 1000);
        const endTime = new Date(todayDate.getTime() + (endHour * 60 + endMinute) * 60 * 1000);

      if (now < startTime) {
        const diff = startTime - now;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          let timeLeft = '';
          if (hours > 0) {
            timeLeft = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          } else {
            timeLeft = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }
          
        return {
            message: worshipConfig?.messages?.notStarted || 'Renungan pagi akan dimulai dalam',
            canJoin: false,
            ended: false,
            timeLeft: timeLeft
        };
      } else if (now >= startTime && now <= endTime) {
        const diff = endTime - now;
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
        return {
            message: worshipConfig?.messages?.active || 'Sesi renungan pagi sedang berlangsung',
            canJoin: true,
            ended: false,
            timeLeft: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        };
      } else {
          return {
            message: worshipConfig?.messages?.ended || 'Sesi renungan pagi telah berakhir.',
            canJoin: false,
            ended: true,
            timeLeft: null
          };
        }
      } catch (error) {
        console.error('Error in zoomCountdown:', error);
        return {
          message: 'Terjadi kesalahan dalam menghitung waktu',
          canJoin: false,
          ended: false,
          timeLeft: null
        };
      }
    }
  },
  methods: {
    async loadUserData() {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          this.userName = 'Karyawan';
          this.userAvatar = null;
          return;
        }
        const user = JSON.parse(userStr);
        this.userName = user.nama_lengkap || user.name || 'Karyawan';
        this.userRole = user.role;
        
        // Set user avatar dari profile_picture
        if (user.profile_picture) {
          this.userAvatar = `http://127.0.0.1:8000/storage/${user.profile_picture}`;
        } else {
          this.userAvatar = null;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        this.userName = 'Karyawan';
        this.userAvatar = null;
      }
    },
    getInitials(name) {
      if (!name) return '??';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    async joinWorshipMeeting() {
      if (this.todayAttendance) {
        this.showNotificationMessage('Anda sudah hadir di renungan pagi hari ini.', 'info');
        return;
      }
      
      if (!this.isTodayWorshipDay) {
        this.showNotificationMessage(`Renungan pagi hanya tersedia pada hari ${this.getWorshipScheduleText()}`, 'info');
        return;
      }
      
      if (!this.zoomCountdown.canJoin) {
        this.showNotificationMessage(worshipConfig?.messages?.sessionNotActive || 'Sesi renungan belum dimulai atau sudah berakhir.', 'error');
        return;
      }

      try {
        // Buka link Zoom di tab baru
        window.open(this.zoomLink, '_blank');
        
        // Otomatis catat kehadiran renungan pagi
        await this.recordWorshipAttendance();
        
        this.showNotificationMessage(worshipConfig?.messages?.attendanceRecorded || 'Kehadiran renungan pagi berhasil dicatat!', 'success');
      } catch (error) {
        console.error('Error joining worship meeting:', error);
        this.showNotificationMessage(worshipConfig?.messages?.attendanceFailed || 'Gagal mencatat kehadiran. Silakan coba lagi.', 'error');
      }
    },
    async recordWorshipAttendance() {
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          throw new Error('User ID tidak ditemukan');
        }

        // Gunakan service untuk absen dengan validasi
        const result = await morningReflectionService.attendWithValidation(userId, false);
        
        if (result.success) {
          // Set status kehadiran hari ini
          this.todayAttendance = true;
          
          // Simpan ke localStorage sebagai backup
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`worship_attendance_${today}`, JSON.stringify(true));
          
          console.log('Attendance recorded successfully:', result);
          return true;
        } else {
          throw new Error(result.message || 'Gagal mencatat kehadiran');
        }
      } catch (error) {
        console.error('Error recording attendance:', error);
        throw error;
      }
    },
    getCurrentUserId() {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.id || user.user_id;
        }
        return null;
      } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
      }
    },
    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    },
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.loadUserData();
      }
    },
    handleProfileUpdate(event) {
      this.loadUserData();
    },
    getWorshipScheduleText() {
      try {
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const worshipDays = worshipConfig?.schedule?.worshipDays?.map(day => dayNames[day]) || [];
        return worshipDays.join(', ') || 'Senin, Rabu, Jumat';
      } catch (error) {
        console.error('Error getting worship schedule text:', error);
        return 'Senin, Rabu, Jumat';
      }
    },
    async checkTodayAttendance() {
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          this.todayAttendance = false;
          return;
        }

        // Gunakan service untuk cek status kehadiran
        const result = await morningReflectionService.getAttendance(userId);
        
        if (result.success) {
          this.todayAttendance = result.data.attended;
          
          // Simpan ke localStorage sebagai backup
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem(`worship_attendance_${today}`, JSON.stringify(this.todayAttendance));
        } else {
          // Fallback ke localStorage jika API gagal
          const today = new Date().toISOString().split('T')[0];
          const storedAttendance = localStorage.getItem(`worship_attendance_${today}`);
          this.todayAttendance = storedAttendance ? JSON.parse(storedAttendance) : false;
        }
      } catch (error) {
        console.warn('Error checking today attendance:', error.message);
        
        // Fallback ke localStorage jika terjadi error
        const today = new Date().toISOString().split('T')[0];
        const storedAttendance = localStorage.getItem(`worship_attendance_${today}`);
        this.todayAttendance = storedAttendance ? JSON.parse(storedAttendance) : false;
      }
    },
    getButtonText() {
      if (this.todayAttendance) {
        return 'Sudah Hadir';
      } else if (!this.isTodayWorshipDay) {
        return 'Bukan Hari Renungan';
      } else if (this.zoomCountdown.canJoin) {
        return 'Gabung Sekarang';
      } else {
        return 'Belum Mulai';
      }
    },
    getWorshipNote() {
      if (this.todayAttendance) {
        return 'Anda sudah hadir di renungan pagi hari ini.';
      } else if (!this.isTodayWorshipDay) {
        return `Renungan pagi hanya tersedia pada hari ${this.getWorshipScheduleText()}`;
      } else if (this.zoomCountdown.canJoin) {
        return 'Klik tombol untuk masuk Zoom dan otomatis mencatat kehadiran';
      } else {
        return 'Renungan pagi akan dimulai dalam';
      }
    },
    getNextWorshipDay() {
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const today = new Date().getDay();
      const worshipDays = worshipConfig?.schedule?.worshipDays || [1, 3, 5];
      
      // Cari hari renungan berikutnya
      let nextDay = null;
      for (let i = 1; i <= 7; i++) {
        const checkDay = (today + i) % 7;
        if (worshipDays.includes(checkDay)) {
          nextDay = checkDay;
          break;
        }
      }
      
      // Jika tidak ditemukan, gunakan hari pertama dalam daftar
      if (nextDay === null) {
        nextDay = worshipDays[0];
      }
      
      return dayNames[nextDay];
    },
  },
  async mounted() {
    await this.loadUserData();
    await this.checkTodayAttendance();
    
    // Start the interval to update the current time every second
    this.zoomCountdownInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Listen for profile updates
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener('profile-updated', this.handleProfileUpdate);
  },
  beforeUnmount() {
    // Clear the interval when the component is destroyed to prevent memory leaks
    clearInterval(this.zoomCountdownInterval);
    
    // Remove event listeners
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('profile-updated', this.handleProfileUpdate);
  }
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: var(--spacing-xl);
}

.dashboard-header {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section h1 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.welcome-section p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-lg);
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details strong {
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.user-details span {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

/* Renungan Pagi Card */
.worship-card-wrapper {
  margin-bottom: var(--spacing-xl);
}

.worship-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.worship-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  transition: background 0.3s ease;
}

.worship-card.active::before {
  background: linear-gradient(90deg, var(--success-color), #10b981);
}

.worship-card.ended::before {
  background: linear-gradient(90deg, var(--error-color), #ef4444);
}

.worship-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.worship-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.worship-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.worship-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.worship-info h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.worship-info p {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
}

.worship-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.worship-status span {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  background: var(--bg-tertiary);
}

.status-active {
  color: var(--success-color);
  background: rgba(16, 185, 129, 0.1);
}

.status-active i {
  color: var(--success-color);
  font-size: 8px;
}

.status-ended {
  color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
}

.status-ended i {
  color: var(--error-color);
  font-size: 8px;
}

.status-waiting {
  color: var(--warning-color);
  background: rgba(245, 158, 11, 0.1);
}

.status-waiting i {
  color: var(--warning-color);
  font-size: 8px;
}

.status-attended {
  color: var(--success-color);
  background: rgba(16, 185, 129, 0.1);
}

.status-attended i {
  color: var(--success-color);
  font-size: 8px;
}

.status-not-worship-day {
  color: var(--text-muted);
  background: rgba(107, 114, 128, 0.1);
}

.status-not-worship-day i {
  color: var(--text-muted);
  font-size: 8px;
}

.worship-timer {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.timer-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
}

.timer-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.timer-message {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.timer-countdown {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

.worship-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius);
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
  justify-content: center;
}

.btn-worship {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-worship:hover:not(.btn-disabled) {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-disabled {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-not-worship-day {
  background: var(--gray-200);
  color: var(--gray-400);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-attended {
  background: var(--success-color);
}

.btn-attended:hover {
  background: var(--success-dark);
  box-shadow: var(--shadow-md);
}

.worship-note {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-align: center;
  max-width: 300px;
}

.worship-note i {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

/* Notification */
.notification {
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  animation: slideInFromRight 0.3s ease;
}

.notification.success {
  background: var(--success-color);
  color: white;
}

.notification.error {
  background: var(--error-color);
  color: white;
}

.notification.info {
  background: var(--info-color);
  color: white;
}

@keyframes slideInFromRight {
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
  .dashboard-container {
    padding: var(--spacing-md);
  }
  
  .dashboard-header {
    padding: var(--spacing-lg);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .welcome-section h1 {
    font-size: var(--font-size-2xl);
  }
  
  .welcome-section p {
    font-size: var(--font-size-base);
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-base);
  }
  
  .worship-header {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .worship-icon {
    width: 48px;
    height: 48px;
    font-size: var(--font-size-lg);
  }
  
  .worship-info h3 {
    font-size: var(--font-size-lg);
  }
  
  .worship-timer {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .timer-icon {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-sm);
  }
  
  .timer-countdown {
    font-size: var(--font-size-base);
  }
  
  .worship-actions {
    width: 100%;
  }
  
  .btn {
    width: 100%;
    min-width: auto;
  }
  
  .worship-note {
    max-width: none;
    font-size: var(--font-size-xs);
  }
  
  .notification {
    top: var(--spacing-md);
    right: var(--spacing-md);
    left: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: var(--spacing-sm);
  }
  
  .dashboard-header {
    padding: var(--spacing-md);
  }
  
  .welcome-section h1 {
    font-size: var(--font-size-xl);
  }
  
  .worship-card {
    padding: var(--spacing-lg);
  }
  
  .worship-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-base);
  }
  
  .worship-info h3 {
    font-size: var(--font-size-base);
  }
  
  .worship-info p {
    font-size: var(--font-size-xs);
  }
  
  .worship-status span {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs);
  }
  
  .worship-timer {
    padding: var(--spacing-md);
  }
  
  .timer-icon {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-xs);
  }
  
  .timer-message {
    font-size: var(--font-size-xs);
  }
  
  .timer-countdown {
    font-size: var(--font-size-sm);
  }
  
  .btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-xs);
  }
}
</style>