<template>
  <div class="leave-dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <h1>Dashboard Cuti Karyawan</h1>
      <p>Kelola dan monitor sistem cuti karyawan</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ leaveStats.approved_today || 0 }}</h3>
          <p>Cuti Disetujui Hari Ini</p>
          <span class="stat-change positive">{{ leaveStats.approved_percentage || 0 }}% dari permohonan</span>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ leaveStats.pending || 0 }}</h3>
          <p>Menunggu Persetujuan</p>
          <span class="stat-change">Permohonan pending</span>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon">
          <i class="fas fa-user-injured"></i>
        </div>
        <div class="stat-content">
          <h3>{{ leaveStats.sick_leave || 0 }}</h3>
          <p>Cuti Sakit</p>
          <span class="stat-change">Bulan ini</span>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <h3>{{ leaveStats.annual_leave || 0 }}</h3>
          <p>Cuti Tahunan</p>
          <span class="stat-change">Bulan ini</span>
        </div>
      </div>
    </div>

    <!-- Leave Quota Summary -->
    <div class="quota-section">
      <div class="section-header">
        <h2>Ringkasan Jatah Cuti</h2>
        <div class="filter-controls">
          <select v-model="selectedDepartment" @change="fetchLeaveData" class="filter-select">
            <option value="">Semua Departemen</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="quota-cards">
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Tahunan</h3>
            <i class="fas fa-calendar"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_annual_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: quotaStats.annual_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.annual_used || 0 }} hari terpakai ({{ quotaStats.annual_usage_percentage || 0 }}%)</div>
          </div>
        </div>
        
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Sakit</h3>
            <i class="fas fa-user-injured"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_sick_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill sick" :style="{width: quotaStats.sick_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.sick_used || 0 }} hari terpakai ({{ quotaStats.sick_usage_percentage || 0 }}%)</div>
          </div>
        </div>
        
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Darurat</h3>
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_emergency_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill emergency" :style="{width: quotaStats.emergency_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.emergency_used || 0 }} hari terpakai ({{ quotaStats.emergency_usage_percentage || 0 }}%)</div>
          </div>
        </div>
        
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Melahirkan</h3>
            <i class="fas fa-baby"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_maternity_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill maternity" :style="{width: quotaStats.maternity_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.maternity_used || 0 }} hari terpakai ({{ quotaStats.maternity_usage_percentage || 0 }}%)</div>
          </div>
        </div>
        
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Ayah</h3>
            <i class="fas fa-male"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_paternity_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill paternity" :style="{width: quotaStats.paternity_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.paternity_used || 0 }} hari terpakai ({{ quotaStats.paternity_usage_percentage || 0 }}%)</div>
          </div>
        </div>
        
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Menikah</h3>
            <i class="fas fa-heart"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_marriage_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill marriage" :style="{width: quotaStats.marriage_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.marriage_used || 0 }} hari terpakai ({{ quotaStats.marriage_usage_percentage || 0 }}%)</div>
          </div>
        </div>
        
        <div class="quota-card">
          <div class="card-header">
            <h3>Total Jatah Cuti Duka</h3>
            <i class="fas fa-cross"></i>
          </div>
          <div class="card-content">
            <div class="big-number">{{ quotaStats.total_bereavement_quota || 0 }}</div>
            <div class="card-subtitle">Hari untuk semua karyawan</div>
            <div class="progress-bar">
              <div class="progress-fill bereavement" :style="{width: quotaStats.bereavement_usage_percentage + '%'}"></div>
            </div>
            <div class="progress-text">{{ quotaStats.bereavement_used || 0 }} hari terpakai ({{ quotaStats.bereavement_usage_percentage || 0 }}%)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Requests Management -->
    <div class="requests-section">
      <div class="section-header">
        <h2>Kelola Permohonan Cuti</h2>
        <div class="header-actions">
          // Update filter options untuk konsistensi
          <select v-model="requestFilter" @change="fetchLeaveRequests" class="filter-select">
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <button @click="refreshData" class="btn-secondary">
            <i class="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>
      
      <div class="requests-table">
        <div class="table-header">
          <div class="table-row">
            <div class="table-cell">Karyawan</div>
            <div class="table-cell">Jenis Cuti</div>
            <div class="table-cell">Tanggal</div>
            <div class="table-cell">Durasi</div>
            <div class="table-cell">Status</div>
            <div class="table-cell">Aksi</div>
          </div>
        </div>
        
        <div class="table-body">
          <div v-for="request in leaveRequests" :key="request.id" class="table-row">
            <div class="table-cell">
              <div class="employee-info">
                <div class="employee-name">{{ request.employee.name }}</div>
                <div class="employee-dept">{{ request.employee.department }}</div>
              </div>
            </div>
            <div class="table-cell">
              <span class="leave-type" :class="request.leave_type">
                {{ getLeaveTypeText(request.leave_type) }}
              </span>
            </div>
            <div class="table-cell">
              <div class="date-range">
                <div>{{ formatDate(request.start_date) }}</div>
                <div class="date-separator">s/d</div>
                <div>{{ formatDate(request.end_date) }}</div>
              </div>
            </div>
            <div class="table-cell">
              <span class="duration">{{ request.total_days }} hari</span>
            </div>
            <div class="table-cell">
              <span class="status" :class="request.status">
                {{ getStatusText(request.status) }}
              </span>
            </div>
            <div class="table-cell">
              <div class="action-buttons" v-if="request.status === 'pending'">
                <button @click="approveRequest(request.id)" class="btn-approve">
                  <i class="fas fa-check"></i>
                </button>
                <button @click="rejectRequest(request.id)" class="btn-reject">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div v-else class="action-buttons">
                <button @click="viewRequest(request.id)" class="btn-view">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
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
        <router-link to="/cuti/permohonan-baru" class="action-card">
          <div class="action-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="action-content">
            <h3>Buat Permohonan Cuti</h3>
            <p>Ajukan permohonan cuti baru</p>
          </div>
        </router-link>
        
        <router-link to="/cuti/jatah" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <div class="action-content">
            <h3>Kelola Jatah Cuti</h3>
            <p>Atur jatah cuti karyawan</p>
          </div>
        </router-link>
        
        <router-link to="/cuti/laporan" class="action-card">
          <div class="action-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="action-content">
            <h3>Laporan Cuti</h3>
            <p>Lihat statistik dan laporan cuti</p>
          </div>
        </router-link>
        
        <router-link to="/cuti/kalender" class="action-card">
          <div class="action-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="action-content">
            <h3>Kalender Cuti</h3>
            <p>Lihat jadwal cuti karyawan</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LeaveDashboard',
  data() {
    return {
      leaveStats: {},
      quotaStats: {},
      leaveRequests: [],
      departments: [],
      selectedDepartment: '',
      requestFilter: 'all',
      loading: false
    }
  },
  mounted() {
    this.fetchLeaveData()
    this.fetchLeaveRequests()
    this.fetchDepartments()
  },
  methods: {
    async fetchLeaveData() {
      try {
        this.loading = true
        const response = await axios.get('/api/leave-requests/dashboard', {
          params: {
            department: this.selectedDepartment
          }
        })
        if (response.data.success) {
          this.leaveStats = response.data.data.stats
          this.quotaStats = response.data.data.quota_summary
        }
      } catch (error) {
        console.error('Error fetching leave data:', error)
        this.$toast?.error('Gagal memuat data cuti')
      } finally {
        this.loading = false
      }
    },
    
    async fetchLeaveRequests() {
      try {
        const response = await axios.get('/api/leave-requests', {
          params: {
            status: this.requestFilter === 'all' ? '' : this.requestFilter,
            department: this.selectedDepartment,
            limit: 20
          }
        })
        if (response.data.success) {
          this.leaveRequests = response.data.data
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error)
      }
    },
    
    async fetchDepartments() {
      try {
        const response = await axios.get('/api/departments')
        if (response.data.success) {
          this.departments = response.data.data
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    },
    
    async approveRequest(requestId) {
      try {
        const response = await axios.post(`/api/leave-requests/${requestId}/approve`)
        if (response.data.success) {
          this.$toast?.success('Permohonan cuti berhasil disetujui')
          this.fetchLeaveRequests()
          this.fetchLeaveData()
        }
      } catch (error) {
        console.error('Error approving request:', error)
        this.$toast?.error('Gagal menyetujui permohonan cuti')
      }
    },
    
    async rejectRequest(requestId) {
      try {
        const response = await axios.post(`/api/leave-requests/${requestId}/reject`)
        if (response.data.success) {
          this.$toast?.success('Permohonan cuti berhasil ditolak')
          this.fetchLeaveRequests()
          this.fetchLeaveData()
        }
      } catch (error) {
        console.error('Error rejecting request:', error)
        this.$toast?.error('Gagal menolak permohonan cuti')
      }
    },
    
    viewRequest(requestId) {
      this.$router.push(`/cuti/detail/${requestId}`)
    },
    
    refreshData() {
      this.fetchLeaveData()
      this.fetchLeaveRequests()
    },
    
    getLeaveTypeText(type) {
      const types = {
        annual: 'Cuti Tahunan',
        sick: 'Cuti Sakit',
        emergency: 'Cuti Darurat',
        maternity: 'Cuti Melahirkan',
        paternity: 'Cuti Ayah',
        marriage: 'Cuti Nikah'
      }
      return types[type] || type
    },
    
    getStatusText(status) {
      const statusTexts = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak'
      }
      return statusTexts[status] || status
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.leave-dashboard-container {
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
  background: var(--bg-secondary);
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

/* Quota Section */
.quota-section {
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

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--gray-700);
  font-size: 0.875rem;
}

.quota-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.quota-card {
  background: var(--bg-secondary);
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
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-fill.sick {
  background: var(--warning-color);
}

.progress-fill.emergency {
  background: var(--danger-color);
}

.progress-fill.maternity {
  background: #ec4899;
}

.progress-fill.paternity {
  background: #3b82f6;
}

.progress-fill.marriage {
  background: #f59e0b;
}

.progress-fill.bereavement {
  background: #6b7280;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--gray-600);
}

/* Requests Section */
.requests-section {
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.requests-table {
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-header {
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 2fr 1fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  align-items: center;
}

.table-header .table-row {
  font-weight: 600;
  color: var(--gray-700);
}

.table-body .table-row {
  border-bottom: 1px solid var(--gray-200);
}

.table-body .table-row:last-child {
  border-bottom: none;
}

.table-body .table-row:hover {
  background: var(--gray-50);
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.employee-dept {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.leave-type {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.leave-type.annual {
  background: #dbeafe;
  color: #1e40af;
}

.leave-type.sick {
  background: #fef3c7;
  color: #92400e;
}

.leave-type.emergency {
  background: #fee2e2;
  color: #991b1b;
}

.date-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.date-separator {
  color: var(--gray-500);
  font-size: 0.75rem;
  text-align: center;
}

.duration {
  font-weight: 600;
  color: var(--gray-900);
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.approved {
  background: #dcfce7;
  color: #166534;
}

.status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-approve, .btn-reject, .btn-view {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-approve {
  background: var(--success-color);
  color: white;
}

.btn-approve:hover {
  background: #059669;
}

.btn-reject {
  background: var(--danger-color);
  color: white;
}

.btn-reject:hover {
  background: #dc2626;
}

.btn-view {
  background: var(--info-color);
  color: white;
}

.btn-view:hover {
  background: #0891b2;
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
  background: var(--bg-secondary);
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
  .leave-dashboard-container {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quota-cards {
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
  
  .header-actions {
    width: 100%;
  }
  
  .filter-select {
    flex: 1;
  }
  
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }
  
  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--gray-700);
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
}
</style>
