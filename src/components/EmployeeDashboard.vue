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
          <h3>{{ leaveStats.pending || 0 }}</h3>
          <p>Menunggu Persetujuan</p>
        </div>
        <div class="summary-card">
          <h3>{{ leaveStats.approved || 0 }}</h3>
          <p>Cuti Disetujui</p>
        </div>
        <div class="summary-card">
          <h3>{{ leaveStats.rejected || 0 }}</h3>
          <p>Cuti Ditolak</p>
        </div>
      </div>
    </div>

    <!-- Detailed Leave Quota -->
    <div class="leave-quota-detail">
      <h2>Jatah Cuti Saya ({{ currentYear }})</h2>
      <div class="quota-grid" v-if="leaveQuota.id">
        <div class="quota-item">
          <div class="quota-header">
            <h4>Cuti Tahunan</h4>
            <span class="quota-numbers">{{ leaveQuota.annual_leave_used || 0 }}/{{ leaveQuota.annual_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress annual" :style="{ width: getQuotaPercentage(leaveQuota.annual_leave_used, leaveQuota.annual_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.annual_leave_quota || 0) - (leaveQuota.annual_leave_used || 0) }} hari</p>
        </div>

        <div class="quota-item">
          <div class="quota-header">
            <h4>Cuti Sakit</h4>
            <span class="quota-numbers">{{ leaveQuota.sick_leave_used || 0 }}/{{ leaveQuota.sick_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress sick" :style="{ width: getQuotaPercentage(leaveQuota.sick_leave_used, leaveQuota.sick_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.sick_leave_quota || 0) - (leaveQuota.sick_leave_used || 0) }} hari</p>
        </div>

        <div class="quota-item">
          <div class="quota-header">
            <h4>Cuti Darurat</h4>
            <span class="quota-numbers">{{ leaveQuota.emergency_leave_used || 0 }}/{{ leaveQuota.emergency_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress emergency" :style="{ width: getQuotaPercentage(leaveQuota.emergency_leave_used, leaveQuota.emergency_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.emergency_leave_quota || 0) - (leaveQuota.emergency_leave_used || 0) }} hari</p>
        </div>

        <div class="quota-item" v-if="leaveQuota.maternity_leave_quota > 0">
          <div class="quota-header">
            <h4>Cuti Melahirkan</h4>
            <span class="quota-numbers">{{ leaveQuota.maternity_leave_used || 0 }}/{{ leaveQuota.maternity_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress maternity" :style="{ width: getQuotaPercentage(leaveQuota.maternity_leave_used, leaveQuota.maternity_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.maternity_leave_quota || 0) - (leaveQuota.maternity_leave_used || 0) }} hari</p>
        </div>

        <div class="quota-item" v-if="leaveQuota.paternity_leave_quota > 0">
          <div class="quota-header">
            <h4>Cuti Ayah</h4>
            <span class="quota-numbers">{{ leaveQuota.paternity_leave_used || 0 }}/{{ leaveQuota.paternity_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress paternity" :style="{ width: getQuotaPercentage(leaveQuota.paternity_leave_used, leaveQuota.paternity_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.paternity_leave_quota || 0) - (leaveQuota.paternity_leave_used || 0) }} hari</p>
        </div>

        <div class="quota-item" v-if="leaveQuota.marriage_leave_quota > 0">
          <div class="quota-header">
            <h4>Cuti Nikah</h4>
            <span class="quota-numbers">{{ leaveQuota.marriage_leave_used || 0 }}/{{ leaveQuota.marriage_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress marriage" :style="{ width: getQuotaPercentage(leaveQuota.marriage_leave_used, leaveQuota.marriage_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.marriage_leave_quota || 0) - (leaveQuota.marriage_leave_used || 0) }} hari</p>
        </div>

        <div class="quota-item" v-if="leaveQuota.bereavement_leave_quota > 0">
          <div class="quota-header">
            <h4>Cuti Duka</h4>
            <span class="quota-numbers">{{ leaveQuota.bereavement_leave_used || 0 }}/{{ leaveQuota.bereavement_leave_quota || 0 }}</span>
          </div>
          <div class="quota-bar">
            <div class="quota-progress bereavement" :style="{ width: getQuotaPercentage(leaveQuota.bereavement_leave_used, leaveQuota.bereavement_leave_quota) + '%' }"></div>
          </div>
          <p class="quota-remaining">Sisa: {{ (leaveQuota.bereavement_leave_quota || 0) - (leaveQuota.bereavement_leave_used || 0) }} hari</p>
        </div>
      </div>
      
      <div v-else class="no-quota">
        <i class="fas fa-calendar-times"></i>
        <h3>Belum ada jatah cuti</h3>
        <p>Hubungi HR untuk mengatur jatah cuti Anda</p>
      </div>
    </div>

    <!-- Recent Leave Requests with Approval Tracking -->
    <div class="recent-requests">
      <h2>Permohonan Cuti Terbaru</h2>
      <div class="requests-table" v-if="recentRequests.length">
        <div v-for="request in recentRequests" :key="request.id" class="request-card">
          <div class="request-header">
            <div class="request-info">
              <h3>{{ getLeaveTypeName(request.leave_type) }}</h3>
              <p class="request-period">{{ formatDate(request.start_date) }} - {{ formatDate(request.end_date) }}</p>
              <p class="request-duration">{{ request.total_days || calculateDuration(request.start_date, request.end_date) }} hari</p>
            </div>
            <div class="request-status">
              <span class="status-badge" :class="getStatusClass(request.status)">
                {{ getDetailedStatusName(request.status) }}
              </span>
            </div>
          </div>
          
          <!-- Approval Progress Tracker -->
          <div class="approval-tracker">
            <div class="approval-step" :class="{ 'completed': isStepCompleted(request, 'submitted'), 'active': isStepActive(request, 'submitted') }">
              <div class="step-icon">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="step-content">
                <h4>Permohonan Diajukan</h4>
                <p>{{ formatDate(request.created_at) }}</p>
              </div>
            </div>
            
            <div class="approval-step" :class="{ 'completed': isStepCompleted(request, 'manager'), 'active': isStepActive(request, 'manager'), 'rejected': isStepRejected(request, 'manager') }">
              <div class="step-icon">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="step-content">
                <h4>{{ getManagerApprovalText(request) }}</h4>
                <p v-if="request.manager_approved_at || request.status.includes('approved_by')">{{ request.manager_approved_at ? formatDate(request.manager_approved_at) : 'Disetujui' }}</p>
                <p v-else-if="request.status === 'pending'" class="pending-text">Menunggu persetujuan...</p>
                <p v-if="request.manager_notes" class="approval-notes">{{ request.manager_notes }}</p>
                <p v-if="request.rejection_reason" class="rejection-reason">{{ request.rejection_reason }}</p>
              </div>
            </div>
            
            <div v-if="needsHRApproval(request)" class="approval-step" :class="{ 'completed': isStepCompleted(request, 'hr'), 'active': isStepActive(request, 'hr'), 'rejected': isStepRejected(request, 'hr') }">
              <div class="step-icon">
                <i class="fas fa-user-shield"></i>
              </div>
              <div class="step-content">
                <h4>Persetujuan HR Manager</h4>
                <p v-if="request.hr_approved_at">{{ formatDate(request.hr_approved_at) }}</p>
                <p v-else-if="request.status.includes('approved_by') && !request.status.includes('rejected')" class="pending-text">Menunggu persetujuan HR...</p>
                <p v-if="request.hr_notes" class="approval-notes">{{ request.hr_notes }}</p>
              </div>
            </div>
            
            <div class="approval-step" :class="{ 'completed': request.status === 'approved', 'rejected': request.status === 'rejected' || request.status === 'rejected_by_manager' || request.status === 'rejected_by_hr' }">
              <div class="step-icon">
                <i :class="request.status === 'approved' ? 'fas fa-check-circle' : request.status.includes('rejected') ? 'fas fa-times-circle' : 'fas fa-clock'"></i>
              </div>
              <div class="step-content">
                <h4>{{ getFinalStatusText(request.status) }}</h4>
                <p v-if="request.final_approved_at">{{ formatDate(request.final_approved_at) }}</p>
              </div>
            </div>
          </div>
          
          <!-- Request Details -->
          <div class="request-details">
            <div class="detail-item">
              <strong>Alasan:</strong> {{ request.reason }}
            </div>
            <div v-if="request.emergency_contact && request.leave_type === 'emergency'" class="detail-item">
              <strong>Kontak Darurat:</strong> {{ request.emergency_contact }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Belum ada permohonan cuti</p>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService'
import axios from 'axios'

export default {
  name: 'EmployeeDashboard',
  data() {
    return {
      userName: '',
      userRole: '',
      leaveQuota: {
        id: null,
        remaining: 12,
        used: 3,
        total: 15,
        annual_leave_quota: 0,
        annual_leave_used: 0,
        sick_leave_quota: 0,
        sick_leave_used: 0,
        emergency_leave_quota: 0,
        emergency_leave_used: 0,
        maternity_leave_quota: 0,
        maternity_leave_used: 0,
        paternity_leave_quota: 0,
        paternity_leave_used: 0,
        marriage_leave_quota: 0,
        marriage_leave_used: 0,
        bereavement_leave_quota: 0,
        bereavement_leave_used: 0
      },
      leaveStats: {
        pending: 2,
        approved: 8,
        rejected: 0
      },
      recentRequests: [],
      showHistoryModal: false,
      managerInfo: {
        name: '',
        type: ''
      },
      userId: null
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
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
        this.userId = user.id || user.user_id
        
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
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:8000/api/leave-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: { 
            employee_id: this.userId,
            include_details: true // Request detailed approval information
          }
        })
        
        const requests = response.data.data || response.data
        this.recentRequests = requests.slice(0, 5)
        
        // Calculate stats with more detailed status
        this.leaveStats.pending = requests.filter(r => 
          r.status === 'pending' || r.status.includes('approved_by')
        ).length
        this.leaveStats.approved = requests.filter(r => r.status === 'approved').length
        this.leaveStats.rejected = requests.filter(r => r.status.includes('rejected')).length
        
      } catch (error) {
        console.error('Error loading leave data:', error)
        // Set default empty data if API fails
        this.recentRequests = []
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
    
    getDetailedStatusName(status) {
      const statuses = {
        pending: 'Menunggu Persetujuan Manager',
        approved_by_manager: 'Disetujui Manager - Menunggu HR',
        approved_by_distribution: 'Disetujui Distribution Manager - Menunggu HR',
        approved_by_program: 'Disetujui Program Manager - Menunggu HR',
        approved: 'Disetujui Final',
        rejected: 'Ditolak',
        rejected_by_manager: 'Ditolak oleh Manager',
        rejected_by_hr: 'Ditolak oleh HR'
      }
      return statuses[status] || status
    },
    
    getStatusClass(status) {
      if (status === 'approved') return 'approved'
      if (status.includes('rejected')) return 'rejected'
      if (status.includes('approved_by')) return 'approved-pending'
      return 'pending'
    },
    
    getManagerApprovalText(request) {
      // Determine which manager should approve based on user role
      if (this.userRole === 'Social Media' || this.userRole === 'Promotion' || this.userRole === 'Graphic Design' || this.userRole === 'Hopeline Care') {
        return 'Persetujuan Distribution Manager'
      } else if (this.userRole === 'Producer' || this.userRole === 'Creative' || this.userRole === 'Production' || this.userRole === 'Editor') {
        return 'Persetujuan Program Manager'
      } else if (this.userRole === 'Finance' || this.userRole === 'General Affairs' || this.userRole === 'Office Assistant') {
        return 'Persetujuan HR Manager'
      }
      return 'Persetujuan Manager'
    },
    
    needsHRApproval(request) {
      // HR approval needed if user is under Distribution Manager or Program Manager
      return ['Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care', 'Producer', 'Creative', 'Production', 'Editor'].includes(this.userRole)
    },
    
    isStepCompleted(request, step) {
      switch (step) {
        case 'submitted':
          return true // Always completed if request exists
        case 'manager':
          return request.status !== 'pending' && !request.status.includes('rejected')
        case 'hr':
          return request.status === 'approved'
        default:
          return false
      }
    },
    
    isStepActive(request, step) {
      switch (step) {
        case 'submitted':
          return request.status === 'pending'
        case 'manager':
          return request.status === 'pending'
        case 'hr':
          return request.status.includes('approved_by') && !request.status.includes('rejected')
        default:
          return false
      }
    },
    
    isStepRejected(request, step) {
      switch (step) {
        case 'manager':
          return request.status === 'rejected_by_manager' || request.status === 'rejected'
        case 'hr':
          return request.status === 'rejected_by_hr'
        default:
          return false
      }
    },
    
    isWaitingForHR(request) {
      return request.status.includes('approved_by')
    },
    
    getFinalStatusText(status) {
      if (status === 'approved') return 'Cuti Disetujui'
      if (status.includes('rejected')) return 'Cuti Ditolak'
      return 'Menunggu Proses'
    },
    
    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    },
    
    showLeaveHistory() {
      // For now, just show an alert. Later can be expanded to show modal or navigate to history page
      alert('Fitur riwayat cuti akan segera tersedia')
    },
    
    getQuotaPercentage(used, total) {
      if (!total || total === 0) return 0;
      return Math.min((used / total) * 100, 100);
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

/* Leave Quota Detail Styles */
.leave-quota-detail {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.leave-quota-detail h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.quota-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.quota-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #3498db;
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quota-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.quota-numbers {
  font-weight: bold;
  color: #34495e;
  font-size: 0.9rem;
}

.quota-bar {
  background: #ecf0f1;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.quota-progress {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.quota-progress.annual {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.quota-progress.sick {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.quota-progress.emergency {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.quota-progress.maternity {
  background: linear-gradient(90deg, #e91e63, #ad1457);
}

.quota-progress.paternity {
  background: linear-gradient(90deg, #9c27b0, #7b1fa2);
}

.quota-progress.marriage {
  background: linear-gradient(90deg, #ff9800, #f57c00);
}

.quota-progress.bereavement {
  background: linear-gradient(90deg, #607d8b, #455a64);
}

.quota-remaining {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.no-quota {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-quota i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.no-quota h3 {
  margin: 0 0 0.5rem 0;
  color: #95a5a6;
}

.no-quota p {
  margin: 0;
  font-size: 0.9rem;
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

/* Request Card Styles */
.request-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #e5e7eb;
}

.request-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.request-info h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.request-period {
  margin: 0 0 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.request-duration {
  margin: 0;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
}

.request-status .status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.approved-pending {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Approval Tracker Styles */
.approval-tracker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.approval-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.approval-step.completed {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.approval-step.active {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  animation: pulse 2s infinite;
}

.approval-step.rejected {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.approval-step.completed .step-icon {
  background: #10b981;
  color: white;
}

.approval-step.active .step-icon {
  background: #3b82f6;
  color: white;
}

.approval-step.rejected .step-icon {
  background: #ef4444;
  color: white;
}

.approval-step:not(.completed):not(.active):not(.rejected) .step-icon {
  background: #e5e7eb;
  color: #6b7280;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.step-content p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.pending-text {
  color: #f59e0b !important;
  font-style: italic;
}

.approval-notes {
  color: #059669 !important;
  font-style: italic;
  margin-top: 4px !important;
}

.rejection-reason {
  color: #dc2626 !important;
  font-style: italic;
  margin-top: 4px !important;
}

/* Request Details */
.request-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.detail-item strong {
  color: #1f2937;
  margin-right: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .approval-tracker {
    padding: 16px;
  }
  
  .approval-step {
    padding: 8px;
  }
  
  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .request-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .request-info h3 {
    font-size: 16px;
  }
}
</style>