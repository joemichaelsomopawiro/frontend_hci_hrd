<template>
  <div class="penerimaan-permohonan-cuti">
    <!-- Header -->
    <div class="page-header">
      <h1>Penerimaan Permohonan Cuti</h1>
      <p>Kelola dan proses permohonan cuti karyawan</p>
    </div>

    <!-- Filter Controls -->
    <div class="filter-section">
      <div class="filter-card">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="selectedStatus" @change="loadRequests" class="filter-select">
            <option value="">Semua Status</option>
            <option value="pending_manager">Menunggu Manager</option>
            <option value="pending_hr">Menunggu HR</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Jenis Cuti:</label>
          <select v-model="selectedLeaveType" @change="loadRequests" class="filter-select">
            <option value="">Semua Jenis</option>
            <option value="annual">Cuti Tahunan</option>
            <option value="sick">Cuti Sakit</option>
            <option value="emergency">Cuti Darurat</option>
            <option value="maternity">Cuti Melahirkan</option>
            <option value="paternity">Cuti Ayah</option>
          </select>
        </div>
        
        <div class="filter-group">
          <button @click="refreshData" class="btn btn-primary" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card pending">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.pending || 0 }}</h3>
          <p>Menunggu Approval</p>
        </div>
      </div>
      
      <div class="stat-card approved">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.approved || 0 }}</h3>
          <p>Disetujui</p>
        </div>
      </div>
      
      <div class="stat-card rejected">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.rejected || 0 }}</h3>
          <p>Ditolak</p>
        </div>
      </div>
      
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ statistics.total || 0 }}</h3>
          <p>Total Permohonan</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data permohonan cuti...</p>
    </div>

    <!-- Leave Requests List -->
    <div v-else class="requests-section">
      <div class="section-header">
        <h2>Daftar Permohonan Cuti</h2>
        <div class="header-actions">
          <span class="total-count">{{ filteredRequests.length }} permohonan</span>
        </div>
      </div>

      <div v-if="filteredRequests.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Tidak Ada Permohonan</h3>
        <p>Belum ada permohonan cuti yang perlu diproses</p>
      </div>

      <div v-else class="requests-grid">
        <div 
          v-for="request in filteredRequests" 
          :key="request.id" 
          class="request-card"
          :class="`status-${request.overall_status || request.status}`"
        >
          <!-- Request Header -->
          <div class="request-header">
            <div class="employee-info">
              <div class="employee-avatar">
                <img 
                  v-if="request.employee?.user?.profile_picture" 
                  :src="request.employee.user.profile_picture" 
                  :alt="request.employee?.nama_lengkap"
                >
                <div v-else class="avatar-placeholder">
                  {{ getInitials(request.employee?.nama_lengkap) }}
                </div>
              </div>
              <div class="employee-details">
                <h3>{{ request.employee?.nama_lengkap }}</h3>
                <p>{{ request.employee?.user?.role }} - {{ request.employee?.department }}</p>
              </div>
            </div>
            <div class="request-status">
              <span class="status-badge" :class="`status-${request.overall_status || request.status}`">
                {{ getStatusLabel(request.overall_status || request.status) }}
              </span>
            </div>
          </div>

          <!-- Request Details -->
          <div class="request-details">
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <label>Jenis Cuti:</label>
                  <span>{{ getLeaveTypeLabel(request.leave_type) }}</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-clock"></i>
                <div>
                  <label>Durasi:</label>
                  <span>{{ request.total_days }} hari</span>
                </div>
              </div>
            </div>
            
            <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <div>
                  <label>Tanggal:</label>
                  <span>{{ formatDate(request.start_date) }} - {{ formatDate(request.end_date) }}</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-user-clock"></i>
                <div>
                  <label>Diajukan:</label>
                  <span>{{ formatDateTime(request.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Request Reason -->
          <div class="request-reason">
            <label><i class="fas fa-comment"></i> Alasan:</label>
            <p>{{ request.reason }}</p>
          </div>

          <!-- Approval History -->
          <div v-if="request.manager_approved_by || request.hr_approved_by" class="approval-history">
            <h4><i class="fas fa-history"></i> Riwayat Approval</h4>
            
            <div v-if="request.manager_approved_by" class="approval-item">
              <div class="approver-info">
                <i class="fas fa-user-tie"></i>
                <span>{{ request.manager_approved_by?.nama_lengkap || 'Manager' }}</span>
              </div>
              <div class="approval-status">
                <span class="badge" :class="`badge-${request.manager_status}`">
                  {{ request.manager_status === 'approved' ? 'Disetujui' : 'Ditolak' }}
                </span>
                <small>{{ formatDateTime(request.manager_approved_at) }}</small>
              </div>
            </div>
            
            <div v-if="request.hr_approved_by" class="approval-item">
              <div class="approver-info">
                <i class="fas fa-user-shield"></i>
                <span>{{ request.hr_approved_by?.nama_lengkap || 'HR' }}</span>
              </div>
              <div class="approval-status">
                <span class="badge" :class="`badge-${request.hr_status}`">
                  {{ request.hr_status === 'approved' ? 'Disetujui' : 'Ditolak' }}
                </span>
                <small>{{ formatDateTime(request.hr_approved_at) }}</small>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="canProcessRequest(request)" class="request-actions">
            <button 
              @click="approveRequest(request)" 
              class="btn btn-success"
              :disabled="processing"
            >
              <i class="fas fa-check"></i>
              Setujui
            </button>
            <button 
              @click="rejectRequest(request)" 
              class="btn btn-danger"
              :disabled="processing"
            >
              <i class="fas fa-times"></i>
              Tolak
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalAction === 'approve' ? 'Setujui' : 'Tolak' }} Permohonan Cuti</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="employee-summary">
            <h4>{{ selectedRequest?.employee?.nama_lengkap }}</h4>
            <p>{{ getLeaveTypeLabel(selectedRequest?.leave_type) }} - {{ selectedRequest?.total_days }} hari</p>
            <p>{{ formatDate(selectedRequest?.start_date) }} - {{ formatDate(selectedRequest?.end_date) }}</p>
          </div>
          
          <div class="form-group">
            <label>{{ modalAction === 'approve' ? 'Catatan Persetujuan:' : 'Alasan Penolakan:' }}</label>
            <textarea 
              v-model="approvalNotes" 
              class="form-textarea"
              rows="4"
              :placeholder="modalAction === 'approve' ? 'Tambahkan catatan (opsional)' : 'Jelaskan alasan penolakan'"
              :required="modalAction === 'reject'"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">Batal</button>
          <button 
            @click="confirmAction" 
            class="btn"
            :class="modalAction === 'approve' ? 'btn-success' : 'btn-danger'"
            :disabled="processing || (modalAction === 'reject' && !approvalNotes.trim())"
          >
            <i v-if="processing" class="fas fa-spinner fa-spin"></i>
            {{ processing ? 'Memproses...' : (modalAction === 'approve' ? 'Setujui' : 'Tolak') }}
          </button>
        </div>
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
  name: 'PenerimaanPermohonanCuti',
  data() {
    return {
      apiUrl: 'http://localhost:8000',
      loading: false,
      processing: false,
      requests: [],
      selectedStatus: '',
      selectedLeaveType: '',
      showApprovalModal: false,
      selectedRequest: null,
      modalAction: '',
      approvalNotes: '',
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      userRole: '',
      statistics: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      }
    }
  },
  computed: {
    filteredRequests() {
      let filtered = this.requests
      
      if (this.selectedStatus) {
        filtered = filtered.filter(req => (req.overall_status || req.status) === this.selectedStatus)
      }
      
      if (this.selectedLeaveType) {
        filtered = filtered.filter(req => req.leave_type === this.selectedLeaveType)
      }
      
      return filtered
    }
  },
  async mounted() {
    await this.getUserInfo()
    await this.loadRequests()
  },
  methods: {
    async getUserInfo() {
      try {
        const token = this.getToken()
        if (!token) {
          this.$router.push('/login')
          return
        }

        const response = await axios.get(`${this.apiUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        
        if (response.data && response.data.data) {
          this.userRole = response.data.data.role
          console.log('User role:', this.userRole)
        }
      } catch (error) {
        console.error('Error getting user info:', error)
        if (error.response?.status === 401) {
          this.$router.push('/login')
        }
      }
    },

    async loadRequests() {
      this.loading = true
      try {
        const token = this.getToken()
        if (!token) {
          this.showNotificationMessage('Token tidak ditemukan, silakan login ulang', 'error')
          this.$router.push('/login')
          return
        }

        // Build query parameters
        const params = new URLSearchParams()
        if (this.selectedStatus) {
          params.append('status', this.selectedStatus)
        }
        if (this.selectedLeaveType) {
          params.append('leave_type', this.selectedLeaveType)
        }
        
        // Add parameter untuk approval (jika user adalah manager/HR)
        if (['HR', 'Program Manager', 'Distribution Manager'].includes(this.userRole)) {
          params.append('for_approval', 'true')
        }

        console.log('Loading requests with params:', params.toString())
        console.log('Using token:', token ? 'Present' : 'Missing')

        const response = await axios.get(
          `${this.apiUrl}/api/leave-requests?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
        
        console.log('Requests response:', response.data)
        
        if (response.data.success) {
          this.requests = response.data.data || []
          this.calculateStatistics()
        } else {
          this.showNotificationMessage('Gagal memuat data permohonan cuti', 'error')
        }
      } catch (error) {
        console.error('Error loading requests:', error)
        console.error('Error response:', error.response?.data)
        
        if (error.response?.status === 401) {
          this.showNotificationMessage('Sesi Anda telah berakhir, silakan login ulang', 'error')
          this.$router.push('/login')
        } else {
          this.showNotificationMessage('Gagal memuat data permohonan cuti', 'error')
        }
      } finally {
        this.loading = false
      }
    },

    async refreshData() {
      await this.loadRequests()
      this.showNotificationMessage('Data berhasil diperbarui', 'success')
    },

    calculateStatistics() {
      this.statistics = {
        pending: this.requests.filter(r => ['pending_manager', 'pending_hr'].includes(r.overall_status || r.status)).length,
        approved: this.requests.filter(r => (r.overall_status || r.status) === 'approved').length,
        rejected: this.requests.filter(r => (r.overall_status || r.status) === 'rejected').length,
        total: this.requests.length
      }
    },

    canProcessRequest(request) {
      const status = request.overall_status || request.status
      
      // HR bisa approve yang pending_hr
      if (this.userRole === 'HR') {
        return status === 'pending_hr'
      }
      
      // Manager bisa approve yang pending_manager
      if (['Program Manager', 'Distribution Manager'].includes(this.userRole)) {
        return status === 'pending_manager'
      }
      
      return false
    },

    approveRequest(request) {
      this.selectedRequest = request
      this.modalAction = 'approve'
      this.approvalNotes = ''
      this.showApprovalModal = true
    },

    rejectRequest(request) {
      this.selectedRequest = request
      this.modalAction = 'reject'
      this.approvalNotes = ''
      this.showApprovalModal = true
    },

    async confirmAction() {
      if (this.modalAction === 'reject' && !this.approvalNotes.trim()) {
        this.showNotificationMessage('Alasan penolakan harus diisi', 'error')
        return
      }

      this.processing = true
      try {
        const token = this.getToken()
        const requestId = this.selectedRequest.id
        
        let endpoint = ''
        let payload = {}
        
        if (this.userRole === 'HR') {
          endpoint = this.modalAction === 'approve' ? 'hr-approve' : 'hr-reject'
          payload = this.modalAction === 'approve' 
            ? { hr_notes: this.approvalNotes }
            : { rejection_reason: this.approvalNotes }
        } else {
          endpoint = this.modalAction === 'approve' ? 'manager-approve' : 'manager-reject'
          payload = this.modalAction === 'approve'
            ? { manager_notes: this.approvalNotes }
            : { rejection_reason: this.approvalNotes }
        }

        const response = await axios.post(
          `${this.apiUrl}/api/leave-requests/${requestId}/${endpoint}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (response.data.success) {
          this.showNotificationMessage(
            `Permohonan cuti berhasil ${this.modalAction === 'approve' ? 'disetujui' : 'ditolak'}`, 
            'success'
          )
          this.closeModal()
          await this.loadRequests()
        } else {
          this.showNotificationMessage(response.data.message || 'Gagal memproses permohonan', 'error')
        }
      } catch (error) {
        console.error('Error processing request:', error)
        this.showNotificationMessage('Gagal memproses permohonan cuti', 'error')
      } finally {
        this.processing = false
      }
    },

    closeModal() {
      this.showApprovalModal = false
      this.selectedRequest = null
      this.modalAction = ''
      this.approvalNotes = ''
    },

    getToken() {
      return localStorage.getItem('token')
    },

    getInitials(name) {
      if (!name) return '??'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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

    getLeaveTypeLabel(type) {
      const types = {
        'annual': 'Cuti Tahunan',
        'sick': 'Cuti Sakit',
        'emergency': 'Cuti Darurat',
        'maternity': 'Cuti Melahirkan',
        'paternity': 'Cuti Ayah'
      }
      return types[type] || type
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
.penerimaan-permohonan-cuti {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
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

.filter-section {
  margin-bottom: 32px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 24px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 180px;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
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

.stat-card.pending .stat-icon { background: #f59e0b; }
.stat-card.approved .stat-icon { background: #10b981; }
.stat-card.rejected .stat-icon { background: #ef4444; }
.stat-card.total .stat-icon { background: #6366f1; }

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-content p {
  color: #6b7280;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 16px;
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

.total-count {
  color: #6b7280;
  font-weight: 500;
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

.requests-grid {
  padding: 24px;
  display: grid;
  gap: 20px;
}

.request-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.request-card.status-pending_manager,
.request-card.status-pending {
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
  margin-bottom: 20px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.employee-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.employee-details h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.employee-details p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-pending_manager,
.status-badge.status-pending {
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
  margin-bottom: 20px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.detail-item i {
  color: #6b7280;
  width: 16px;
}

.detail-item label {
  font-weight: 600;
  color: #374151;
  margin-right: 4px;
}

.detail-item span {
  color: #6b7280;
}

.request-reason {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.request-reason label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.request-reason p {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.approval-history {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.approval-history h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 12px 0;
}

.approval-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #bae6fd;
}

.approval-item:last-child {
  border-bottom: none;
}

.approver-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #0c4a6e;
  font-weight: 500;
}

.approval-status {
  text-align: right;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.badge-approved {
  background: #34d399;
  color: #065f46;
}

.badge-rejected {
  background: #f87171;
  color: #991b1b;
}

.approval-status small {
  color: #6b7280;
  font-size: 0.75rem;
}

.request-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
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
  background: #6366f1;
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-overlay {
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 0 24px;
}

.employee-summary {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.employee-summary h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.employee-summary p {
  color: #6b7280;
  margin: 4px 0;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-footer {
  padding: 20px 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
  .penerimaan-permohonan-cuti {
    padding: 16px;
  }
  
  .filter-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
  }
  
  .request-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .request-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>
