<template>
  <div class="permohonan-container">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="page-title">
          <h1>Penerimaan Permohonan Cuti</h1>
          <p>Kelola permohonan cuti yang telah disetujui manager</p>
        </div>
        <div class="header-actions">
          <span class="pending-count">{{ pendingFromManagerCount }} permohonan dari manager</span>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-group">
        <select v-model="filters.status" @change="loadRequests" class="filter-select">
          <option value="">Semua Status</option>
          <option value="approved_by_manager">Disetujui Manager</option>
          <option value="approved">Disetujui HRD</option>
          <option value="rejected">Ditolak HRD</option>
        </select>
        <select v-model="filters.leave_type" @change="loadRequests" class="filter-select">
          <option value="">Semua Jenis</option>
          <option value="annual">Cuti Tahunan</option>
          <option value="sick">Cuti Sakit</option>
          <option value="emergency">Cuti Darurat</option>
          <option value="maternity">Cuti Melahirkan</option>
          <option value="paternity">Cuti Ayah</option>
        </select>
        <select v-model="filters.employee_id" @change="loadRequests" class="filter-select">
          <option value="">Semua Karyawan</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.nama_lengkap }}</option>
        </select>
        <button @click="loadRequests" class="btn-secondary">
          <i class="fas fa-sync"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="table-section">
      <div class="table-container" v-if="requests.length">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Jenis Cuti</th>
              <th>Tanggal</th>
              <th>Durasi</th>
              <th>Alasan</th>
              <th>Disetujui Manager</th>
              <th>Status HRD</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in requests" :key="request.id" class="table-row">
              <td>
                <div class="employee-info">
                  <strong>{{ request.employee?.nama_lengkap || 'N/A' }}</strong>
                  <small>{{ request.employee?.jabatan_saat_ini || '' }}</small>
                </div>
              </td>
              <td>
                <span class="leave-type-badge" :class="request.leave_type">
                  {{ getLeaveTypeText(request.leave_type) }}
                </span>
              </td>
              <td>
                <div class="date-range">
                  <strong>{{ formatDate(request.start_date) }}</strong>
                  <span v-if="request.start_date !== request.end_date">
                    s/d {{ formatDate(request.end_date) }}
                  </span>
                </div>
              </td>
              <td>
                <span class="duration">{{ request.total_days }} hari</span>
              </td>
              <td>
                <div class="reason-text">{{ request.reason }}</div>
              </td>
              <td>
                <div class="approval-info">
                  <span class="approved-by">{{ request.approved_by_manager?.nama_lengkap || 'N/A' }}</span>
                  <small>{{ formatDate(request.manager_approved_at) }}</small>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getHRDStatusClass(request.status)">
                  {{ getHRDStatusText(request.status) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    v-if="request.status === 'approved_by_manager'" 
                    @click="approveRequest(request)" 
                    class="btn-icon approve" 
                    title="Setujui"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-if="request.status === 'approved_by_manager'" 
                    @click="rejectRequest(request)" 
                    class="btn-icon reject" 
                    title="Tolak"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                  <button @click="viewRequest(request)" class="btn-icon view" title="Detail">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>Belum ada permohonan cuti dari manager</h3>
        <p>Permohonan cuti yang disetujui manager akan muncul di sini</p>
      </div>
    </div>

    <!-- Approve/Reject Modal -->
    <div v-if="showApprovalModal" class="modal-overlay" @click="closeApprovalModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ approvalAction === 'approve' ? 'Setujui' : 'Tolak' }} Permohonan Cuti</h3>
          <button @click="closeApprovalModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="request-details">
            <h4>Detail Permohonan:</h4>
            <p><strong>Karyawan:</strong> {{ selectedRequest?.employee?.nama_lengkap }}</p>
            <p><strong>Jenis:</strong> {{ getLeaveTypeText(selectedRequest?.leave_type) }}</p>
            <p><strong>Periode:</strong> {{ formatDate(selectedRequest?.start_date) }} - {{ formatDate(selectedRequest?.end_date) }}</p>
            <p><strong>Durasi:</strong> {{ selectedRequest?.total_days }} hari</p>
            <p><strong>Alasan:</strong> {{ selectedRequest?.reason }}</p>
            <p><strong>Disetujui Manager:</strong> {{ selectedRequest?.approved_by_manager?.nama_lengkap }}</p>
            <p><strong>Tanggal Persetujuan Manager:</strong> {{ formatDate(selectedRequest?.manager_approved_at) }}</p>
          </div>
          
          <div class="form-group" v-if="approvalAction === 'reject'">
            <label>Alasan Penolakan *</label>
            <textarea v-model="approvalForm.rejection_reason" class="form-input" rows="3" required placeholder="Jelaskan alasan penolakan..."></textarea>
          </div>
          <div class="form-group" v-else>
            <label>Catatan HRD</label>
            <textarea v-model="approvalForm.hrd_notes" class="form-input" rows="2" placeholder="Catatan tambahan dari HRD (opsional)..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeApprovalModal" class="btn-secondary">Batal</button>
          <button @click="submitApproval" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Memproses...' : (approvalAction === 'approve' ? 'Setujui' : 'Tolak') }}
          </button>
        </div>
      </div>
    </div>

    <!-- View Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detail Permohonan Cuti</h3>
          <button @click="closeDetailModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Informasi Karyawan</h4>
            <p><strong>Nama:</strong> {{ selectedRequest?.employee?.nama_lengkap }}</p>
            <p><strong>Jabatan:</strong> {{ selectedRequest?.employee?.jabatan_saat_ini }}</p>
            <p><strong>Department:</strong> {{ selectedRequest?.employee?.department || 'N/A' }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Detail Cuti</h4>
            <p><strong>Jenis Cuti:</strong> {{ getLeaveTypeText(selectedRequest?.leave_type) }}</p>
            <p><strong>Tanggal Mulai:</strong> {{ formatDate(selectedRequest?.start_date) }}</p>
            <p><strong>Tanggal Selesai:</strong> {{ formatDate(selectedRequest?.end_date) }}</p>
            <p><strong>Total Hari:</strong> {{ selectedRequest?.total_days }} hari</p>
            <p><strong>Alasan:</strong> {{ selectedRequest?.reason }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Status Persetujuan</h4>
            <p><strong>Disetujui Manager:</strong> {{ selectedRequest?.approved_by_manager?.nama_lengkap || 'Belum disetujui' }}</p>
            <p><strong>Tanggal Persetujuan Manager:</strong> {{ formatDate(selectedRequest?.manager_approved_at) || 'N/A' }}</p>
            <p><strong>Status HRD:</strong> {{ getHRDStatusText(selectedRequest?.status) }}</p>
            <p v-if="selectedRequest?.hrd_approved_at"><strong>Tanggal Persetujuan HRD:</strong> {{ formatDate(selectedRequest?.hrd_approved_at) }}</p>
            <p v-if="selectedRequest?.rejection_reason"><strong>Alasan Penolakan:</strong> {{ selectedRequest?.rejection_reason }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn-secondary">Tutup</button>
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
      requests: [],
      employees: [],
      showApprovalModal: false,
      showDetailModal: false,
      selectedRequest: null,
      approvalAction: '',
      isSubmitting: false,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      filters: {
        status: 'approved_by_manager', // Default filter untuk yang disetujui manager
        leave_type: '',
        employee_id: ''
      },
      approvalForm: {
        hrd_notes: '',
        rejection_reason: ''
      },
      apiUrl: 'http://localhost:8000'
    }
  },
  computed: {
    pendingFromManagerCount() {
      return this.requests.filter(req => req.status === 'approved_by_manager').length
    }
  },
  mounted() {
    this.loadEmployees()
    this.loadRequests()
  },
  methods: {
    async loadEmployees() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/employees`)
        this.employees = response.data || []
      } catch (error) {
        console.error('Error loading employees:', error)
        this.showNotificationMessage('Gagal memuat data karyawan', 'error')
      }
    },
    async loadRequests() {
      try {
        const params = new URLSearchParams()
        if (this.filters.status) params.append('status', this.filters.status)
        if (this.filters.leave_type) params.append('leave_type', this.filters.leave_type)
        if (this.filters.employee_id) params.append('employee_id', this.filters.employee_id)
        
        const response = await axios.get(`${this.apiUrl}/api/leave-requests?${params}`)
        this.requests = response.data.data || []
      } catch (error) {
        console.error('Error loading requests:', error)
        this.showNotificationMessage('Gagal memuat data permohonan cuti', 'error')
      }
    },
    async submitApproval() {
      this.isSubmitting = true
      try {
        const endpoint = this.approvalAction === 'approve' ? 'hrd-approve' : 'hrd-reject'
        await axios.post(`${this.apiUrl}/api/leave-requests/${this.selectedRequest.id}/${endpoint}`, this.approvalForm)
        
        const message = this.approvalAction === 'approve' ? 'Permohonan cuti disetujui HRD' : 'Permohonan cuti ditolak HRD'
        this.showNotificationMessage(message, 'success')
        this.closeApprovalModal()
        this.loadRequests()
      } catch (error) {
        console.error('Error processing approval:', error)
        this.showNotificationMessage(error.response?.data?.message || 'Gagal memproses permohonan', 'error')
      } finally {
        this.isSubmitting = false
      }
    },
    approveRequest(request) {
      this.selectedRequest = request
      this.approvalAction = 'approve'
      this.approvalForm = { hrd_notes: '', rejection_reason: '' }
      this.showApprovalModal = true
    },
    rejectRequest(request) {
      this.selectedRequest = request
      this.approvalAction = 'reject'
      this.approvalForm = { hrd_notes: '', rejection_reason: '' }
      this.showApprovalModal = true
    },
    viewRequest(request) {
      this.selectedRequest = request
      this.showDetailModal = true
    },
    closeApprovalModal() {
      this.showApprovalModal = false
      this.selectedRequest = null
      this.approvalAction = ''
      this.approvalForm = { hrd_notes: '', rejection_reason: '' }
    },
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedRequest = null
    },
    getLeaveTypeText(type) {
      const types = {
        annual: 'Cuti Tahunan',
        sick: 'Cuti Sakit',
        emergency: 'Cuti Darurat',
        maternity: 'Cuti Melahirkan',
        paternity: 'Cuti Ayah'
      }
      return types[type] || type
    },
    getHRDStatusText(status) {
      const statuses = {
        approved_by_manager: 'Menunggu HRD',
        approved: 'Disetujui HRD',
        rejected: 'Ditolak HRD'
      }
      return statuses[status] || status
    },
    getHRDStatusClass(status) {
      const classes = {
        approved_by_manager: 'pending',
        approved: 'approved',
        rejected: 'rejected'
      }
      return classes[status] || 'pending'
    },
    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('id-ID')
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
/* Tambahkan di awal style section */
.permohonan-container {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-title p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pending-count {
  background: var(--warning-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.filters-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.table-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.modern-table th {
  background: var(--bg-tertiary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.modern-table td {
  background: var(--bg-secondary);
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: top;
  color: var(--text-primary);
}

.table-row:hover {
  background: var(--bg-tertiary) !important;
}

.table-row:hover td {
  background: var(--bg-tertiary) !important;
}

.employee-info strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.employee-info small {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.approval-info {
  display: flex;
  flex-direction: column;
}

.approved-by {
  font-weight: 500;
  color: var(--success-color);
  margin-bottom: 0.25rem;
}

.approval-info small {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.leave-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.leave-type-badge.annual {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.leave-type-badge.sick {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.leave-type-badge.emergency {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.leave-type-badge.maternity {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.leave-type-badge.paternity {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.date-range strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.duration {
  background: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
}

.reason-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.approved {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.btn-icon.approve {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-icon.approve:hover {
  background: var(--success-color);
  color: white;
}

.btn-icon.reject {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-icon.reject:hover {
  background: var(--error-color);
  color: white;
}

.btn-icon.view {
  background: rgba(6, 182, 212, 0.1);
  color: var(--info-color);
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.btn-icon.view:hover {
  background: var(--info-color);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
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
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.request-details, .detail-section {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.request-details h4, .detail-section h4 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.request-details p, .detail-section p {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--primary-color);
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: var(--success-color);
}

.notification.error {
  background: var(--error-color);
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
  .permohonan-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
