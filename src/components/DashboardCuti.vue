<template>
  <div class="dashboard-cuti">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="main-title">Dashboard Cuti & Absensi</h1>
          <p class="subtitle">Monitoring dan analisis data kehadiran karyawan secara real-time</p>
        </div>
        <div class="header-actions">
          <button @click="refreshData" class="refresh-btn" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh Data
          </button>
          <button @click="exportData" class="export-btn">
            <i class="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ todayStats.present || 0 }}</div>
            <div class="stat-label">Hadir Hari Ini</div>
            <div class="stat-percentage positive">{{ todayStats.presentPercentage || 0 }}%</div>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <i class="fas fa-user-times"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ todayStats.absent || 0 }}</div>
            <div class="stat-label">Tidak Hadir</div>
            <div class="stat-percentage negative">{{ todayStats.absentPercentage || 0 }}%</div>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <i class="fas fa-user-injured"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ todayStats.sick || 0 }}</div>
            <div class="stat-label">Sakit</div>
            <div class="stat-percentage">{{ todayStats.sickPercentage || 0 }}%</div>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ todayStats.leave || 0 }}</div>
            <div class="stat-label">Cuti</div>
            <div class="stat-percentage">{{ todayStats.leavePercentage || 0 }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- Attendance Trend Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Tren Kehadiran Mingguan</h3>
            <div class="chart-controls">
              <select v-model="selectedWeek" @change="updateWeeklyChart" class="chart-select">
                <option v-for="week in weekOptions" :key="week.value" :value="week.value">
                  {{ week.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="chart-content">
            <canvas ref="weeklyChart" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Leave Types Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Distribusi Jenis Cuti</h3>
            <div class="chart-controls">
              <select v-model="selectedMonth" @change="updateLeaveChart" class="chart-select">
                <option v-for="month in monthOptions" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="chart-content">
            <canvas ref="leaveChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="summary-section">
      <div class="section-header">
        <h2>Ringkasan Bulanan</h2>
        <div class="period-selector">
          <select v-model="selectedMonth" @change="fetchMonthlyData" class="period-select">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
          <select v-model="selectedYear" @change="fetchMonthlyData" class="period-select">
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Total Jam Kerja</div>
            <div class="summary-value">{{ monthlyStats.totalWorkHours || 0 }} Jam</div>
            <div class="summary-subtitle">Rata-rata {{ monthlyStats.avgWorkHours || 0 }} jam/hari</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Total Lembur</div>
            <div class="summary-value">{{ monthlyStats.totalOvertime || 0 }} Jam</div>
            <div class="summary-subtitle">{{ monthlyStats.overtimeDays || 0 }} hari lembur</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Permohonan Cuti</div>
            <div class="summary-value">{{ monthlyStats.leaveRequests || 0 }}</div>
            <div class="summary-subtitle">{{ monthlyStats.pendingLeave || 0 }} menunggu approval</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="summary-content">
            <div class="summary-title">Tingkat Kehadiran</div>
            <div class="summary-value">{{ monthlyStats.attendanceRate || 0 }}%</div>
            <div class="summary-subtitle">Target: 95%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <div class="section-header">
        <h2>Aksi Cepat</h2>
      </div>
      <div class="actions-grid">
        <router-link to="/absensi" class="action-card">
          <div class="action-icon">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="action-content">
            <h3>Kelola Absensi</h3>
            <p>Check-in, check-out, dan input absensi manual</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </router-link>
        
        <router-link to="/cuti/permohonan" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="action-content">
            <h3>Permohonan Cuti</h3>
            <p>Review dan approve permohonan cuti karyawan</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </router-link>
        
        <router-link to="/rekapitulasi" class="action-card">
          <div class="action-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="action-content">
            <h3>Laporan & Rekapitulasi</h3>
            <p>Generate laporan jam kerja dan absensi</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </router-link>
        
        <router-link to="/cuti/input-jatah" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-content">
            <h3>Manajemen Jatah Cuti</h3>
            <p>Atur dan kelola jatah cuti tahunan karyawan</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="activities-section">
      <div class="section-header">
        <h2>Aktivitas Terbaru</h2>
        <button @click="viewAllActivities" class="view-all-btn">
          Lihat Semua
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="activities-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="getActivityClass(activity.type)">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat data...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardCuti',
  data() {
    return {
      loading: false,
      todayStats: {
        present: 0,
        absent: 0,
        sick: 0,
        leave: 0,
        presentPercentage: 0,
        absentPercentage: 0,
        sickPercentage: 0,
        leavePercentage: 0
      },
      monthlyStats: {
        totalWorkHours: 0,
        totalOvertime: 0,
        leaveRequests: 0,
        pendingLeave: 0,
        attendanceRate: 0,
        avgWorkHours: 0,
        overtimeDays: 0
      },
      recentActivities: [],
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      selectedWeek: 1,
      months: [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' }
      ],
      years: [2023, 2024, 2025],
      weekOptions: [
        { value: 1, label: 'Minggu ke-1' },
        { value: 2, label: 'Minggu ke-2' },
        { value: 3, label: 'Minggu ke-3' },
        { value: 4, label: 'Minggu ke-4' }
      ],
      monthOptions: [
        { value: 1, label: 'Januari' },
        { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' },
        { value: 4, label: 'April' },
        { value: 5, label: 'Mei' },
        { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' },
        { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' },
        { value: 12, label: 'Desember' }
      ]
    }
  },
  mounted() {
    this.initializeDashboard()
  },
  methods: {
    async initializeDashboard() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchTodayStats(),
          this.fetchMonthlyData(),
          this.fetchRecentActivities()
        ])
        this.initializeCharts()
      } catch (error) {
        console.error('Error initializing dashboard:', error)
        this.showErrorMessage('Gagal memuat data dashboard')
      } finally {
        this.loading = false
      }
    },
    
    async fetchTodayStats() {
      try {
        // Simulate API call - replace with actual API
        const mockData = {
          present: 45,
          absent: 5,
          sick: 2,
          leave: 3,
          presentPercentage: 82,
          absentPercentage: 9,
          sickPercentage: 4,
          leavePercentage: 5
        }
        this.todayStats = mockData
      } catch (error) {
        console.error('Error fetching today stats:', error)
      }
    },
    
    async fetchMonthlyData() {
      try {
        // Simulate API call - replace with actual API
        const mockData = {
          totalWorkHours: 1680,
          totalOvertime: 120,
          leaveRequests: 15,
          pendingLeave: 3,
          attendanceRate: 94,
          avgWorkHours: 8.2,
          overtimeDays: 12
        }
        this.monthlyStats = mockData
      } catch (error) {
        console.error('Error fetching monthly data:', error)
      }
    },
    
    async fetchRecentActivities() {
      try {
        // Simulate API call - replace with actual API
        const mockActivities = [
          {
            id: 1,
            type: 'leave_request',
            title: 'Permohonan Cuti Tahunan',
            description: 'John Doe mengajukan cuti tahunan 3 hari',
            timestamp: new Date().toISOString(),
            status: 'pending'
          },
          {
            id: 2,
            type: 'attendance',
            title: 'Check-in Terlambat',
            description: 'Jane Smith check-in pada 09:15',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'warning'
          },
          {
            id: 3,
            type: 'overtime',
            title: 'Lembur Disetujui',
            description: 'Mike Johnson lembur 2 jam disetujui',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'approved'
          }
        ]
        this.recentActivities = mockActivities
      } catch (error) {
        console.error('Error fetching activities:', error)
      }
    },
    
    initializeCharts() {
      this.$nextTick(() => {
        this.createWeeklyChart()
        this.createLeaveChart()
      })
    },
    
    createWeeklyChart() {
      const canvas = this.$refs.weeklyChart
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      // Simple chart implementation - replace with Chart.js or similar
      ctx.fillStyle = '#4FC3F7'
      ctx.fillRect(50, 50, 100, 100)
      ctx.fillStyle = '#333'
      ctx.font = '14px Arial'
      ctx.fillText('Weekly Attendance Chart', 60, 30)
    },
    
    createLeaveChart() {
      const canvas = this.$refs.leaveChart
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      // Simple chart implementation - replace with Chart.js or similar
      ctx.fillStyle = '#FF9800'
      ctx.beginPath()
      ctx.arc(200, 100, 50, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.font = '14px Arial'
      ctx.fillText('Leave Distribution Chart', 120, 30)
    },
    
    updateWeeklyChart() {
      this.createWeeklyChart()
    },
    
    updateLeaveChart() {
      this.createLeaveChart()
    },
    
    async refreshData() {
      this.loading = true
      try {
        await this.initializeDashboard()
        this.showSuccessMessage('Data berhasil diperbarui')
      } catch (error) {
        this.showErrorMessage('Gagal memperbarui data')
      } finally {
        this.loading = false
      }
    },
    
    exportData() {
      // Implement export functionality
      this.showInfoMessage('Fitur export sedang dalam pengembangan')
    },
    
    viewAllActivities() {
      this.$router.push('/activities')
    },
    
    getActivityClass(type) {
      const classes = {
        leave_request: 'activity-leave',
        attendance: 'activity-attendance',
        overtime: 'activity-overtime',
        sick: 'activity-sick'
      }
      return classes[type] || 'activity-default'
    },
    
    getActivityIcon(type) {
      const icons = {
        leave_request: 'fas fa-calendar-alt',
        attendance: 'fas fa-user-clock',
        overtime: 'fas fa-clock',
        sick: 'fas fa-user-injured'
      }
      return icons[type] || 'fas fa-info-circle'
    },
    
    getStatusText(status) {
      const statusTexts = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        warning: 'Peringatan',
        info: 'Informasi'
      }
      return statusTexts[status] || status
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 3600000) { // Less than 1 hour
        return `${Math.floor(diff / 60000)} menit yang lalu`
      } else if (diff < 86400000) { // Less than 1 day
        return `${Math.floor(diff / 3600000)} jam yang lalu`
      } else {
        return date.toLocaleDateString('id-ID')
      }
    },
    
    showSuccessMessage(message) {
      // Implement toast notification
      console.log('Success:', message)
    },
    
    showErrorMessage(message) {
      // Implement toast notification
      console.error('Error:', message)
    },
    
    showInfoMessage(message) {
      // Implement toast notification
      console.log('Info:', message)
    }
  }
}
</script>

