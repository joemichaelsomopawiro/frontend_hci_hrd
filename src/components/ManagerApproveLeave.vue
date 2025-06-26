<template> 
  <div class="manager-approve-container"> 
    <div class="page-header"> 
      <div class="header-content"> 
        <div class="page-title"> 
          <h1>Riwayat Permohonan Cuti</h1> 
          <p>Lihat riwayat permohonan cuti dari employee yang berada langsung di bawah Anda</p> 
          <div v-if="userRole" class="manager-role-info"> 
            <i class="fas fa-user-shield"></i> 
            <span>Anda login sebagai: <strong>{{ userRole }}</strong></span> 
            <div class="approval-level-badge"> 
              <i class="fas fa-layer-group"></i> 
              {{ approvalLevelText }} 
            </div> 
          </div> 
          
          <div v-if="currentManagerConfig" class="workflow-info"> 
            <div class="workflow-card"> 
              <h4><i class="fas fa-users"></i> Tim yang Dikelola:</h4> 
              <div class="subordinates-list"> 
                <span v-for="role in managedSubordinates" :key="role" class="subordinate-tag"> 
                  {{ role }} 
                </span> 
              </div> 
            </div> 
            
            <div v-if="nextApproverRole" class="workflow-card"> 
              <h4><i class="fas fa-arrow-right"></i> Approval Selanjutnya:</h4> 
              <span class="next-approver">{{ nextApproverRole }}</span> 
            </div> 
            
            <div v-if="canViewAllApprovedRequests" class="workflow-card privilege"> 
              <h4><i class="fas fa-eye"></i> Privilege Khusus:</h4> 
              <span class="privilege-text">Dapat melihat semua data cuti yang sudah diapprove</span> 
            </div> 
          </div> 
        </div> 
        <div class="header-actions"> 
          <div class="stats-container"> 
            <div class="stat-item pending"> 
              <span class="stat-number">{{ pendingRequestsCount }}</span> 
              <span class="stat-label">Menunggu Approval</span> 
            </div> 
            <div class="stat-item approved"> 
              <span class="stat-number">{{ approvedRequestsCount }}</span> 
              <span class="stat-label">Disetujui</span> 
            </div> 
            <div class="stat-item rejected"> 
              <span class="stat-number">{{ rejectedRequestsCount }}</span> 
              <span class="stat-label">Ditolak</span> 
            </div> 
            <div class="stat-item total"> 
              <span class="stat-number">{{ totalRequestsCount }}</span> 
              <span class="stat-label">Total Permohonan</span> 
            </div> 
          </div> 
        </div> 
      </div> 
    </div> 

    <div class="filters-section"> 
      <div class="filter-group"> 
        <select v-model="filters.status" @change="loadRequests" class="filter-select"> 
          <option value="">Semua Status</option> 
          <option value="pending">Menunggu Persetujuan</option> 
          <option value="approved">Disetujui</option> 
          <option value="rejected">Ditolak</option> 
        </select> 
        <select v-model="filters.leave_type" @change="loadRequests" class="filter-select"> 
          <option value="">Semua Jenis</option> 
          <option value="annual">Cuti Tahunan</option> 
          <option value="sick">Cuti Sakit</option> 
          <option value="emergency">Cuti Darurat</option> 
          <option value="maternity">Cuti Melahirkan</option> 
          <option value="paternity">Cuti Ayah</option> 
          <option value="marriage">Cuti Menikah</option> 
          <option value="bereavement">Cuti Duka</option> 
        </select> 
        <button @click="loadRequests" class="btn-secondary"> 
          <i class="fas fa-sync"></i> 
          Refresh 
        </button> 
      </div> 
    </div> 

    <div v-if="isLoading" class="loading-state"> 
      <i class="fas fa-spinner fa-spin"></i> 
      <h3>Memuat data permohonan cuti...</h3> 
      <p>Mohon tunggu sebentar</p> 
    </div> 

    <div v-else class="table-section"> 
      <div class="table-container" v-if="requests.length"> 
        <table class="modern-table"> 
          <thead> 
            <tr> 
              <th>No</th> 
              <th>Karyawan</th> 
              <th>Jenis Cuti</th> 
              <th>Tanggal</th> 
              <th>Durasi</th> 
              <th>Alasan</th> 
              <th>Status</th> 
              <th>Aksi</th> 
            </tr> 
          </thead> 
          <tbody> 
            <tr v-for="(request, index) in requests" :key="request.id" class="table-row"> 
              <td> 
                <span class="row-number">{{ index + 1 }}</span> 
              </td> 
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
                <span class="status-badge" :class="getStatusClass(request.overall_status)"> 
                  {{ getStatusText(request.overall_status) }} 
                </span> 
              </td> 
              <td> 
                <div class="action-buttons"> 
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
        <div class="empty-icon"> 
          <i class="fas fa-inbox"></i> 
        </div> 
        <h3>{{ getEmptyStateTitle() }}</h3> 
        <p>{{ getEmptyStateMessage() }}</p> 
        <div class="empty-actions"> 
          <button @click="clearFiltersAndReload" class="btn-secondary"> 
            <i class="fas fa-filter"></i> 
            Tampilkan Semua Data 
          </button> 
          <button @click="loadRequests" class="btn-primary"> 
            <i class="fas fa-sync"></i> 
            Refresh Data 
          </button> 
        </div> 
      </div> 
    </div> 



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
            <p><strong>Status:</strong> {{ getStatusText(selectedRequest?.overall_status) }}</p> 
            <p v-if="selectedRequest?.approved_at"><strong>Tanggal Persetujuan:</strong> {{ formatDate(selectedRequest?.approved_at) }}</p> 
            <p v-if="selectedRequest?.rejection_reason"><strong>Alasan Penolakan:</strong> {{ selectedRequest?.rejection_reason }}</p> 
          </div> 
        </div> 
        <div class="modal-footer"> 
          <button @click="closeDetailModal" class="btn-secondary">Tutup</button> 
        </div> 
      </div> 
    </div> 

    <div v-if="showNotification" class="notification" :class="notificationType"> 
      <i :class="notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i> 
      {{ notificationMessage }} 
    </div> 
  </div> 
