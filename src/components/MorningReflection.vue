<template>
  <div class="morning-reflection-navbar">
    <div class="reflection-status" @click="openReflectionModal">
      <div class="status-icon" :class="getStatusClass()">
        <i :class="getStatusIcon()"></i>
      </div>
      <div class="status-info">
        <span class="status-text">{{ getStatusText() }}</span>
        <span class="status-date">{{ getCurrentDate() }}</span>
      </div>
    </div>

    <!-- Modal Renungan Pagi -->
    <div v-if="showModal" class="reflection-modal-overlay" @click="closeModal">
      <div class="reflection-modal" @click.stop>
        <div class="modal-header">
          <h3>Status Renungan Pagi</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="today-status">
            <div class="status-card" :class="getStatusClass()">
              <div class="status-header">
                <i :class="getStatusIcon()"></i>
                <h4>{{ getStatusTitle() }}</h4>
              </div>
              <p>{{ getStatusDescription() }}</p>
              <div class="status-details">
                <span class="detail-item">
                  <i class="fas fa-calendar"></i>
                  {{ getCurrentDate() }}
                </span>
                <span class="detail-item">
                  <i class="fas fa-clock"></i>
                  {{ getCurrentTime() }}
                </span>
              </div>
            </div>
          </div>

          <div class="attendance-history">
            <h4>Riwayat Kehadiran Minggu Ini</h4>
            <div class="history-list">
              <div 
                v-for="day in getWeekHistory()" 
                :key="day.date" 
                class="history-item"
                :class="day.status"
              >
                <span class="day-name">{{ day.dayName }}</span>
                <span class="day-date">{{ day.date }}</span>
                <span class="day-status">
                  <i :class="getHistoryIcon(day.status)"></i>
                  {{ getHistoryText(day.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="leave-info" v-if="hasApprovedLeave">
            <div class="leave-notice">
              <i class="fas fa-info-circle"></i>
              <span>Anda memiliki cuti yang disetujui untuk hari ini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MorningReflection',
  data() {
    return {
      showModal: false,
      currentUser: null,
      todayAttendance: null,
      weekHistory: [],
      hasApprovedLeave: false
    }
  },
  async mounted() {
    await this.loadUserData();
    await this.loadTodayAttendance();
    await this.loadWeekHistory();
    await this.checkApprovedLeave();
  },
  methods: {
    async loadUserData() {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          this.currentUser = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },
    
    async loadTodayAttendance() {
      try {
        // Simulasi API call untuk mengambil absensi hari ini
        const today = new Date().toISOString().split('T')[0];
        const userId = this.currentUser?.id;
        
        // Ganti dengan API call yang sebenarnya
        // const response = await axios.get(`/api/morning-reflection/attendance/${userId}/${today}`);
        
        // Simulasi data
        this.todayAttendance = {
          date: today,
          status: 'present', // present, absent, late, leave, not_worship_day
          timestamp: new Date().toISOString(),
          note: ''
        };
      } catch (error) {
        console.error('Error loading today attendance:', error);
      }
    },
    
    async loadWeekHistory() {
      try {
        // Simulasi API call untuk mengambil riwayat minggu ini
        // const response = await axios.get(`/api/morning-reflection/week-history/${this.currentUser?.id}`);
        
        // Simulasi data
        this.weekHistory = [
          { dayName: 'Senin', date: '2024-01-15', status: 'present' },
          { dayName: 'Selasa', date: '2024-01-16', status: 'not_worship_day' },
          { dayName: 'Rabu', date: '2024-01-17', status: 'late' },
          { dayName: 'Kamis', date: '2024-01-18', status: 'not_worship_day' },
          { dayName: 'Jumat', date: '2024-01-19', status: 'absent' }
        ];
      } catch (error) {
        console.error('Error loading week history:', error);
      }
    },
    
    async checkApprovedLeave() {
      try {
        // Simulasi API call untuk mengecek cuti yang disetujui
        const today = new Date().toISOString().split('T')[0];
        const userId = this.currentUser?.id;
        
        // Ganti dengan API call yang sebenarnya
        // const response = await axios.get(`/api/leave/approved/${userId}/${today}`);
        
        // Simulasi data
        this.hasApprovedLeave = false; // Set true jika ada cuti yang disetujui
      } catch (error) {
        console.error('Error checking approved leave:', error);
      }
    },
    
    getStatusClass() {
      if (this.hasApprovedLeave) return 'status-leave';
      if (!this.todayAttendance) return 'status-unknown';
      
      const statusMap = {
        present: 'status-present',
        absent: 'status-absent',
        late: 'status-late',
        leave: 'status-leave',
        not_worship_day: 'status-not-worship'
      };
      
      return statusMap[this.todayAttendance.status] || 'status-unknown';
    },
    
    getStatusIcon() {
      if (this.hasApprovedLeave) return 'fas fa-umbrella-beach';
      if (!this.todayAttendance) return 'fas fa-question-circle';
      
      const iconMap = {
        present: 'fas fa-check-circle',
        absent: 'fas fa-times-circle',
        late: 'fas fa-clock',
        leave: 'fas fa-umbrella-beach',
        not_worship_day: 'fas fa-calendar-times'
      };
      
      return iconMap[this.todayAttendance.status] || 'fas fa-question-circle';
    },
    
    getStatusText() {
      if (this.hasApprovedLeave) return 'Cuti';
      if (!this.todayAttendance) return 'Belum Ada Data';
      
      const textMap = {
        present: 'Hadir',
        absent: 'Tidak Hadir',
        late: 'Terlambat',
        leave: 'Cuti',
        not_worship_day: 'Bukan Jadwal'
      };
      
      return textMap[this.todayAttendance.status] || 'Belum Ada Data';
    },
    
    getStatusTitle() {
      if (this.hasApprovedLeave) return 'Cuti Disetujui';
      if (!this.todayAttendance) return 'Status Belum Tersedia';
      
      const titleMap = {
        present: 'Hadir Tepat Waktu',
        absent: 'Tidak Hadir',
        late: 'Hadir Terlambat',
        leave: 'Cuti Disetujui',
        not_worship_day: 'Bukan Jadwal Renungan'
      };
      
      return titleMap[this.todayAttendance.status] || 'Status Belum Tersedia';
    },
    
    getStatusDescription() {
      if (this.hasApprovedLeave) return 'Anda memiliki cuti yang disetujui untuk hari ini.';
      if (!this.todayAttendance) return 'Data kehadiran renungan pagi belum tersedia.';
      
      const descMap = {
        present: 'Anda telah hadir tepat waktu di renungan pagi hari ini.',
        absent: 'Anda tidak hadir di renungan pagi hari ini.',
        late: 'Anda hadir terlambat di renungan pagi hari ini.',
        leave: 'Anda memiliki cuti yang disetujui untuk hari ini.',
        not_worship_day: 'Hari ini bukan jadwal renungan pagi.'
      };
      
      return descMap[this.todayAttendance.status] || 'Data kehadiran belum tersedia.';
    },
    
    getCurrentDate() {
      return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    getCurrentTime() {
      return new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getWeekHistory() {
      return this.weekHistory;
    },
    
    getHistoryIcon(status) {
      const iconMap = {
        present: 'fas fa-check-circle',
        absent: 'fas fa-times-circle',
        late: 'fas fa-clock',
        leave: 'fas fa-umbrella-beach',
        not_worship_day: 'fas fa-calendar-times'
      };
      
      return iconMap[status] || 'fas fa-question-circle';
    },
    
    getHistoryText(status) {
      const textMap = {
        present: 'Hadir',
        absent: 'Tidak Hadir',
        late: 'Terlambat',
        leave: 'Cuti',
        not_worship_day: 'Bukan Jadwal'
      };
      
      return textMap[status] || 'Belum Ada Data';
    },
    
    openReflectionModal() {
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
    }
  }
}
</script>

<style scoped>
.morning-reflection-navbar {
  position: relative;
}

.reflection-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.reflection-status:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
}

.status-present {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-absent {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.status-late {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-leave {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
}

.status-not-worship {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.status-unknown {
  background: rgba(107, 114, 128, 0.1);
  color: var(--text-muted);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.status-text {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-primary);
}

.status-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Modal Styles */
.reflection-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.reflection-modal {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-content {
  padding: var(--spacing-lg);
}

.today-status {
  margin-bottom: var(--spacing-xl);
}

.status-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.status-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.status-header i {
  font-size: var(--font-size-xl);
}

.status-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.status-card p {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.status-details {
  display: flex;
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.attendance-history h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.history-item.present {
  border-left: 4px solid var(--success-color);
}

.history-item.absent {
  border-left: 4px solid var(--error-color);
}

.history-item.late {
  border-left: 4px solid var(--warning-color);
}

.history-item.leave {
  border-left: 4px solid var(--primary-color);
}

.history-item.not_worship_day {
  border-left: 4px solid var(--text-muted);
}

.day-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.day-date {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}

.day-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.day-status.present {
  color: var(--success-color);
}

.day-status.absent {
  color: var(--error-color);
}

.day-status.late {
  color: var(--warning-color);
}

.day-status.leave {
  color: var(--primary-color);
}

.day-status.not_worship_day {
  color: var(--text-muted);
}

.leave-info {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--radius);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.leave-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .reflection-status {
    min-width: 120px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .status-icon {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-xs);
  }
  
  .status-text {
    font-size: var(--font-size-xs);
  }
  
  .status-date {
    font-size: var(--font-size-xs);
  }
  
  .reflection-modal {
    margin: var(--spacing-sm);
    max-height: 90vh;
  }
  
  .modal-content {
    padding: var(--spacing-md);
  }
  
  .status-details {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>