<style scoped>
:root {
  --primary-color: #4FC3F7;
  --primary-dark: #29B6F6;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #F44336;
  --info-color: #2196F3;
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #EEEEEE;
  --gray-300: #E0E0E0;
  --gray-400: #BDBDBD;
  --gray-500: #9E9E9E;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.2);
  --border-radius: 12px;
  --transition: all 0.3s ease;
}

.dashboard-cuti {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

/* Header Section */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 2rem 3rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  opacity: 0.3;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section {
  flex: 1;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn,
.export-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.refresh-btn:hover,
.export-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Stats Section */
.stats-section {
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: var(--transition);
  border-left: 4px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card.primary {
  border-left-color: var(--primary-color);
}

.stat-card.success {
  border-left-color: var(--success-color);
}

.stat-card.warning {
  border-left-color: var(--warning-color);
}

.stat-card.info {
  border-left-color: var(--info-color);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, var(--success-color), #388E3C);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, var(--warning-color), #F57C00);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, var(--info-color), #1976D2);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-percentage {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  background: var(--gray-100);
  color: var(--gray-700);
  display: inline-block;
}

.stat-percentage.positive {
  background: #E8F5E8;
  color: #2E7D32;
}

.stat-percentage.negative {
  background: #FFEBEE;
  color: #C62828;
}

/* Charts Section */
.charts-section {
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-50);
}

.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.chart-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--gray-700);
  font-size: 0.875rem;
}

