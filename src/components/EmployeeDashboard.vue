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

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card" @click="$router.push('/employee/request-leave')">
        <div class="action-icon">
          <i class="fas fa-calendar-plus"></i>
        </div>
        <div class="action-content">
          <h3>Ajukan Cuti</h3>
          <p>Buat permohonan cuti baru</p>
        </div>
      </div>
      
      <div class="action-card" @click="showLeaveHistory">
        <div class="action-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="action-content">
          <h3>Riwayat Cuti</h3>
          <p>Lihat status permohonan cuti</p>
        </div>
      </div>
    </div>

    <!-- Leave Summary -->
    <div class="leave-summary">
      <h2>Ringkasan Cuti</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <h3>{{ leaveQuota.remaining || 0 }}</h3>
          <p>Sisa Cuti Tahunan</p>
        </div>
        <div class="summary-card">
          <h3>{{ leaveStats.pending || 0 }}</h3>
          <p>Menunggu Persetujuan</p>
        </div>
        <div class="summary-card">
          <h3>{{ leaveStats.approved || 0 }}</h3>
          <p>Cuti Disetujui</p>
        </div>
      </div>
    </div>

    <!-- Recent Leave Requests -->
    <div class="recent-requests">
      <h2>Permohonan Cuti Terbaru</h2>
      <div class="requests-table" v-if="recentRequests.length">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Tanggal Pengajuan</th>
              <th>Jenis Cuti</th>
              <th>Periode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in recentRequests" :key="request.id">
              <td>{{ formatDate(request.created_at) }}</td>
              <td>{{ getLeaveTypeName(request.leave_type) }}</td>
              <td>{{ formatDate(request.start_date) }} - {{ formatDate(request.end_date) }}</td>
              <td>
                <span class="status-badge" :class="request.status">
                  {{ getStatusName(request.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        <p>Belum ada permohonan cuti</p>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService'

export default {
  name: 'EmployeeDashboard',
  data() {
    return {
      userName: '',
      userRole: '',
      leaveQuota: {
        remaining: 12,
        used: 3,
        total: 15
      },
      leaveStats: {
        pending: 2,
        approved: 8
      },
      recentRequests: [],
      showHistoryModal: false,
      managerInfo: {
        name: '',
        type: ''
      }
    }
  },
  async mounted() {
    await this.loadUserData()
    await this.loadLeaveData()
    await this.loadManagerInfo()
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
        console.log('Loading user data in EmployeeDashboard:', user)
        
        this.userName = user.nama_lengkap || user.name || user.fullName || 'Karyawan'
        
        // Verify user role - accept all employee types
        const validEmployeeRoles = [
          'Employee', 'Finance', 'General Affairs', 'Office Assistant',
          'Producer', 'Creative', 'Production', 'Editor',
          'Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care'
        ]
        if (!validEmployeeRoles.includes(user.role)) {
          console.warn('User role mismatch in EmployeeDashboard:', user.role)
        }
        
        // Store user role for manager identification
        this.userRole = user.role
      } catch (error) {
        console.error('Error loading user data in EmployeeDashboard:', error)
        this.userName = 'Karyawan'
      }
    },
    
    async loadLeaveData() {
      try {
        const response = await axios.get('/api/leave-requests', {
          params: { employee_id: this.userId }
        })
        
        const requests = response.data
        this.recentRequests = requests.slice(0, 5)
        
        // Calculate stats
        this.leaveStats.pending = requests.filter(r => r.status === 'pending').length
        this.leaveStats.approved = requests.filter(r => r.status === 'approved').length
        
      } catch (error) {
        console.error('Error loading leave data:', error)
      }
    },

    async loadManagerInfo() {
      try {
        // Get manager info based on employee's role and department
        const response = await axios.get('/api/employees/manager-info', {
          params: { 
            employee_role: this.userRole,
            employee_id: this.userId 
          }
        })
        
        if (response.data) {
          this.managerInfo.name = response.data.manager_name
          this.managerInfo.type = response.data.manager_type
        }
        
      } catch (error) {
        console.error('Error loading manager info:', error)
        // Set default manager info if API fails
        this.managerInfo.name = 'HR Manager'
        this.managerInfo.type = 'HR Manager'
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID')
    },
    
    getLeaveTypeName(type) {
      const types = {
        annual: 'Cuti Tahunan',
        sick: 'Cuti Sakit',
        emergency: 'Cuti Darurat',
        maternity: 'Cuti Melahirkan',
        paternity: 'Cuti Ayah'
      }
      return types[type] || type
    },
    
    getStatusName(status) {
      const statuses = {
        pending: 'Menunggu Persetujuan',
        approved: 'Disetujui',
        rejected: 'Ditolak'
      }
      return statuses[status] || status
    },
    
    showLeaveHistory() {
      // For now, just show an alert. Later can be expanded to show modal or navigate to history page
      alert('Fitur riwayat cuti akan segera tersedia')
    }
  }
}
</script>

<style scoped>
.employee-dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: #1f2937;
  margin-bottom: 5px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.action-icon {
  width: 50px;
  height: 50px;
  background: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.action-content h3 {
  margin: 0 0 5px 0;
  color: #1f2937;
}

.action-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.leave-summary, .recent-requests {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.summary-card {
  text-align: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-card h3 {
  font-size: 24px;
  margin: 0 0 5px 0;
  color: #3b82f6;
}

.summary-card p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.modern-table th,
.modern-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.employee-info {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  font-size: 14px;
  color: #0369a1;
}

.manager-info i {
  color: #0284c7;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}
</style>