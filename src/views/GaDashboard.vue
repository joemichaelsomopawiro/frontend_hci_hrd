<template>
  <div class="ga-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <h1>General Affairs Dashboard</h1>
      <div class="header-actions">
        <button @click="showConfigPanel = !showConfigPanel" class="config-btn">
          <i class="fas fa-cog"></i> {{ showConfigPanel ? 'Tutup Konfigurasi' : 'Konfigurasi Worship' }}
        </button>
        <button @click="refreshDashboard" class="refresh-btn">
          <i class="fas fa-sync-alt"></i> Refresh Data
        </button>
      </div>
    </div>
    
    <!-- Worship Config Panel -->
    <WorshipConfigPanel v-if="showConfigPanel" class="worship-config-container" />

    <!-- Simple Header -->
    <header class="header">
      <h1 class="title">Dashboard Morning Reflection</h1>
      <div class="time-info">
        <div class="current-time">
          <span class="time">{{ currentTime }}</span>
          <span class="date">{{ currentDate }}</span>
        </div>
      </div>
    </header>

    <!-- Zoom Meeting Section -->
    <div class="zoom-section" v-if="store.isTodayWorshipDay">
      <div class="section-header">
        <h2>Renungan Pagi</h2>
        <div class="zoom-status">
          <span class="status-badge" :class="store.zoomTimeStatus.toLowerCase()">{{ store.zoomTimeStatus }}</span>
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
              <span>07:10 - 07:35 WIB</span>
            </div>
          </div>
        </div>
        <div class="zoom-actions">
          <button 
            @click="joinZoomMeeting" 
            class="btn-zoom"
            :disabled="store.zoomTimeStatus !== 'Hadir' && !store.testingMode"
          >
            <i class="fab fa-zoom"></i>
            {{ (store.zoomTimeStatus === 'Hadir' || store.testingMode) ? 'Gabung Zoom' : 'Waktu Absensi Ditutup' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Employee Zoom Access Section -->
    <div class="employee-zoom-section" v-if="store.isTodayReflectionDay">
      <div class="section-header">
        <h2>Akses Zoom Karyawan - Renungan Pagi</h2>
        <div class="schedule-info">
          <i class="fas fa-calendar-alt"></i>
          <span>Senin, Rabu, Jumat | 07:10 - 07:35 WIB</span>
        </div>
      </div>
      <div class="employee-grid">
        <div v-for="employee in store.employees" :key="employee.id" class="employee-card">
          <div class="employee-info">
            <div class="employee-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="employee-details">
              <h4>{{ employee.full_name || employee.nama_lengkap || employee.name }}</h4>
              <p>{{ employee.position || employee.role || 'Karyawan' }}</p>
              <div class="attendance-status">
                <span class="status-indicator" :class="getEmployeeAttendanceStatus(employee.id).class">
                  {{ getEmployeeAttendanceStatus(employee.id).text }}
                </span>
              </div>
            </div>
          </div>
          <div class="employee-actions">
            <button 
              @click="joinZoomForEmployee(employee)" 
              class="btn-zoom-employee"
              :disabled="store.zoomTimeStatus !== 'Hadir' && !store.testingMode"
              :class="{
                'active': store.zoomTimeStatus === 'Hadir' || store.testingMode,
                'disabled': store.zoomTimeStatus !== 'Hadir' && !store.testingMode
              }"
            >
              <i class="fab fa-zoom"></i>
              <span v-if="store.zoomTimeStatus === 'Hadir' || store.testingMode">
                Gabung Zoom
              </span>
              <span v-else>
                Tutup
              </span>
            </button>
            <div class="zoom-info-text">
              <small>Klik untuk absen renungan pagi</small>
            </div>
          </div>
        </div>
      </div>
      <div class="attendance-note">
        <div class="note-card">
          <i class="fas fa-info-circle"></i>
          <div class="note-content">
            <h4>Informasi Absensi Renungan Pagi</h4>
            <ul>
              <li>Jadwal: <strong>Senin, Rabu, Jumat</strong></li>
              <li>Waktu: <strong>07:10 - 07:35 WIB</strong></li>
              <li>Klik "Gabung Zoom" = <strong>Hadir</strong></li>
              <li>Tidak klik = <strong>Tidak Hadir</strong></li>
              <li>Setelah jam 07:35 = <strong>Terlambat</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-number">{{ store.employees.length }}</div>
          <div class="stat-label">Total Karyawan</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ todayTotalAttendance }}</div>
          <div class="stat-label">Kehadiran Hari Ini</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-number">{{ pendingLeaves.length }}</div>
          <div class="stat-label">Cuti Pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🗓️</div>
        <div class="stat-info">
          <div class="stat-number">{{ store.isTodayWorshipDay ? 'Ibadah' : 'Kerja' }}</div>
          <div class="stat-label">Status Hari</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-info">
          <div class="stat-number">{{ lateArrivalsCount }}</div>
          <div class="stat-label">Terlambat Hari Ini</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-number">{{ monthlyAttendancePercentage }}%</div>
          <div class="stat-label">Kehadiran Bulan Ini</div>
        </div>
      </div>
    </div>

    <!-- Content Sections -->
    <div class="content">
      <!-- Morning Reflections -->
      <section class="section">
        <div class="section-header">
          <h2>Morning Reflections</h2>
          <button @click="store.fetchReflections" class="refresh-btn" :disabled="store.loading">
            {{ store.loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
        
        <div v-if="store.reflections.length" class="table-wrapper">
          <table class="simple-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reflection in store.reflections" :key="reflection.id">
                <td>{{ reflection.employee?.full_name || 'Unknown' }}</td>
                <td>{{ formatDate(reflection.date) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusBadgeClass(reflection.status)">
                    {{ reflection.status }}
                  </span>
                </td>
                <td>{{ reflection.join_time ? formatTime(reflection.join_time) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-message">
          <p>Belum ada data kehadiran hari ini</p>
        </div>
      </section>

      <!-- Leave Requests -->
      <section class="section">
        <div class="section-header">
          <h2>Data Cuti</h2>
          <button @click="store.fetchLeaves" class="refresh-btn" :disabled="store.loading">
            {{ store.loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
        
        <div v-if="store.leaves.length" class="table-wrapper">
          <table class="simple-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Durasi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leave in store.leaves" :key="leave.id">
                <td>{{ leave.employee?.full_name || 'Unknown' }}</td>
                <td>{{ formatDate(leave.start_date) }}</td>
                <td>{{ formatDate(leave.end_date) }}</td>
                <td>{{ leave.type }}</td>
                <td>
                  <span class="status-badge" :class="getLeaveStatusBadgeClass(leave.status)">
                    {{ leave.status }}
                  </span>
                </td>
                <td>{{ calculateLeaveDuration(leave.start_date, leave.end_date) }} hari</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-message">
          <p>Belum ada data cuti</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useGaStore } from '@/stores/gaStore'
import WorshipConfigPanel from '@/components/WorshipConfigPanel.vue'

export default {
  name: 'Dashboard',
  components: {
    WorshipConfigPanel
  },
  setup() {
    const store = useGaStore()
    const currentTime = ref('')
    const currentDate = ref('')
    const showConfigPanel = ref(false)
    let timeInterval = null

    // Update current time
    const updateTime = () => {
      const now = new Date()
      const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
      
      currentTime.value = jakartaTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
      })
      
      currentDate.value = jakartaTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta'
      })
      
      store.updateCurrentTime()
    }

    // Computed properties using dashboard data
    const todayReflections = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      const todayDate = new Date()
      const dayOfWeek = todayDate.getDay()
      
      // Hanya tampilkan jika hari ini adalah hari renungan (Senin, Rabu, Jumat)
      if (![1, 3, 5].includes(dayOfWeek)) {
        return []
      }
      
      // Use dashboard attendances data if available, fallback to reflections
      const attendanceData = store.dashboardAttendances.length > 0 ? store.dashboardAttendances : store.reflections
      return attendanceData.filter(reflection => 
        reflection.date === today && reflection.status === 'Hadir'
      )
    })

    const todayTotalAttendance = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      const todayDate = new Date()
      const dayOfWeek = todayDate.getDay()
      
      // Hanya tampilkan jika hari ini adalah hari renungan (Senin, Rabu, Jumat)
      if (![1, 3, 5].includes(dayOfWeek)) {
        return 0
      }
      
      // Use dashboard attendances data if available, fallback to reflections
      const attendanceData = store.dashboardAttendances.length > 0 ? store.dashboardAttendances : store.reflections
      return attendanceData.filter(reflection => 
        reflection.date === today && (reflection.status === 'Hadir' || reflection.status === 'Terlambat')
      ).length
    })

    const pendingLeaves = computed(() => {
      // Use dashboard leave requests data if available, fallback to leaves
      const leaveData = store.dashboardLeaveRequests.length > 0 ? store.dashboardLeaveRequests : store.leaves
      return leaveData.filter(leave => 
        leave.status === 'pending' || leave.status === 'Pending'
      )
    })

    const lateArrivalsCount = computed(() => {
      const today = new Date().toISOString().slice(0, 10);
      // Use dashboard attendances data if available, fallback to reflections
      const attendanceData = store.dashboardAttendances.length > 0 ? store.dashboardAttendances : store.reflections
      return attendanceData.filter(r => {
        if (r.date !== today || !r.join_time || r.status !== 'Terlambat') return false;
        
        // Cek apakah hari ini adalah hari renungan
        const reflectionDate = new Date(r.date);
        const dayOfWeek = reflectionDate.getDay();
        if (![1, 3, 5].includes(dayOfWeek)) return false;
        
        return true;
      }).length;
    });

    const monthlyAttendancePercentage = computed(() => {
      // Use attendance statistics if available
      if (store.attendanceStatistics && store.attendanceStatistics.monthly_percentage) {
        return store.attendanceStatistics.monthly_percentage
      }
      
      // Fallback to manual calculation
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const worshipDays = getWorshipDaysInMonth(year, month);
      
      // Use dashboard attendances data if available, fallback to reflections
      const attendanceData = store.dashboardAttendances.length > 0 ? store.dashboardAttendances : store.reflections
      const presentDays = attendanceData
        .filter(r => {
          const reflectionDate = new Date(r.date);
          return reflectionDate.getFullYear() === year && 
                 reflectionDate.getMonth() === month &&
                 r.status === 'Hadir';
        }).length;

      return worshipDays > 0 ? Math.round((presentDays / worshipDays) * 100) : 0;
    });

    function getWorshipDaysInMonth(year, month) {
      let worshipDays = 0;
      const date = new Date(year, month, 1);
      while (date.getMonth() === month) {
        const dayOfWeek = date.getDay();
        // Hanya hitung hari Senin (1), Rabu (3), dan Jumat (5)
        if ([1, 3, 5].includes(dayOfWeek)) {
          worshipDays++;
        }
        date.setDate(date.getDate() + 1);
      }
      return worshipDays;
    }

    const timeStatusClass = computed(() => {
      const status = store.zoomTimeStatus
      return {
        'status-on-time': status === 'On Time',
        'status-late': status === 'Late',
        'status-closed': status === 'Closed'
      }
    })

    const timeStatusText = computed(() => {
      const status = store.zoomTimeStatus
      switch (status) {
        case 'On Time':
          return '✅ Tepat Waktu'
        case 'Late':
          return '⚠️ Terlambat'
        case 'Closed':
          return '❌ Tutup'
        default:
          return status
      }
    })

    // Methods
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatTime = (time) => {
      return new Date(time).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      })
    }

    const getInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }

    const getStatusBadgeClass = (status) => {
      const baseClass = 'status-badge'
      switch (status) {
        case 'Hadir':
        case 'On Time':
          return `${baseClass} status-present`
        case 'Terlambat':
        case 'Late':
          return `${baseClass} status-late`
        case 'Tidak Hadir':
        case 'Absent':
          return `${baseClass} status-absent`
        default:
          return baseClass
      }
    }

    const getLeaveStatusBadgeClass = (status) => {
      const baseClass = 'status-badge'
      switch (status.toLowerCase()) {
        case 'approved':
        case 'disetujui':
          return `${baseClass} status-approved`
        case 'pending':
        case 'menunggu':
          return `${baseClass} status-pending`
        case 'rejected':
        case 'ditolak':
          return `${baseClass} status-rejected`
        default:
          return baseClass
      }
    }

    const calculateLeaveDuration = (startDate, endDate) => {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }

    // Get employee attendance status
    const getEmployeeAttendanceStatus = (employeeId) => {
      const today = new Date().toISOString().split('T')[0]
      const attendanceData = store.dashboardAttendances.length > 0 ? store.dashboardAttendances : store.reflections
      
      const attendance = attendanceData.find(att => 
        att.employee_id === employeeId && att.date === today
      )
      
      if (attendance) {
        switch (attendance.status) {
          case 'Hadir':
            return { text: 'Hadir', class: 'status-present' }
          case 'Terlambat':
            return { text: 'Terlambat', class: 'status-late' }
          case 'Tidak Hadir':
            return { text: 'Tidak Hadir', class: 'status-absent' }
          default:
            return { text: attendance.status, class: 'status-unknown' }
        }
      }
      
      return { text: 'Belum Absen', class: 'status-pending' }
    }

    // Join zoom for specific employee
    const joinZoomForEmployee = async (employee) => {
      try {
        // Simulate user data for the selected employee
        const userData = {
          id: employee.id,
          nama_lengkap: employee.full_name || employee.nama_lengkap || employee.name,
          name: employee.full_name || employee.nama_lengkap || employee.name,
          role: employee.position || employee.role || 'Karyawan',
          position: employee.position || employee.role || 'Karyawan'
        }
        
        // Store current user data temporarily
        const originalUser = localStorage.getItem('user')
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Call the zoom join function
        const result = await store.joinZoomMeeting()
        
        // Restore original user data
        if (originalUser) {
          localStorage.setItem('user', originalUser)
        }
        
        if (result.success) {
          // Refresh attendance data
          await refreshDashboard()
        }
        
        return result
      } catch (error) {
        console.error('Error joining zoom for employee:', error)
        return { success: false, message: 'Gagal bergabung ke Zoom' }
      }
    }

    // Join zoom meeting (original function)
    const joinZoomMeeting = async () => {
      try {
        const result = await store.joinZoomMeeting()
        if (result.success) {
          await refreshDashboard()
        }
        return result
      } catch (error) {
        console.error('Error joining zoom:', error)
        return { success: false, message: 'Gagal bergabung ke Zoom' }
      }
    }

    // Refresh dashboard data
    const refreshDashboard = async () => {
      try {
        await store.loadDashboardData()
        // Also fetch basic GA data as fallback
        await Promise.all([
          store.fetchEmployees(),
          store.fetchReflections(),
          store.fetchLeaves()
        ])
      } catch (error) {
        console.error('Error refreshing dashboard:', error)
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      
      // Load dashboard data
      await refreshDashboard()
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })



    return {
      store,
      currentTime,
      currentDate,
      todayReflections,
      todayTotalAttendance,
      pendingLeaves,
      lateArrivalsCount,
      monthlyAttendancePercentage,
      timeStatusClass,
      timeStatusText,
      formatDate,
      formatTime,
      getInitials,
      getStatusBadgeClass,
      getLeaveStatusBadgeClass,
      calculateLeaveDuration,
      refreshDashboard,
      joinZoomMeeting,
      joinZoomForEmployee,
      getEmployeeAttendanceStatus,
      showConfigPanel
    }
  }
}
</script>