.chart-content {
  padding: 1.5rem;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Summary Section */
.summary-section {
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.period-selector {
  display: flex;
  gap: 1rem;
}

.period-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--gray-700);
  font-size: 0.875rem;
  min-width: 120px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: var(--transition);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
  line-height: 1;
}

.summary-subtitle {
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Actions Section */
.actions-section {
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition);
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
  text-decoration: none;
  color: inherit;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.action-content p {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.action-arrow {
  color: var(--gray-400);
  font-size: 1rem;
  transition: var(--transition);
}

.action-card:hover .action-arrow {
  color: var(--primary-color);
  transform: translateX(4px);
}

/* Activities Section */
.activities-section {
  padding: 0 2rem;
  margin-bottom: 2rem;
}

.view-all-btn {
  background: none;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-all-btn:hover {
  background: var(--primary-color);
  color: white;
}

.activities-list {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  gap: 1rem;
  transition: var(--transition);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: var(--gray-50);
}

.activity-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.activity-leave {
  background: linear-gradient(135deg, var(--info-color), #1976D2);
}

.activity-attendance {
  background: linear-gradient(135deg, var(--success-color), #388E3C);
}

.activity-overtime {
  background: linear-gradient(135deg, var(--warning-color), #F57C00);
}

.activity-sick {
  background: linear-gradient(135deg, var(--error-color), #D32F2F);
}

.activity-default {
  background: linear-gradient(135deg, var(--gray-500), var(--gray-600));
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.activity-description {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.activity-time {
  color: var(--gray-500);
  font-size: 0.75rem;
}

.activity-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-status.pending {
  background: var(--bg-secondary)3CD;
  color: #856404;
}

.activity-status.approved {
  background: #D4EDDA;
  color: #155724;
}

.activity-status.rejected {
  background: #F8D7DA;
  color: #721C24;
}

.activity-status.warning {
  background: #FFE5B4;
  color: #8A6914;
}

.activity-status.info {
  background: #CCE5FF;
  color: #004085;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  text-align: center;
  color: var(--primary-color);
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loading-spinner p {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-cuti {
    padding: 0;
  }
  
  .dashboard-header {
    padding: 1.5rem 1rem 2rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .stats-section,
  .charts-section,
  .summary-section,
  .actions-section,
  .activities-section {
    padding: 0 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .period-selector {
    width: 100%;
  }
  
  .period-select {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .summary-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .activity-status {
    align-self: flex-start;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .refresh-btn,
  .export-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
