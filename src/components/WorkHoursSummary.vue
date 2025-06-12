<template>
  <div class="summary-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1>Rekapitulasi Jam Kerja</h1>
      <p>Laporan dan ringkasan jam kerja karyawan per bulan</p>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-card">
        <div class="filter-group">
          <label>Bulan</label>
          <select v-model="filters.month" class="filter-input">
            <option v-for="month in months" :key="month.value" :value="month.value">
              {{ month.label }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tahun</label>
          <select v-model="filters.year" class="filter-input">
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Karyawan (Opsional)</label>
          <select v-model="filters.employee_id" class="filter-input">
            <option value="">Semua Karyawan</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="loadSummary" class="btn-primary">
            <i class="fas fa-search"></i> Tampilkan Laporan
          </button>
          <button @click="exportToExcel" class="btn-secondary" :disabled="!summaryData.length">
            <i class="fas fa-file-excel"></i> Export Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid" v-if="summaryData.length">
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalWorkHours.toFixed(1) }}</h3>
          <p>Total Jam Kerja</p>
          <span class="stat-change">{{ summaryData.length }} karyawan</span>
        </div>
      </div>
      
      <div class="stat-card warning">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalOvertimeHours.toFixed(1) }}</h3>
          <p>Total Jam Lembur</p>
          <span class="stat-change">Semua karyawan</span>
        </div>
      </div>
      
      <div class="stat-card success">
        <div class="stat-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ averageAttendance.toFixed(1) }}%</h3>
          <p>Rata-rata Kehadiran</p>
          <span class="stat-change">Tingkat kehadiran</span>
        </div>
      </div>
      
      <div class="stat-card info">
        <div class="stat-icon">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalPresentDays }}</h3>
          <p>Total Hari Hadir</p>
          <span class="stat-change">Semua karyawan</span>
        </div>
      </div>
    </div>

    <!-- Summary Table -->
    <div class="table-section" v-if="summaryData.length">
      <div class="table-header">
        <h3>Detail Rekapitulasi</h3>
        <div class="table-controls">
          <input 
            type="text" 
            placeholder="Cari karyawan..." 
            v-model="searchQuery"
            class="search-input"
          />
        </div>
      </div>
      
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Nama Karyawan</th>
              <th>Total Jam Kerja</th>
              <th>Total Lembur</th>
              <th>Hari Hadir</th>
              <th>Hari Sakit</th>
              <th>Hari Cuti</th>
              <th>Hari Izin</th>
              <th>Tidak Hadir</th>
              <th>Tingkat Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="summary in filteredSummary" :key="summary.employee_id" class="table-row">
              <td>
                <div class="employee-info">
                  <strong>{{ summary.employee?.name || 'N/A' }}</strong>
                  <small>{{ summary.employee?.employee_id || '' }}</small>
                </div>
              </td>
              <td>
                <span class="work-hours">{{ summary.total_work_hours || 0 }} jam</span>
              </td>
              <td>
                <span class="overtime-hours">{{ summary.total_overtime_hours || 0 }} jam</span>
              </td>
              <td>
                <span class="present-badge">{{ summary.present_days || 0 }}</span>
              </td>
              <td>
                <span class="sick-badge">{{ summary.sick_days || 0 }}</span>
              </td>
              <td>
                <span class="leave-badge">{{ summary.leave_days || 0 }}</span>
              </td>
              <td>
                <span class="permission-badge">{{ summary.permission_days || 0 }}</span>
              </td>
              <td>
                <span class="absent-badge">{{ summary.absent_days || 0 }}</span>
              </td>
              <td>
                <div class="attendance-rate">
                  <span class="rate-text">{{ calculateAttendanceRate(summary) }}%</span>
                  <div class="rate-bar">
                    <div class="rate-fill" :style="{ width: calculateAttendanceRate(summary) + '%' }"></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <i class="fas fa-chart-bar"></i>
      <h3>Belum ada data rekapitulasi</h3>
      <p>Pilih bulan dan tahun untuk melihat laporan jam kerja</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Memuat data rekapitulasi...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'WorkHoursSummary',
  data() {
    return {
      summaryData: [],
      employees: [],
      loading: false,
      searchQuery: '',
      filters: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employee_id: ''
      },
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
      ]
    }
  },
  computed: {
    years() {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
    },
    filteredSummary() {
      if (!this.searchQuery) return this.summaryData
      
      return this.summaryData.filter(summary => 
        summary.employee?.name?.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    totalWorkHours() {
      return this.summaryData.reduce((total, summary) => 
        total + (parseFloat(summary.total_work_hours) || 0), 0
      )
    },
    totalOvertimeHours() {
      return this.summaryData.reduce((total, summary) => 
        total + (parseFloat(summary.total_overtime_hours) || 0), 0
      )
    },
    totalPresentDays() {
      return this.summaryData.reduce((total, summary) => 
        total + (parseInt(summary.present_days) || 0), 0
      )
    },
    averageAttendance() {
      if (!this.summaryData.length) return 0
      
      const totalRate = this.summaryData.reduce((total, summary) => 
        total + this.calculateAttendanceRate(summary), 0
      )
      
      return totalRate / this.summaryData.length
    }
  },
  mounted() {
    this.loadEmployees()
    this.loadSummary()
  },
  methods: {
    async loadEmployees() {
      try {
        const response = await axios.get('/api/employees')
        this.employees = response.data.data || []
      } catch (error) {
        console.error('Error loading employees:', error)
      }
    },
    async loadSummary() {
      this.loading = true
      try {
        const params = {
          month: this.filters.month,
          year: this.filters.year
        }
        
        if (this.filters.employee_id) {
          params.employee_id = this.filters.employee_id
        }
        
        const response = await axios.get('/api/attendances/summary', { params })
        this.summaryData = response.data.data || []
      } catch (error) {
        console.error('Error loading summary:', error)
        alert('Gagal memuat data rekapitulasi')
      } finally {
        this.loading = false
      }
    },
    calculateAttendanceRate(summary) {
      const totalDays = (summary.present_days || 0) + 
                       (summary.sick_days || 0) + 
                       (summary.leave_days || 0) + 
                       (summary.permission_days || 0) + 
                       (summary.absent_days || 0)
      
      if (totalDays === 0) return 0
      
      const attendedDays = (summary.present_days || 0) + 
                          (summary.sick_days || 0) + 
                          (summary.leave_days || 0) + 
                          (summary.permission_days || 0)
      
      return Math.round((attendedDays / totalDays) * 100)
    },
    exportToExcel() {
      // Implementasi export ke Excel
      const csvContent = this.generateCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `rekapitulasi-${this.filters.month}-${this.filters.year}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    generateCSV() {
      const headers = [
        'Nama Karyawan',
        'Total Jam Kerja',
        'Total Lembur',
        'Hari Hadir',
        'Hari Sakit',
        'Hari Cuti',
        'Hari Izin',
        'Tidak Hadir',
        'Tingkat Kehadiran (%)'
      ]
      
      const rows = this.summaryData.map(summary => [
        summary.employee?.name || 'N/A',
        summary.total_work_hours || 0,
        summary.total_overtime_hours || 0,
        summary.present_days || 0,
        summary.sick_days || 0,
        summary.leave_days || 0,
        summary.permission_days || 0,
        summary.absent_days || 0,
        this.calculateAttendanceRate(summary)
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
  }
}
</script>

<style scoped>
.summary-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--gray-600);
  font-size: 1.1rem;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.filter-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

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
}

.stat-card.primary {
  border-left: 4px solid var(--primary-color);
}

.stat-card.warning {
  border-left: 4px solid var(--warning-color);
}

.stat-card.success {
  border-left: 4px solid var(--success-color);
}

.stat-card.info {
  border-left: 4px solid var(--info-color);
}

.stat-icon {
  font-size: 2rem;
  color: var(--gray-600);
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 250px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
  white-space: nowrap;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
}

.table-row:hover {
  background: var(--gray-50);
}

.employee-info strong {
  display: block;
  color: var(--gray-900);
}

.employee-info small {
  color: var(--gray-500);
  font-size: 0.8rem;
}

.work-hours {
  font-weight: 600;
  color: var(--primary-color);
}

.overtime-hours {
  font-weight: 600;
  color: var(--warning-color);
}

.present-badge,
.sick-badge,
.leave-badge,
.permission-badge,
.absent-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  min-width: 30px;
}

.present-badge {
  background: #dcfce7;
  color: #166534;
}

.sick-badge {
  background: #fef3c7;
  color: #92400e;
}

.leave-badge {
  background: #dbeafe;
  color: #1e40af;
}

.permission-badge {
  background: #f3e8ff;
  color: #7c3aed;
}

.absent-badge {
  background: #fee2e2;
  color: #991b1b;
}

.attendance-rate {
  min-width: 100px;
}

.rate-text {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.9rem;
}

.rate-bar {
  width: 100%;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  margin-top: 0.25rem;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--primary-color));
  transition: width 0.3s ease;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
}

.empty-state i,
.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-state i {
  color: var(--primary-color);
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
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--success-color);
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
  white-space: nowrap;
}

.btn-secondary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .summary-container {
    padding: 1rem;
  }
  
  .filter-card {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    grid-column: 1 / -1;
    justify-content: stretch;
  }
  
  .filter-actions .btn-primary,
  .filter-actions .btn-secondary {
    flex: 1;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 0.5rem;
  }
}
</style>