</template> 

<script> 
import axios from 'axios' 

export default { 
  name: 'ManagerApproveLeave', 
  data() { 
    return { 
      requests: [], 
      isLoading: false, 
      showDetailModal: false, 
      selectedRequest: null, 
      showNotification: false, 
      notificationMessage: '', 
      notificationType: 'success', 
      filters: { 
        status: '', // Changed from 'pending' to '' to show all by default 
        leave_type: '' 
      }, 
      approvalForm: { 
        manager_notes: '', 
        rejection_reason: '' 
      }, 
      apiUrl: 'http://127.0.0.1:8000', 
      userRole: '', 
      userName: '', 
      // Workflow configuration 
      workflowConfig: { 
        'Distribution Manager': { 
          subordinates: ['Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care'], 
          nextApprover: null // Tidak ada next approver, langsung final 
        }, 
        'Program Manager': { 
          subordinates: ['Producer', 'Creative', 'Production', 'Editor'], 
          nextApprover: null // Tidak ada next approver, langsung final 
        }, 
        'HR Manager': { 
          subordinates: ['Finance', 'General Affairs', 'Office Assistant', 'HR'], 
          nextApprover: null, // Final approver 
          canViewAll: true // Can view all approved requests 
        }, 
        'HR': { 
          subordinates: ['Finance', 'General Affairs', 'Office Assistant', 'HR'], 
          nextApprover: null, // Final approver 
          canViewAll: true // Can view all approved requests 
        } 
      } 
    } 
  }, 
  computed: { 
    pendingRequestsCount() { 
      return this.requests.filter(req => req.overall_status === 'pending').length 
    }, 
    
    approvedRequestsCount() { 
      return this.requests.filter(req => req.overall_status === 'approved').length 
    }, 
    
    rejectedRequestsCount() { 
      return this.requests.filter(req => req.overall_status === 'rejected').length 
    }, 
    
    totalRequestsCount() { 
      return this.requests.length 
    }, 
    
    currentManagerConfig() { 
      return this.workflowConfig[this.userRole] || null 
    }, 
    
    isDistributionManager() { 
      return this.userRole === 'Distribution Manager' 
    }, 
    
    isProgramManager() { 
      return this.userRole === 'Program Manager' 
    }, 
    
    isHRManager() { 
      return this.userRole === 'HR Manager' || this.userRole === 'HR' 
    }, 
    
    canViewAllApprovedRequests() { 
      return this.currentManagerConfig?.canViewAll || false 
    }, 
    
    managedSubordinates() { 
      return this.currentManagerConfig?.subordinates || [] 
    }, 
    
    nextApproverRole() { 
      return this.currentManagerConfig?.nextApprover 
    }, 
    
    approvalLevelText() { 
      if (this.isHRManager) { 
        return 'Approval (HR Manager)' 
      } else if (this.isDistributionManager) { 
        return 'Approval (Distribution Manager)' 
      } else if (this.isProgramManager) { 
        return 'Approval (Program Manager)' 
      } 
      return 'Manager Approval' 
    } 
  }, 
  mounted() { 
    this.getUserInfo() 
    this.loadRequests() 
  }, 
  methods: { 
    getUserInfo() { 
      try { 
        const userStr = localStorage.getItem('user') 
        if (userStr) { 
          const user = JSON.parse(userStr) 
          this.userRole = user.role || user.position || '' 
          this.userName = user.nama_lengkap || user.name || '' 
        } 
      } catch (error) { 
        console.error('Error getting user info:', error) 
      } 
    }, 
    async loadRequests() { 
      this.isLoading = true; 
      try { 
        const params = new URLSearchParams(); 
        if (this.filters.status) params.append('status', this.filters.status); 
        if (this.filters.leave_type) params.append('leave_type', this.filters.leave_type); 
        
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`${this.apiUrl}/api/leave-requests?${params.toString()}`, { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }); 
        this.requests = response.data.data || []; 
        
        console.log('Loaded requests:', this.requests.length); 
        console.log('Requests data:', this.requests); 
        
      } catch (error) { 
        console.error('Error loading requests:', error); 
        this.showNotificationMessage('Gagal memuat data permohonan cuti. Silakan coba lagi.', 'error'); 
        this.requests = []; // Ensure requests is empty on error 
      } finally { 
        this.isLoading = false; 
      } 
    }, 
    
    getEmptyStateTitle() { 
      if (this.filters.status === 'pending') { 
        return 'Tidak Ada Permohonan Menunggu Approval' 
      } else if (this.filters.status === 'approved') { 
        return 'Tidak Ada Permohonan yang Disetujui' 
      } else if (this.filters.status === 'rejected') { 
        return 'Tidak Ada Permohonan yang Ditolak' 
      } else if (this.filters.leave_type) { 
        return `Tidak Ada Permohonan ${this.getLeaveTypeText(this.filters.leave_type)}` 
      } 
      return 'Tidak Ada Data Permohonan Cuti' 
    }, 
    
    getEmptyStateMessage() { 
      if (this.filters.status || this.filters.leave_type) { 
        return 'Tidak ada data yang sesuai dengan filter yang dipilih. Coba ubah filter atau tampilkan semua data.' 
      } 
      return 'Belum ada permohonan cuti dari tim yang Anda kelola. Data akan muncul di sini ketika ada permohonan baru.' 
    }, 
    
    clearFiltersAndReload() { 
      this.filters.status = '' 
      this.filters.leave_type = '' 
      this.loadRequests() 
    }, 

    viewRequest(request) { 
      this.selectedRequest = request 
      this.showDetailModal = true 
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
        paternity: 'Cuti Ayah', 
        marriage: 'Cuti Menikah', 
        bereavement: 'Cuti Duka' 
      } 
      return types[type] || type 
    }, 
    getStatusText(status) { 
      const statuses = { 
        pending: 'Menunggu Persetujuan', 
        approved: 'Disetujui', 
        rejected: 'Ditolak' 
      } 
      return statuses[status] || status 
    }, 
    getStatusClass(status) { 
      const classes = { 
        pending: 'pending', 
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
/* Manager Approve Leave Specific Styles */ 
.manager-approve-container { 
  background: var(--bg-primary); 
  color: var(--text-primary); 
  padding: 2rem; 
  max-width: 1400px; 
  margin: 0 auto; 
} 

.page-header { 
  background: var(--bg-primary); 
  border-radius: 12px; 
  padding: 2rem; 
  margin-bottom: 2rem; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
} 

.manager-role-info { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin-top: 12px; 
  padding: 8px 12px; 
  background: #e3f2fd; 
  border-radius: 6px; 
  border-left: 3px solid #2196f3; 
  font-size: 14px; 
  color: #1565c0; 
} 

.manager-role-info i { 
  color: #2196f3; 
} 

.manager-role-info strong { 
  color: #0d47a1; 
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

/* Enhanced Stats Container */ 
.stats-container { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
  gap: 1rem; 
  margin-top: 1rem; 
} 

.stat-item { 
  background: white; 
  padding: 1rem; 
  border-radius: 8px; 
  text-align: center; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  border-left: 4px solid; 
} 

.stat-item.pending { 
  border-left-color: var(--warning-color); 
} 

.stat-item.approved { 
  border-left-color: var(--success-color); 
} 

.stat-item.rejected { 
  border-left-color: var(--danger-color); 
} 

.stat-item.total { 
  border-left-color: var(--info-color); 
} 

.stat-number { 
  display: block; 
  font-size: 1.5rem; 
  font-weight: 700; 
  color: var(--text-primary); 
} 

.stat-label { 
  display: block; 
  font-size: 0.8rem; 
  color: var(--text-secondary); 
  margin-top: 0.25rem; 
} 

.filters-section { 
  background: var(--bg-secondary); 
  border-radius: 12px; 
  padding: 1.5rem; 
  margin-bottom: 2rem; 
} 

.filter-group { 
  display: flex; 
  gap: 1rem; 
  align-items: center; 
  flex-wrap: wrap; 
} 

.filter-select { 
  padding: 0.75rem; 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  background: var(--bg-primary); 
  color: var(--text-primary); 
  min-width: 200px; 
} 

.btn-secondary { 
  background: var(--secondary-color); 
  color: white; 
  border: none; 
  padding: 0.75rem 1.5rem; 
  border-radius: 8px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
  transition: background-color 0.2s; 
} 

.btn-secondary:hover { 
  background: var(--secondary-hover); 
} 

.table-section { 
  background: var(--bg-secondary); 
  border-radius: 12px; 
  padding: 1.5rem; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
} 

.modern-table { 
  width: 100%; 
  border-collapse: collapse; 
  margin-top: 1rem; 
} 

.modern-table th, 
.modern-table td { 
  padding: 1rem; 
  text-align: left; 
  border-bottom: 1px solid var(--border-color); 
} 

.modern-table th { 
  background: var(--gray-50); 
  font-weight: 600; 
  color: var(--text-primary); 
} 

.employee-info strong { 
  display: block; 
  color: var(--text-primary); 
} 

.employee-info small { 
  color: var(--text-secondary); 
  font-size: 0.85rem; 
} 

.leave-type-badge { 
  padding: 0.25rem 0.75rem; 
  border-radius: 12px; 
  font-size: 0.8rem; 
  font-weight: 600; 
} 

.leave-type-badge.annual { 
  background: var(--info-light); 
  color: var(--info-color); 
} 

.leave-type-badge.sick { 
  background: var(--warning-light); 
  color: var(--warning-color); 
} 

.leave-type-badge.emergency { 
  background: var(--danger-light); 
  color: var(--danger-color); 
} 

.status-badge { 
  padding: 0.25rem 0.75rem; 
  border-radius: 12px; 
  font-size: 0.8rem; 
  font-weight: 600; 
} 

.status-badge.pending { 
  background: var(--warning-light); 
  color: var(--warning-color); 
} 

.status-badge.approved { 
  background: var(--success-light); 
  color: var(--success-color); 
} 

.status-badge.rejected { 
  background: var(--danger-light); 
  color: var(--danger-color); 
} 

.action-buttons { 
  display: flex; 
  gap: 0.5rem; 
} 

.btn-icon { 
  width: 36px; 
  height: 36px; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.2s; 
} 

.btn-icon.approve { 
  background: var(--success-light); 
  color: var(--success-color); 
} 

.btn-icon.approve:hover { 
  background: var(--success-color); 
  color: white; 
} 

.btn-icon.reject { 
  background: var(--danger-light); 
  color: var(--danger-color); 
} 

.btn-icon.reject:hover { 
  background: var(--danger-color); 
  color: white; 
} 

.btn-icon.view { 
  background: var(--info-light); 
  color: var(--info-color); 
} 

.btn-icon.view:hover { 
  background: var(--info-color); 
  color: white; 
} 

/* Loading State */ 
.loading-state { 
  text-align: center; 
  padding: 3rem; 
  background: var(--bg-secondary); 
  border-radius: 12px; 
  color: var(--text-secondary); 
} 

.loading-state i { 
  font-size: 2rem; 
  margin-bottom: 1rem; 
  color: var(--primary-color); 
} 

/* Enhanced Empty State */ 
.empty-state { 
  text-align: center; 
  padding: 3rem; 
  background: var(--bg-secondary); 
  border-radius: 12px; 
  color: var(--text-secondary); 
} 

.empty-icon { 
  margin-bottom: 1.5rem; 
} 

.empty-icon i { 
  font-size: 4rem; 
  opacity: 0.3; 
  color: var(--text-secondary); 
} 

.empty-state h3 { 
  color: var(--text-primary); 
  margin-bottom: 0.5rem; 
} 

.empty-actions { 
  display: flex; 
  gap: 1rem; 
  justify-content: center; 
  margin-top: 1.5rem; 
  flex-wrap: wrap; 
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
  max-width: 600px; 
  width: 90%; 
  max-height: 80vh; 
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
  margin: 0; 
  color: var(--text-primary); 
} 

.close-btn { 
  background: none; 
  border: none; 
  font-size: 1.5rem; 
  cursor: pointer; 
  color: var(--text-secondary); 
} 

.modal-body { 
  padding: 1.5rem; 
} 

.request-details { 
  background: var(--gray-50); 
  padding: 1rem; 
  border-radius: 8px; 
  margin-bottom: 1rem; 
} 

.request-details h4 { 
  margin: 0 0 1rem 0; 
  color: var(--text-primary); 
} 

.request-details p { 
  margin: 0.5rem 0; 
  color: var(--text-secondary); 
} 

.form-group { 
  margin-bottom: 1rem; 
} 

.form-group label { 
  display: block; 
  margin-bottom: 0.5rem; 
  font-weight: 600; 
  color: var(--text-primary); 
} 

.form-input { 
  width: 100%; 
  padding: 0.75rem; 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  background: var(--bg-primary); 
  color: var(--text-primary); 
  resize: vertical; 
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
  cursor: pointer; 
  transition: background-color 0.2s; 
} 

.btn-primary:hover { 
  background: var(--primary-hover); 
} 

.btn-primary:disabled { 
  background: var(--gray-400); 
  cursor: not-allowed; 
} 

.detail-section { 
  margin-bottom: 1.5rem; 
} 

.detail-section h4 { 
  margin: 0 0 1rem 0; 
  color: var(--text-primary); 
  border-bottom: 1px solid var(--border-color); 
  padding-bottom: 0.5rem; 
} 

.notification { 
  position: fixed; 
  top: 20px; 
  right: 20px; 
  padding: 1rem 1.5rem; 
  border-radius: 8px; 
  color: white; 
  font-weight: 600; 
  z-index: 1001; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
} 

.notification.success { 
  background: var(--success-color); 
} 

.notification.error { 
  background: var(--danger-color); 
} 

/* CSS Variables */ 
:root { 
  --primary-color: #3b82f6; 
  --primary-hover: #2563eb; 
  --secondary-color: #6b7280; 
  --secondary-hover: #4b5563; 
  --success-color: #10b981; 
  --success-light: #d1fae5; 
  --warning-color: #f59e0b; 
  --warning-light: #fef3c7; 
  --danger-color: #ef4444; 
  --danger-light: #fee2e2; 
  --info-color: #3b82f6; 
  --info-light: #dbeafe; 
  --bg-primary: #ffffff; 
  --bg-secondary: #f9fafb; 
  --text-primary: #111827; 
  --text-secondary: #6b7280; 
  --border-color: #e5e7eb; 
  --gray-50: #f9fafb; 
  --gray-400: #9ca3af; 
} 

/* Workflow Information Styles */ 
.approval-level-badge { 
  display: inline-flex; 
  align-items: center; 
  gap: 0.5rem; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: white; 
  padding: 0.5rem 1rem; 
  border-radius: 20px; 
  font-size: 0.85rem; 
  font-weight: 600; 
  margin-top: 0.5rem; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
} 

.workflow-info { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: 1rem; 
  margin-top: 1.5rem; 
  padding: 1.5rem; 
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
  border-radius: 12px; 
  border: 1px solid #e1e8ed; 
} 

.workflow-card { 
  background: white; 
  padding: 1rem; 
  border-radius: 8px; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
  border-left: 4px solid var(--primary-color); 
} 

.workflow-card.privilege { 
  border-left-color: var(--warning-color); 
  background: linear-gradient(135deg, #fff9e6 0%, #fff 100%); 
} 

.workflow-card h4 { 
  margin: 0 0 0.75rem 0; 
  color: var(--secondary-color); 
  font-size: 0.9rem; 
  display: flex; 
  align-items: center; 
  gap: 0.5rem; 
} 

.subordinates-list { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 0.5rem; 
} 

.subordinate-tag { 
  background: var(--primary-color); 
  color: white; 
  padding: 0.25rem 0.75rem; 
  border-radius: 15px; 
  font-size: 0.8rem; 
  font-weight: 500; 
} 

.next-approver { 
  background: var(--success-color); 
  color: white; 
  padding: 0.5rem 1rem; 
  border-radius: 20px; 
  font-weight: 600; 
  display: inline-block; 
} 

.privilege-text { 
  color: var(--warning-color); 
  font-weight: 600; 
  font-size: 0.9rem; 
} 

/* Modal Workflow Indicator */ 
.workflow-indicator { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 1rem; 
  margin-top: 1rem; 
  padding: 1rem; 
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
  border-radius: 8px; 
  border: 1px solid #dee2e6; 
} 

.workflow-step { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 0.5rem; 
  padding: 0.75rem; 
  border-radius: 8px; 
  background: white; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  min-width: 120px; 
} 

.workflow-step.next { 
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
  border: 2px solid var(--warning-color); 
} 

.workflow-step.final { 
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
  border: 2px solid var(--success-color); 
} 

.workflow-step i { 
  font-size: 1.2rem; 
  color: var(--primary-color); 
} 

.workflow-step.next i { 
  color: var(--warning-color); 
} 

.workflow-step.final i { 
  color: var(--success-color); 
} 

.workflow-step span { 
  font-size: 0.85rem; 
  font-weight: 600; 
  text-align: center; 
  color: var(--text-color); 
} 

.workflow-arrow { 
  color: var(--primary-color); 
  font-size: 1.5rem; 
  animation: pulse 2s infinite; 
} 

@keyframes pulse { 
  0% { opacity: 1; } 
  50% { opacity: 0.5; } 
  100% { opacity: 1; } 
} 

@media (max-width: 768px) { 
  .manager-approve-container { 
    padding: 1rem; 
  } 
  
  .stats-container { 
    grid-template-columns: repeat(2, 1fr); 
  } 
  
  .filter-group { 
    flex-direction: column; 
    align-items: stretch; 
  } 
  
  .filter-select { 
    min-width: auto; 
  } 
  
  .modern-table { 
    font-size: 0.9rem; 
  } 
  
  .modern-table th, 
  .modern-table td { 
    padding: 0.5rem; 
  } 
  
  .action-buttons { 
    flex-direction: column; 
  } 
  
  .empty-actions { 
    flex-direction: column; 
    align-items: center; 
  } 
  
  .empty-actions button { 
    min-width: 200px; 
  } 
} 
</style>