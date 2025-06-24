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
                <span class="status-badge" :class="getStatusClass(request.overall_status)">
                                          {{ getDetailedStatusName(request) }}
                </span>
              </div>
            </div>
            
                      <div class="approval-history-container">
              <h4>Riwayat Proses</h4>
              <div class="approval-history">
                <div class="history-item submitted">
                  <i class="fas fa-paper-plane"></i>
                  <div class="history-details">
                    <span class="history-title">Permohonan Diajukan</span>
                    <span class="history-date">{{ formatDateTime(request.created_at) }}</span>
                  </div>
                </div>
  
                <div v-if="request.approvedBy" class="history-item" :class="getStatusClass(request.overall_status)">
                  <i class="fas" :class="getStatusIcon(request.overall_status)"></i>
                  <div class="history-details">
                    <span class="history-title">Diproses oleh {{ request.approvedBy.nama_lengkap }} ({{ request.approvedBy.user.role }})</span>
                    <span class="history-status">{{ getStatusLabel(request.overall_status) }}</span>
                    <span v-if="request.notes" class="history-notes">Catatan: {{ request.notes }}</span>
                    <span v-if="request.rejection_reason" class="history-notes">Alasan Ditolak: {{ request.rejection_reason }}</span>
                    <span class="history-date">{{ formatDateTime(request.approved_at || request.rejected_at || request.updated_at) }}</span>
                  </div>
                </div>
  
                                    <div v-else-if="request.overall_status === 'pending'" class="history-item pending">
                    <i class="fas fa-clock"></i>
                    <div class="history-details">
                      <span class="history-title">Menunggu Persetujuan</span>
                      <span class="history-status">Menunggu tindakan dari {{ getManagerForRole(request.employee.jabatan_saat_ini) }}</span>
                    </div>
                </div>
              </div>
            </div>
            
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
    await this.loadUserData();
    await this.loadLeaveData();
    await this.loadManagerInfo();
    this.$emitter.on('request-updated', this.loadLeaveData); // Listen for event
  },
  beforeUnmount() {
    this.$emitter.off('request-updated', this.loadLeaveData); // Clean up listener
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
        this.userName = user.nama_lengkap || user.name || user.fullName || 'Karyawan'
        this.userId = user.id || user.user_id
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
          headers: { 'Authorization': `Bearer ${token}` },
          params: { employee_id: this.userId, include_approver: true }
        })
        
        const requests = response.data.data || response.data
        this.recentRequests = requests.slice(0, 5)
        
        this.leaveStats.pending = requests.filter(r => r.overall_status === 'pending').length
        this.leaveStats.approved = requests.filter(r => r.overall_status === 'approved').length
        this.leaveStats.rejected = requests.filter(r => r.overall_status === 'rejected').length
      } catch (error) {
        console.error('Error loading leave data:', error)
        this.recentRequests = []
        this.leaveStats = { pending: 0, approved: 0, rejected: 0 }
      }
    },

    async loadManagerInfo() {
      // Logika ini bisa disederhanakan atau diperbaiki sesuai kebutuhan
      try {
        const managerRole = this.getManagerForRole(this.userRole);
        this.managerInfo.name = managerRole;
        this.managerInfo.type = managerRole;
      } catch (error) {
        console.error('Error loading manager info:', error)
      }
    },
    
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      return new Date(dateTime).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    },

    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    },

    // ✅ METHOD BARU: Menentukan manajer yang benar berdasarkan role karyawan
    getManagerForRole(employeeRole) {
        if (!employeeRole) return 'Atasan'; // Fallback
        const hierarchy = {
            'Finance': 'HR Manager',
            'General Affairs': 'HR Manager',
            'Office Assistant': 'HR Manager',
            'Producer': 'Program Manager',
            'Creative': 'Program Manager',
            'Production': 'Program Manager',
            'Editor': 'Program Manager',
            'Social Media': 'Distribution Manager',
            'Promotion': 'Distribution Manager',
            'Graphic Design': 'Distribution Manager',
            'Hopeline Care': 'Distribution Manager'
        };
        return hierarchy[employeeRole] || 'Atasan';
    },

    // ✅ METHOD DIPERBARUI: Menggunakan helper baru untuk status pending
    getDetailedStatusName(request) {
        const status = request.overall_status;
        if (status === 'pending') {
            const employeeRole = request.employee?.jabatan_saat_ini;
            const managerRole = this.getManagerForRole(employeeRole);
            return `Menunggu Persetujuan ${managerRole}`;
        }
        return this.getStatusLabel(status);
    },

    getStatusLabel(status) {
      const labels = {
        'approved': 'Disetujui', 'rejected': 'Ditolak', 'pending': 'Menunggu Persetujuan'
      };
      return labels[status] || 'Dalam Proses';
    },
    
    getLeaveTypeName(type) {
      const types = {
        annual: 'Cuti Tahunan', sick: 'Cuti Sakit', emergency: 'Cuti Darurat',
        maternity: 'Cuti Melahirkan', paternity: 'Cuti Ayah'
      }
      return types[type] || type
    },
    
    getStatusClass(status) {
      if (status === 'approved') return 'approved';
      if (status === 'rejected') return 'rejected';
      return 'pending';
    },

    getStatusIcon(status) {
      if (status === 'approved') return 'fa-check-circle';
      if (status === 'rejected') return 'fa-times-circle';
      return 'fa-clock';
    },
    
    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    },
    
    showLeaveHistory() {
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

.approval-history-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

.approval-history-container h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.approval-history {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-item i {
  font-size: 1.5rem;
  color: #ccc;
}

.history-item.submitted i {
  color: #3498db;
  /* Blue for submitted */
}

.history-item.approved i {
  color: #2ecc71;
  /* Green for approved */
}

.history-item.rejected i {
  color: #e74c3c;
  /* Red for rejected */
}

.history-item.pending i {
  color: #f39c12;
  /* Orange for pending */
}

.history-details {
  display: flex;
  flex-direction: column;
}

.history-title {
  font-weight: bold;
  color: #555;
}

.history-status {
  font-size: 0.9rem;
  color: #777;
}

.history-notes {
  font-size: 0.9rem;
  color: #777;
  font-style: italic;
  margin-top: 4px;
}

.history-date {
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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

.leave-summary,
.recent-requests {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
}

.request-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
  0%,
  100% {
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
