<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <h1>Dashboard Cuti & Absensi</h1>
      <p>Monitoring dan statistik absensi karyawan</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ todayStats.present || 0 }}</h3>
          <p>Hadir Hari Ini</p>
          <span class="stat-change positive">{{ todayStats.present_percentage || 0 }}% dari total</span>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon">
          <i class="fas fa-user-times"></i>
        </div>
        <div class="stat-content">
          <h3>{{ todayStats.absent || 0 }}</h3>
          <p>Tidak Hadir</p>
          <span class="stat-change">Absen hari ini</span>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon">
          <i class="fas fa-user-injured"></i>
        </div>
        <div class="stat-content">
          <h3>{{ todayStats.sick || 0 }}</h3>
          <p>Sakit</p>
          <span class="stat-change">Cuti sakit</span>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ todayStats.leave || 0 }}</h3>
          <p>Cuti</p>
          <span class="stat-change">Cuti resmi</span>
        </div>
      </div>
    </div>

    <!-- Monthly Summary -->
    <div class="summary-section">
      <div class="section-header">
        <h2>Ringkasan Bulanan</h2>
        <div class="month-selector">
          <select v-model="selectedMonth" @change="fetchMonthlyData" class="filter-select">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
          <select v-model="selectedYear" @change="fetchMonthlyData" class="filter-select">
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="monthly-cards">
        <div class="monthly-card">
          <div class="card-header">
            <h3>Total Jam Kerja</h3>
            <i class="fas fa-clock"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ monthlyStats.total_work_hours || 0 }}</div>
            <div class="card-subtitle">Jam kerja bulan ini</div>
          </div>
        </div>
        
        <div class="monthly-card">
          <div class="card-header">
            <h3>Total Lembur</h3>
            <i class="fas fa-clock"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ monthlyStats.total_overtime_hours || 0 }}</div>
            <div class="card-subtitle">Jam lembur bulan ini</div>
          </div>
        </div>
        
        <div class="monthly-card">
          <div class="card-header">
            <h3>Permohonan Cuti</h3>
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ monthlyStats.pending_leave_requests || 0 }}</div>
            <div class="card-subtitle">Menunggu persetujuan</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="action-section">
      <div class="section-header">
        <h2>Aksi Cepat</h2>
      </div>
      <div class="action-grid">
        <router-link to="/absensi" class="action-card">
          <div class="action-icon">
            <i class="fas fa-user-clock"></i>
          </div>
          <div class="action-content">
            <h3>Kelola Absensi</h3>
            <p>Check-in, check-out, dan input absensi</p>
          </div>
        </router-link>
        
        <router-link to="/cuti/permohonan" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="action-content">
            <h3>Permohonan Cuti</h3>
            <p>Kelola dan approve permohonan cuti</p>
          </div>
        </router-link>
        
        <router-link to="/rekapitulasi" class="action-card">
          <div class="action-icon">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div class="action-content">
            <h3>Rekapitulasi</h3>
            <p>Laporan jam kerja dan absensi</p>
          </div>
        </router-link>
        
        <router-link to="/cuti/input-jatah" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-content">
            <h3>Jatah Cuti</h3>
            <p>Atur jatah cuti karyawan</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-section">
      <div class="section-header">
        <h2>Aktivitas Terbaru</h2>
        <button @click="refreshData" class="btn-secondary">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>
      
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="getActivityIconClass(activity.type)">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-subtitle">{{ activity.subtitle }}</div>
            <div class="activity-time">{{ formatTime(activity.created_at) }}</div>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DashboardCuti',
  data() {
    return {
      todayStats: {},
      monthlyStats: {},
      recentActivities: [],
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      loading: false,
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
      years: [2023, 2024, 2025]
    }
  },
  mounted() {
    this.fetchDashboardData()
    this.fetchMonthlyData()
    this.fetchRecentActivities()
  },
  methods: {
    async fetchDashboardData() {
      try {
        this.loading = true
        const response = await axios.get('/api/attendances/dashboard')
        if (response.data.success) {
          this.todayStats = response.data.data.today_stats
          this.monthlyStats = response.data.data.monthly_stats
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        this.$toast.error('Gagal memuat data dashboard')
      } finally {
        this.loading = false
      }
    },
    
    async fetchMonthlyData() {
      try {
        const response = await axios.get('/api/attendances/summary', {
          params: {
            month: this.selectedMonth,
            year: this.selectedYear
          }
        })
        if (response.data.success) {
          this.monthlyStats = response.data.data
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error)
      }
    },
    
    async fetchRecentActivities() {
      try {
        // Fetch recent leave requests
        const leaveResponse = await axios.get('/api/leave-requests', {
          params: { limit: 5 }
        })
        
        // Fetch recent attendances
        const attendanceResponse = await axios.get('/api/attendances', {
          params: { limit: 5 }
        })
        
        // Combine and format activities
        const activities = []
        
        if (leaveResponse.data.success) {
          leaveResponse.data.data.forEach(leave => {
            activities.push({
              id: `leave-${leave.id}`,
              type: 'leave',
              title: `Permohonan ${leave.leave_type}`,
              subtitle: `${leave.employee.name} - ${leave.total_days} hari`,
              status: leave.status,
              created_at: leave.created_at
            })
          })
        }
        
        if (attendanceResponse.data.success) {
          attendanceResponse.data.data.forEach(attendance => {
            activities.push({
              id: `attendance-${attendance.id}`,
              type: 'attendance',
              title: `Absensi ${attendance.status}`,
              subtitle: `${attendance.employee.name} - ${attendance.date}`,
              status: attendance.status,
              created_at: attendance.created_at
            })
          })
        }
        
        // Sort by date and take latest 10
        this.recentActivities = activities
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
          
      } catch (error) {
        console.error('Error fetching recent activities:', error)
      }
    },
    
    refreshData() {
      this.fetchDashboardData()
      this.fetchMonthlyData()
      this.fetchRecentActivities()
    },
    
    getActivityIcon(type) {
      const icons = {
        leave: 'fas fa-calendar-alt',
        attendance: 'fas fa-user-clock',
        sick: 'fas fa-user-injured',
        permission: 'fas fa-user-times'
      }
      return icons[type] || 'fas fa-info-circle'
    },
    
    getActivityIconClass(type) {
      const classes = {
        leave: 'info',
        attendance: 'success',
        sick: 'warning',
        permission: 'secondary'
      }
      return classes[type] || 'primary'
    },
    
    getStatusText(status) {
      const statusTexts = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        present: 'Hadir',
        absent: 'Tidak Hadir',
        sick: 'Sakit',
        leave: 'Cuti',
        permission: 'Izin'
      }
      return statusTexts[status] || status
    },
    
    formatTime(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) {
        return 'Baru saja'
      } else if (diffInHours < 24) {
        return `${diffInHours} jam yang lalu`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} hari yang lalu`
      }
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: var(--gray-600);
  font-size: 1.1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, var(--success-color), #059669);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, var(--warning-color), #d97706);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, var(--info-color), #0891b2);
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
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
  background: var(--gray-100);
  color: var(--gray-600);
}

.stat-change.positive {
  background: #dcfce7;
  color: #166534;
}

/* Summary Section */
.summary-section {
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

.month-selector {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: white;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.monthly-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.monthly-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-700);
}

.card-header i {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.big-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.card-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* Action Section */
.action-section {
  margin-bottom: 2rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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
}

.action-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.action-content p {
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* Recent Activities */
.recent-section {
  margin-bottom: 2rem;
}

.activity-list {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  gap: 1rem;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.activity-icon.primary {
  background: var(--primary-color);
}

.activity-icon.success {
  background: var(--success-color);
}

.activity-icon.warning {
  background: var(--warning-color);
}

.activity-icon.info {
  background: var(--info-color);
}

.activity-icon.secondary {
  background: var(--gray-500);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.activity-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: var(--gray-500);
  font-size: 0.75rem;
}

.activity-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.activity-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.activity-status.approved {
  background: #dcfce7;
  color: #166534;
}

.activity-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.activity-status.present {
  background: #dcfce7;
  color: #166534;
}

.activity-status.absent {
  background: #fee2e2;
  color: #991b1b;
}

.activity-status.sick {
  background: #fef3c7;
  color: #92400e;
}

.activity-status.leave {
  background: #dbeafe;
  color: #1e40af;
}

/* Buttons */
.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: var(--gray-200);
  border-color: var(--gray-400);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .monthly-cards {
    grid-template-columns: 1fr;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .month-selector {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .activity-status {
    align-self: flex-start;
  }
}
</style>