<style scoped>
.ga-dashboard {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.config-btn, .refresh-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-btn {
  background: #9b59b6;
  color: white;
}

.config-btn:hover {
  background: #8e44ad;
  transform: translateY(-2px);
}

.refresh-btn {
  background: #3498db;
  color: white;
}

.refresh-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.worship-config-container {
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard {
  padding: 1rem;
  background-color: #f9fafb;
}

/* Header */
.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.time-info {
  text-align: right;
}

.current-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.time {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.2;
}

.date {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.2;
}

/* Stats Grid */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  transition: all 0.3s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.stat-icon {
  font-size: 2rem;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  color: #4b5563;
}

/* Content Sections */
.content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .content {
    grid-template-columns: 1fr 1fr;
  }
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
}

.section-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 8px;
}


/* Table Styles */
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.simple-table th {
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  padding: 0.75rem 0.5rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.simple-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  color: #2d3748;
  vertical-align: middle;
}

.simple-table tr:hover {
  background: #f7fafc;
}

.simple-table tr:last-child td {
  border-bottom: none;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-present {
  background: #c6f6d5;
  color: #22543d;
}

.status-late {
  background: #fed7d7;
  color: #742a2a;
}

.status-absent {
  background: #e2e8f0;
  color: #4a5568;
}

.status-approved {
  background: #c6f6d5;
  color: #22543d;
}

.status-pending {
  background: #fef5e7;
  color: #744210;
}

.status-rejected {
  background: #fed7d7;
  color: #742a2a;
}

/* Empty Message */
.empty-message {
  text-align: center;
  padding: 2rem 1rem;
  color: #718096;
}

.empty-message p {
  margin: 0;
  font-size: 0.875rem;
}

/* Zoom Section Styles */
.zoom-section {
  margin-bottom: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.zoom-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.hadir {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.terlambat {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.closed {
  background-color: #fee2e2;
  color: #991b1b;
}

.zoom-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.zoom-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.zoom-info .fab.fa-zoom {
  font-size: 2rem;
  color: #2563eb;
}

.zoom-details h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.zoom-details p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.zoom-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 0.875rem;
}

.zoom-time .fas.fa-clock {
  font-size: 0.75rem;
}

.btn-zoom {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-zoom:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-zoom:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Employee Zoom Access Section */
.employee-zoom-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.employee-zoom-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.employee-zoom-section .section-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.schedule-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7c3aed;
  font-weight: 500;
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.employee-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.employee-details h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.employee-details p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.attendance-status {
  margin-top: 8px;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-indicator.status-present {
  background: #dcfce7;
  color: #166534;
}

.status-indicator.status-late {
  background: #fef3c7;
  color: #92400e;
}

.status-indicator.status-absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-indicator.status-pending {
  background: #e0e7ff;
  color: #3730a3;
}

.status-indicator.status-unknown {
  background: #f3f4f6;
  color: #374151;
}

.employee-actions {
  display: flex;
  justify-content: center;
}

.btn-zoom-employee {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
  justify-content: center;
}

.btn-zoom-employee:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-zoom-employee:disabled,
.btn-zoom-employee.disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-zoom-employee.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-zoom-employee.active:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .header {
    padding: 1rem;
  }
  
  .section {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 0;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }
  
  .time-info {
    align-items: flex-start;
    width: 100%;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-number {
    font-size: 1.75rem;
  }
  
  .section {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .refresh-btn {
    width: 100%;
  }
  
  .simple-table {
    font-size: 0.75rem;
  }
  
  .simple-table th,
  .simple-table td {
    padding: 0.5rem 0.25rem;
  }
  
  .simple-table th {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .section {
    padding: 0.75rem;
  }
  
  .header {
    padding: 0.75rem;
  }
  
  .title {
    font-size: 1.25rem;
  }
  
  .time {
    font-size: 1rem;
  }
  
  .simple-table th,
  .simple-table td {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }
  
  .status-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }
}

/* Loading and transition states */
.section {
  transition: opacity 0.3s ease;
}

.section.loading {
  opacity: 0.7;
}

/* Accessibility improvements */
.refresh-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.nav-link:focus,
.simple-table:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
