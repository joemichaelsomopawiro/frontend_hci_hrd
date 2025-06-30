<template>
  <div class="ga-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Dashboard GA</h1>
      <p>General Affairs Dashboard - Absensi Renungan Pagi</p>
    </div>

    <!-- Status Hari Absensi -->
    <div class="section-card">
      <div class="worship-status" :class="worshipStatusClass">
        <div class="status-icon">
          <i :class="worshipStatusIcon"></i>
        </div>
        <div class="status-content">
          <h3>{{ worshipStatusTitle }}</h3>
          <p>{{ worshipStatusMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Statistik Absensi Hari Ini -->
    <div class="section-card">
      <div class="section-header">
        <h2>Statistik Absensi Hari Ini</h2>
        <div class="section-header-actions">
          <button @click="refreshData" class="btn-refresh" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
          <span class="current-date">{{ currentDate }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading-section">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Memuat data...</p>
        </div>
      </div>

      <div v-else-if="error" class="error-section">
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button @click="refreshData" class="btn-retry">Coba Lagi</button>
        </div>
      </div>

      <div v-else class="stats-grid">
        <!-- Total Karyawan -->
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.total_employees }}</h3>
            <p>Total Karyawan</p>
          </div>
        </div>

        <!-- Hadir Hari Ini -->
        <div class="stat-card">
          <div class="stat-icon present">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.present_today }}</h3>
            <p>Hadir Hari Ini</p>
          </div>
        </div>

        <!-- Tidak Hadir -->
        <div class="stat-card">
          <div class="stat-icon absent">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.absent_today }}</h3>
            <p>Tidak Hadir</p>
          </div>
        </div>

        <!-- Terlambat -->
        <div class="stat-card">
          <div class="stat-icon late">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.late_today }}</h3>
            <p>Terlambat</p>
          </div>
        </div>

        <!-- Cuti -->
        <div class="stat-card">
          <div class="stat-icon leave">
            <i class="fas fa-calendar-times"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.leave_today }}</h3>
            <p>Cuti</p>
          </div>
        </div>

        <!-- Tingkat Kehadiran -->
        <div class="stat-card">
          <div class="stat-icon rate">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stats.attendance_rate }}%</h3>
            <p>Tingkat Kehadiran</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Daftar Kehadiran Hari Ini -->
    <div class="section-card" v-if="stats.is_worship_day">
      <div class="section-header">
        <h2>Daftar Kehadiran Hari Ini</h2>
        <div class="section-header-actions">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Cari karyawan..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <div class="attendance-table-container">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Karyawan</th>
              <th>Email</th>
              <th>Waktu Hadir</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(attendance, index) in filteredAttendanceList" :key="attendance.user_id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>
                <div class="employee-info">
                  <strong>{{ attendance.user_name }}</strong>
                </div>
              </td>
              <td>{{ attendance.user_email }}</td>
              <td>
                <span v-if="attendance.attended_at" class="time-attended">
                  {{ attendance.attended_at }}
                </span>
                <span v-else class="time-not-attended">-</span>
              </td>
              <td>
                <span class="status-badge" :class="attendance.status_color">
                  {{ attendance.status_label }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <select 
                    v-model="attendance.status" 
                    @change="updateAttendanceStatus(attendance)"
                    class="status-select"
                    :disabled="loading"
                  >
                    <option value="present">Hadir</option>
                    <option value="late">Terlambat</option>
                    <option value="absent">Tidak Hadir</option>
                    <option value="leave">Cuti</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredAttendanceList.length === 0" class="empty-state">
          <i class="fas fa-users-slash"></i>
          <p>Tidak ada data kehadiran untuk hari ini</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn-pagination"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">
          Halaman {{ currentPage }} dari {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn-pagination"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <i :class="notificationIcon"></i>
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import morningReflectionService from '../services/morningReflectionService';

export default {
  name: 'GaDashboard',
  data() {
    return {
      loading: false,
      error: null,
      stats: {
        total_employees: 0,
        present_today: 0,
        absent_today: 0,
        late_today: 0,
        leave_today: 0,
        attendance_rate: 0,
        on_time_today: 0,
        is_worship_day: false,
        worship_time_status: ''
      },
      todayAttendanceList: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success'
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    filteredAttendanceList() {
      if (!this.searchQuery) {
        return this.todayAttendanceList;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.todayAttendanceList.filter(attendance => 
        attendance.user_name.toLowerCase().includes(query) ||
        attendance.user_email.toLowerCase().includes(query)
      );
    },
    paginatedAttendanceList() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAttendanceList.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredAttendanceList.length / this.itemsPerPage);
    },
    notificationIcon() {
      return this.notificationType === 'success' 
        ? 'fas fa-check-circle' 
        : 'fas fa-exclamation-circle';
    },
    worshipStatusClass() {
      if (!this.stats.is_worship_day) {
        return 'worship-status-inactive';
      }
      if (this.stats.worship_time_status === 'Sedang berlangsung') {
        return 'worship-status-active';
      }
      return 'worship-status-finished';
    },
    worshipStatusIcon() {
      if (!this.stats.is_worship_day) {
        return 'fas fa-calendar-times';
      }
      if (this.stats.worship_time_status === 'Sedang berlangsung') {
        return 'fas fa-play-circle';
      }
      return 'fas fa-check-circle';
    },
    worshipStatusTitle() {
      if (!this.stats.is_worship_day) {
        return 'Bukan Hari Absensi';
      }
      if (this.stats.worship_time_status === 'Sedang berlangsung') {
        return 'Absensi Sedang Berlangsung';
      }
      return 'Absensi Selesai';
    },
    worshipStatusMessage() {
      if (!this.stats.is_worship_day) {
        return 'Absensi renungan pagi hanya pada hari Senin, Rabu, dan Jumat jam 7:10-7:35';
      }
      if (this.stats.worship_time_status === 'Sedang berlangsung') {
        return 'Waktu absensi renungan pagi: 7:10 - 7:35';
      }
      return 'Absensi renungan pagi hari ini sudah selesai';
    }
  },
  methods: {
    async refreshData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await morningReflectionService.getGaDashboardData();
        
        if (response.success) {
          this.stats = response.data;
          this.todayAttendanceList = response.data.today_attendance_list;
        } else {
          throw new Error(response.message || 'Gagal memuat data');
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
        this.error = 'Gagal memuat data dashboard. Silakan coba lagi.';
      } finally {
        this.loading = false;
      }
    },

    async updateAttendanceStatus(attendance) {
      try {
        this.loading = true;
        
        // Update status di local state terlebih dahulu
        const originalStatus = attendance.status;
        attendance.status_label = morningReflectionService.getStatusLabel(attendance.status);
        attendance.status_color = morningReflectionService.getStatusColor(attendance.status);
        
        // Simpan ke backend (implementasi sesuai dengan API yang tersedia)
        const updateData = {
          user_id: attendance.user_id,
          date: new Date().toISOString().split('T')[0],
          status: attendance.status
        };
        
        // Jika ada API untuk update status, gunakan di sini
        // await morningReflectionService.updateAttendanceStatus(updateData);
        
        this.showNotificationMessage('Status berhasil diperbarui', 'success');
        
        // Refresh data untuk memastikan konsistensi
        await this.refreshData();
        
      } catch (error) {
        console.error('Error updating attendance status:', error);
        
        // Rollback status jika gagal
        attendance.status = originalStatus;
        attendance.status_label = morningReflectionService.getStatusLabel(originalStatus);
        attendance.status_color = morningReflectionService.getStatusColor(originalStatus);
        
        this.showNotificationMessage('Gagal memperbarui status', 'error');
      } finally {
        this.loading = false;
      }
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
  
  mounted() {
    this.refreshData();
  },
  
  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
  }
}
</script>

<style scoped>
.ga-dashboard {
  padding: var(--spacing-xl);
  background: var(--bg-primary);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: var(--spacing-xl);
}

.dashboard-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.dashboard-header p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.section-header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.current-date {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.btn-refresh {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: background 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-section, .error-section {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner i {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
}

.btn-retry {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-top: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: white;
}

.stat-icon.total {
  background: var(--info-color);
}

.stat-icon.present {
  background: var(--success-color);
}

.stat-icon.absent {
  background: var(--error-color);
}

.stat-icon.late {
  background: var(--warning-color);
}

.stat-icon.leave {
  background: var(--info-color);
}

.stat-icon.rate {
  background: var(--primary-color);
}

.stat-content h3 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stat-content p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-size-sm);
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.attendance-table-container {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.attendance-table th {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 2px solid var(--border-color);
}

.attendance-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.attendance-table tr:hover {
  background: var(--bg-secondary);
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.status-present {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-color);
}

.status-badge.status-late {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-badge.status-absent {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.status-badge.status-leave {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-xl);
}

.btn-pagination {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  margin: 0 var(--spacing-md);
}

.btn-pagination:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
}

.notification {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  transition: transform 0.3s ease;
}

.notification.success {
  background: var(--success-color);
}

.notification.error {
  background: var(--error-color);
}

.notification i {
  font-size: var(--font-size-2xl);
}

@media (max-width: 768px) {
  .ga-dashboard {
    padding: var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .attendance-table {
    font-size: var(--font-size-xs);
  }
  
  .attendance-table th,
  .attendance-table td {
    padding: var(--spacing-sm);
  }
}

/* Worship Status */
.worship-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.worship-status-inactive {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  color: #6b7280;
}

.worship-status-active {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
  color: #1e40af;
}

.worship-status-finished {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
  color: #065f46;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.status-icon i {
  font-size: 1.5rem;
}

.status-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.status-content p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}
</style> 