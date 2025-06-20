<template>
  <div class="employee-request-leave-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1>Permohonan Cuti</h1>
      <p>Ajukan permohonan cuti sesuai dengan prosedur perusahaan</p>
    </div>

    <!-- Debug Info (untuk troubleshooting) -->
    <div v-if="showDebugInfo" class="debug-info">
      <h3>Debug Information:</h3>
      <p><strong>User Role:</strong> {{ userRole }}</p>
      <p><strong>User Department:</strong> {{ userDepartment }}</p>
      <p><strong>Token:</strong> {{ token ? 'Present' : 'Missing' }}</p>
      <p><strong>User ID:</strong> {{ userId }}</p>
    </div>

    <!-- Leave Request Form -->
    <div class="form-section">
      <div class="form-card">
        <div class="card-header">
          <h2>Form Permohonan Cuti</h2>
          <div class="workflow-info">
            <div class="workflow-details">
              <span class="workflow-badge" :class="workflowClass">{{ workflowText }}</span>
              <div class="manager-info">
                <i class="fas fa-user-tie"></i>
                <span>Permohonan akan dikirim ke: <strong>{{ approvalManagerText }}</strong></span>
              </div>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="submitLeaveRequest" class="leave-form">
          <!-- Leave Type -->
          <div class="form-group">
            <label for="leave_type" class="form-label">Jenis Cuti *</label>
            <select 
              id="leave_type" 
              v-model="leaveForm.leave_type" 
              class="form-select"
              required
            >
              <option value="">Pilih Jenis Cuti</option>
              <option value="annual">Cuti Tahunan</option>
              <option value="sick">Cuti Sakit</option>
              <option value="emergency">Cuti Darurat</option>
              <option value="maternity">Cuti Melahirkan</option>
              <option value="paternity">Cuti Ayah</option>
              <option value="marriage">Cuti Menikah</option>
              <option value="bereavement">Cuti Duka</option>
            </select>
          </div>

          <!-- Start Date -->
          <div class="form-group">
            <label for="start_date" class="form-label">Tanggal Mulai *</label>
            <input 
              id="start_date"
              type="date" 
              v-model="leaveForm.start_date" 
              class="form-input"
              required
              :min="minDate"
            >
          </div>

          <!-- End Date -->
          <div class="form-group">
            <label for="end_date" class="form-label">Tanggal Selesai *</label>
            <input 
              id="end_date"
              type="date" 
              v-model="leaveForm.end_date" 
              class="form-input"
              required
              :min="leaveForm.start_date || minDate"
            >
          </div>

          <!-- Duration Display -->
          <div v-if="leaveDuration > 0" class="duration-display">
            <div class="duration-card">
              <i class="fas fa-calendar-days"></i>
              <span>Durasi: {{ leaveDuration }} hari</span>
            </div>
          </div>

          <!-- Reason -->
          <div class="form-group">
            <label for="reason" class="form-label">Alasan Cuti *</label>
            <textarea 
              id="reason"
              v-model="leaveForm.reason" 
              class="form-textarea"
              rows="4"
              placeholder="Jelaskan alasan pengajuan cuti..."
              required
            ></textarea>
          </div>

          <!-- Emergency Contact (for longer leaves) -->
          <div v-if="leaveDuration > 3" class="form-group">
            <label for="emergency_contact" class="form-label">Kontak Darurat</label>
            <input 
              id="emergency_contact"
              type="text" 
              v-model="leaveForm.emergency_contact" 
              class="form-input"
              placeholder="Nomor telepon yang dapat dihubungi"
            >
          </div>

          <!-- Work Handover -->
          <div v-if="leaveDuration > 1" class="form-group">
            <label for="work_handover" class="form-label">Serah Terima Pekerjaan</label>
            <textarea 
              id="work_handover"
              v-model="leaveForm.work_handover" 
              class="form-textarea"
              rows="3"
              placeholder="Jelaskan serah terima pekerjaan selama cuti..."
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button 
              type="button" 
              @click="resetForm" 
              class="btn btn-secondary"
              :disabled="isSubmitting"
            >
              Reset
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isSubmitting || !isFormValid"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              {{ isSubmitting ? 'Mengirim...' : 'Ajukan Cuti' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- My Leave Requests -->
    <div class="requests-section">
      <div class="section-header">
        <h2>Riwayat Permohonan Cuti</h2>
        <div class="filter-controls">
          <select v-model="statusFilter" @change="fetchMyLeaveRequests" class="filter-select">
            <option value="">Semua Status</option>
            <option value="pending_manager">Menunggu Manager</option>
            <option value="pending_hr">Menunggu HR</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      <div class="requests-grid">
        <div 
          v-for="request in myLeaveRequests" 
          :key="request.id" 
          class="request-card"
          :class="`status-${request.overall_status || request.status}`"
        >
          <div class="request-header">
            <div class="request-type">
              <i class="fas fa-calendar-alt"></i>
              <span>{{ getLeaveTypeLabel(request.leave_type) }}</span>
            </div>
            <div class="request-status">
              <span class="status-badge" :class="`status-${request.overall_status || request.status}`">
                {{ getStatusLabel(request.overall_status || request.status) }}
              </span>
            </div>
          </div>
          
          <div class="request-details">
            <div class="detail-row">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(request.start_date) }} - {{ formatDate(request.end_date) }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-clock"></i>
              <span>{{ calculateDuration(request.start_date, request.end_date) }} hari</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-user-tie"></i>
              <span>{{ getApproverInfo(request) }}</span>
            </div>
          </div>
          
          <div class="request-reason">
            <p>{{ request.reason }}</p>
          </div>
          
          <div v-if="request.notes || request.manager_notes || request.hr_notes" class="request-notes">
            <div class="notes-header">
              <i class="fas fa-comment"></i>
              <span>Catatan:</span>
            </div>
            <p>{{ request.notes || request.manager_notes || request.hr_notes }}</p>
          </div>
          
          <div class="request-footer">
            <small>Diajukan: {{ formatDateTime(request.created_at) }}</small>
            <div v-if="(request.overall_status || request.status) === 'pending'" class="request-actions">
              <button 
                @click="cancelRequest(request.id)" 
                class="btn btn-sm btn-danger"
                :disabled="isSubmitting"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="myLeaveRequests.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Belum Ada Permohonan Cuti</h3>
        <p>Anda belum pernah mengajukan permohonan cuti</p>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <i :class="notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EmployeeRequestLeave',
  data() {
    return {
      apiUrl: 'http://127.0.0.1:8000',
      isSubmitting: false,
      statusFilter: '',
      showDebugInfo: false, // Set to true untuk debugging
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      leaveForm: {
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        emergency_contact: '',
        work_handover: ''
      },
      myLeaveRequests: [],
      userRole: '',
      userDepartment: '',
      userId: null,
      token: null
    }
  },
  computed: {
    minDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    leaveDuration() {
      if (!this.leaveForm.start_date || !this.leaveForm.end_date) return 0
      const start = new Date(this.leaveForm.start_date)
      const end = new Date(this.leaveForm.end_date)
      const diffTime = Math.abs(end - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    },
    isFormValid() {
      return this.leaveForm.leave_type && 
             this.leaveForm.start_date && 
             this.leaveForm.end_date && 
             this.leaveForm.reason.trim().length > 0
    },
    workflowClass() {
      const programRoles = ['Producer', 'Creative', 'Production', 'Editor']
      if (programRoles.includes(this.userRole)) return 'workflow-program'
      
      const distributionRoles = ['Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care']
      if (distributionRoles.includes(this.userRole)) return 'workflow-distribution'
      
      const hrRoles = ['Finance', 'General Affairs', 'Office Assistant']
      if (hrRoles.includes(this.userRole)) return 'workflow-hr'
      
      return 'workflow-hr'
    },
    workflowText() {
      const programRoles = ['Producer', 'Creative', 'Production', 'Editor']
      if (programRoles.includes(this.userRole)) return 'Ke Program Manager → HR'
      
      const distributionRoles = ['Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care']
      if (distributionRoles.includes(this.userRole)) return 'Ke Distribution Manager → HR'
      
      const hrRoles = ['Finance', 'General Affairs', 'Office Assistant']
      if (hrRoles.includes(this.userRole)) return 'Ke HR Manager'
      
      return 'Ke HR Manager'
    },
    approvalManagerText() {
      const programRoles = ['Producer', 'Creative', 'Production', 'Editor']
      if (programRoles.includes(this.userRole)) return 'Program Manager'
      
      const distributionRoles = ['Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care']
      if (distributionRoles.includes(this.userRole)) return 'Distribution Manager'
      
      const hrRoles = ['Finance', 'General Affairs', 'Office Assistant']
      if (hrRoles.includes(this.userRole)) return 'HR Manager'
      
      return 'HR Manager'
    }
  },
  async mounted() {
    await this.getUserInfo()
    await this.fetchMyLeaveRequests()
  },
  methods: {
    async getUserInfo() {
      try {
        this.token = localStorage.getItem('token')
        
        // Get fresh user data from API
        const response = await axios.get(`${this.apiUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json'
          }
        })
        
        if (response.data && response.data.data) {
          const user = response.data.data
          this.userRole = user.role || ''
          this.userDepartment = user.employee?.department || ''
          this.userId = user.id
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(user))
          
          console.log('User Info Updated:', {
            role: this.userRole,
            department: this.userDepartment,
            userId: this.userId,
            hasToken: !!this.token
          })
        }
      } catch (error) {
        console.error('Error getting user info:', error)
        
        // Fallback to localStorage
        try {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            const user = JSON.parse(userStr)
            this.userRole = user.role || ''
            this.userDepartment = user.employee?.department || ''
            this.userId = user.id
            this.token = localStorage.getItem('token')
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError)
          this.showNotificationMessage('Gagal memuat informasi user', 'error')
        }
      }
    },
    
    async submitLeaveRequest() {
      if (!this.isFormValid) return

      // Enhanced validation checks
      if (!this.token) {
        this.showNotificationMessage('Token tidak ditemukan, silakan login ulang', 'error')
        this.$router.push('/login')
        return
      }

      if (!this.userRole) {
        this.showNotificationMessage('Role user tidak ditemukan', 'error')
        return
      }

      this.isSubmitting = true
      
      try {
        console.log('Submitting leave request with data:', {
          ...this.leaveForm,
          userRole: this.userRole,
          userId: this.userId
        })

        const response = await axios.post(
          `${this.apiUrl}/api/leave-requests`,
          {
            leave_type: this.leaveForm.leave_type,
            start_date: this.leaveForm.start_date,
            end_date: this.leaveForm.end_date,
            reason: this.leaveForm.reason,
            emergency_contact: this.leaveForm.emergency_contact,
            work_handover: this.leaveForm.work_handover
          },
          {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }
        )
        
        console.log('Leave request response:', response.data)
        
        if (response.data.success) {
          this.showNotificationMessage('Permohonan cuti berhasil diajukan!', 'success')
          this.resetForm()
          await this.fetchMyLeaveRequests()
        } else {
          this.showNotificationMessage(response.data.message || 'Gagal mengajukan permohonan cuti', 'error')
        }
      } catch (error) {
        console.error('Error submitting leave request:', error)
        console.error('Error response:', error.response?.data)
        
        let errorMessage = 'Gagal mengajukan permohonan cuti'
        
        if (error.response?.status === 403) {
          const responseMessage = error.response?.data?.message || ''
          if (responseMessage.includes('Required roles: Employee')) {
            errorMessage = `Backend mengharapkan role "Employee" tetapi Anda memiliki role "${this.userRole}". Hubungi administrator untuk memperbaiki konfigurasi role.`
          } else {
            errorMessage = `Akses ditolak: ${responseMessage}`
          }
        } else if (error.response?.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir, silakan login ulang'
          this.$router.push('/login')
          return
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        this.showNotificationMessage(errorMessage, 'error')
      } finally {
        this.isSubmitting = false
      }
    },

    async fetchMyLeaveRequests() {
      try {
        if (!this.token) return

        const params = new URLSearchParams()
        if (this.statusFilter) params.append('status', this.statusFilter)
        params.append('my_requests', 'true')
        
        const response = await axios.get(
          `${this.apiUrl}/api/leave-requests?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.data.success) {
          this.myLeaveRequests = response.data.data || []
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error)
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      }
    },

    async cancelRequest(requestId) {
      if (!confirm('Apakah Anda yakin ingin membatalkan permohonan cuti ini?')) return
      
      this.isSubmitting = true
      try {
        const response = await axios.delete(
          `${this.apiUrl}/api/leave-requests/${requestId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.data.success) {
          this.showNotificationMessage('Permohonan cuti berhasil dibatalkan', 'success')
          await this.fetchMyLeaveRequests()
        }
      } catch (error) {
        console.error('Error canceling leave request:', error)
        this.showNotificationMessage('Gagal membatalkan permohonan cuti', 'error')
      } finally {
        this.isSubmitting = false
      }
    },

    resetForm() {
      this.leaveForm = {
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        emergency_contact: '',
        work_handover: ''
      }
    },

    getLeaveTypeLabel(type) {
      const types = {
        'annual': 'Cuti Tahunan',
        'sick': 'Cuti Sakit',
        'emergency': 'Cuti Darurat',
        'maternity': 'Cuti Melahirkan',
        'paternity': 'Cuti Ayah',
        'marriage': 'Cuti Menikah',
        'bereavement': 'Cuti Duka'
      }
      return types[type] || type
    },

    getStatusLabel(status) {
      const statuses = {
        'pending_manager': 'Menunggu Manager',
        'pending_hr': 'Menunggu HR',
        'approved': 'Disetujui',
        'rejected': 'Ditolak',
        'pending': 'Menunggu'
      }
      return statuses[status] || status
    },

    getApproverInfo(request) {
      if (request.overall_status === 'approved') {
        return 'Disetujui'
      } else if (request.overall_status === 'rejected') {
        return 'Ditolak'
      } else if (request.overall_status === 'pending_hr') {
        return 'Menunggu HR'
      } else if (request.overall_status === 'pending_manager') {
        return 'Menunggu Manager'
      }
      return 'Menunggu Persetujuan'
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    formatDateTime(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    },

    showNotificationMessage(message, type) {
      this.notificationMessage = message
      this.notificationType = type
      this.showNotification = true
      setTimeout(() => {
        this.showNotification = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
.employee-request-leave-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-info {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.debug-info h3 {
  color: #0c4a6e;
  margin-bottom: 10px;
}

.debug-info p {
  margin: 5px 0;
  color: #0c4a6e;
}

.workflow-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.manager-info i {
  color: #007bff;
}

.manager-info strong {
  color: #333;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 1.1rem;
  color: #6b7280;
}

.form-section {
  margin-bottom: 48px;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.workflow-info {
  display: flex;
  align-items: center;
}

.workflow-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.workflow-hr { background-color: #10b981; }
.workflow-program { background-color: #3b82f6; }
.workflow-distribution { background-color: #8b5cf6; }

.leave-form {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.duration-display {
  margin: 16px 0;
}

.duration-card {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0c4a6e;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.75rem;
}

.requests-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  background: #f8fafc;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.requests-grid {
  padding: 24px;
  display: grid;
  gap: 16px;
}

.request-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.request-card.status-pending,
.request-card.status-pending_manager {
  border-color: #f59e0b;
  background: #fffbeb;
}

.request-card.status-pending_hr {
  border-color: #3b82f6;
  background: #eff6ff;
}

.request-card.status-approved {
  border-color: #10b981;
  background: #ecfdf5;
}

.request-card.status-rejected {
  border-color: #ef4444;
  background: #fef2f2;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.request-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-pending,
.status-badge.status-pending_manager {
  background: #fbbf24;
  color: #92400e;
}

.status-badge.status-pending_hr {
  background: #60a5fa;
  color: #1e40af;
}

.status-badge.status-approved {
  background: #34d399;
  color: #065f46;
}

.status-badge.status-rejected {
  background: #f87171;
  color: #991b1b;
}

.request-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.request-reason {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.request-reason p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.request-notes {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.request-notes p {
  margin: 0;
  color: #92400e;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.request-footer small {
  color: #6b7280;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #10b981;
}

.notification.error {
  background: #ef4444;
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
  .employee-request-leave-container {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .leave-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .request-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .request-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
