<template>
  <div class="attendance-container">
    <!-- Header Section -->
    <div class="page-header">
      <h1>Sistem Absensi</h1>
      <p>Kelola absensi karyawan: check-in, check-out, dan input manual</p>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card check-in" @click="showCheckInModal = true">
        <div class="action-icon">
          <i class="fas fa-sign-in-alt"></i>
        </div>
        <div class="action-content">
          <h3>Check In</h3>
          <p>Catat waktu masuk kerja</p>
        </div>
      </div>
      
      <div class="action-card check-out" @click="showCheckOutModal = true">
        <div class="action-icon">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <div class="action-content">
          <h3>Check Out</h3>
          <p>Catat waktu pulang kerja</p>
        </div>
      </div>
      
      <div class="action-card manual-entry" @click="showManualModal = true">
        <div class="action-icon">
          <i class="fas fa-edit"></i>
        </div>
        <div class="action-content">
          <h3>Input Manual</h3>
          <p>Tambah absensi manual</p>
        </div>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="table-section">
      <div class="table-header">
        <h3>Riwayat Absensi</h3>
        <div class="table-controls">
          <input 
            type="date" 
            v-model="filterDate"
            class="filter-input"
          />
          <select v-model="filterStatus" class="filter-select">
            <option value="">Semua Status</option>
            <option value="present">Hadir</option>
            <option value="absent">Tidak Hadir</option>
            <option value="sick">Sakit</option>
            <option value="leave">Cuti</option>
            <option value="permission">Izin</option>
          </select>
          <button @click="loadAttendances" class="btn-primary">
            <i class="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>
      
      <div class="table-container" v-if="attendances.length">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Karyawan</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Jam Kerja</th>
              <th>Lembur</th>
              <th>Status</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attendance in paginatedAttendances" :key="attendance.id" class="table-row">
              <td>{{ formatDate(attendance.date) }}</td>
              <td>{{ attendance.employee?.name || 'N/A' }}</td>
              <td>{{ attendance.check_in || '-' }}</td>
              <td>{{ attendance.check_out || '-' }}</td>
              <td>{{ attendance.work_hours || 0 }} jam</td>
              <td>{{ attendance.overtime_hours || 0 }} jam</td>
              <td>
                <span class="status-badge" :class="attendance.status">
                  {{ getStatusText(attendance.status) }}
                </span>
              </td>
              <td>{{ attendance.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="empty-state">
        <i class="fas fa-calendar-times"></i>
        <h3>Belum ada data absensi</h3>
        <p>Mulai dengan check-in atau tambah data manual</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Next
      </button>
    </div>

    <!-- Check In Modal -->
    <div v-if="showCheckInModal" class="modal-overlay" @click="showCheckInModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Check In</h3>
          <button @click="showCheckInModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Pilih Karyawan</label>
            <select v-model="checkInForm.employee_id" class="form-input">
              <option value="">Pilih karyawan...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>
          <div class="current-time">
            <p>Waktu saat ini: {{ currentTime }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCheckInModal = false" class="btn-secondary">Batal</button>
          <button @click="checkIn" class="btn-primary" :disabled="!checkInForm.employee_id">
            Check In Sekarang
          </button>
        </div>
      </div>
    </div>

    <!-- Check Out Modal -->
    <div v-if="showCheckOutModal" class="modal-overlay" @click="showCheckOutModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Check Out</h3>
          <button @click="showCheckOutModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Pilih Karyawan</label>
            <select v-model="checkOutForm.employee_id" class="form-input">
              <option value="">Pilih karyawan...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>
          <div class="current-time">
            <p>Waktu saat ini: {{ currentTime }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCheckOutModal = false" class="btn-secondary">Batal</button>
          <button @click="checkOut" class="btn-primary" :disabled="!checkOutForm.employee_id">
            Check Out Sekarang
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Entry Modal -->
    <div v-if="showManualModal" class="modal-overlay" @click="showManualModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Input Absensi Manual</h3>
          <button @click="showManualModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Karyawan *</label>
            <select v-model="manualForm.employee_id" class="form-input" required>
              <option value="">Pilih karyawan...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Tanggal *</label>
            <input type="date" v-model="manualForm.date" class="form-input" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Check In</label>
              <input type="time" v-model="manualForm.check_in" class="form-input" />
            </div>
            <div class="form-group">
              <label>Check Out</label>
              <input type="time" v-model="manualForm.check_out" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Status *</label>
            <select v-model="manualForm.status" class="form-input" required>
              <option value="present">Hadir</option>
              <option value="absent">Tidak Hadir</option>
              <option value="sick">Sakit</option>
              <option value="leave">Cuti</option>
              <option value="permission">Izin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Catatan</label>
            <textarea v-model="manualForm.notes" class="form-input" rows="3" placeholder="Catatan tambahan..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showManualModal = false" class="btn-secondary">Batal</button>
          <button @click="submitManualEntry" class="btn-primary">
            Simpan Absensi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Attendance',
  data() {
    return {
      attendances: [],
      employees: [],
      currentTime: '',
      showCheckInModal: false,
      showCheckOutModal: false,
      showManualModal: false,
      filterDate: '',
      filterStatus: '',
      currentPage: 1,
      itemsPerPage: 10,
      checkInForm: {
        employee_id: ''
      },
      checkOutForm: {
        employee_id: ''
      },
      manualForm: {
        employee_id: '',
        date: '',
        check_in: '',
        check_out: '',
        status: 'present',
        notes: ''
      }
    }
  },
  computed: {
    filteredAttendances() {
      let filtered = this.attendances
      
      if (this.filterDate) {
        filtered = filtered.filter(att => att.date === this.filterDate)
      }
      
      if (this.filterStatus) {
        filtered = filtered.filter(att => att.status === this.filterStatus)
      }
      
      return filtered
    },
    paginatedAttendances() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredAttendances.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredAttendances.length / this.itemsPerPage)
    }
  },
  mounted() {
    this.loadAttendances()
    this.loadEmployees()
    this.updateCurrentTime()
    setInterval(this.updateCurrentTime, 1000)
  },
  methods: {
    async loadAttendances() {
      try {
        const response = await axios.get('/api/attendances')
        this.attendances = response.data.data || []
      } catch (error) {
        console.error('Error loading attendances:', error)
        alert('Gagal memuat data absensi')
      }
    },
    async loadEmployees() {
      try {
        const response = await axios.get('/api/employees')
        this.employees = response.data.data || []
      } catch (error) {
        console.error('Error loading employees:', error)
      }
    },
    async checkIn() {
      try {
        await axios.post('/api/attendances/check-in', this.checkInForm)
        alert('Check-in berhasil!')
        this.showCheckInModal = false
        this.checkInForm.employee_id = ''
        this.loadAttendances()
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal check-in')
      }
    },
    async checkOut() {
      try {
        await axios.post('/api/attendances/check-out', this.checkOutForm)
        alert('Check-out berhasil!')
        this.showCheckOutModal = false
        this.checkOutForm.employee_id = ''
        this.loadAttendances()
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal check-out')
      }
    },
    async submitManualEntry() {
      try {
        await axios.post('/api/attendances', this.manualForm)
        alert('Absensi berhasil disimpan!')
        this.showManualModal = false
        this.resetManualForm()
        this.loadAttendances()
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menyimpan absensi')
      }
    },
    resetManualForm() {
      this.manualForm = {
        employee_id: '',
        date: '',
        check_in: '',
        check_out: '',
        status: 'present',
        notes: ''
      }
    },
    updateCurrentTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('id-ID')
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID')
    },
    getStatusText(status) {
      const statusMap = {
        present: 'Hadir',
        absent: 'Tidak Hadir',
        sick: 'Sakit',
        leave: 'Cuti',
        permission: 'Izin'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.attendance-container {
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

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-card.check-in {
  border-color: var(--success-color);
}

.action-card.check-in:hover {
  background: linear-gradient(135deg, var(--success-color), #059669);
  color: white;
}

.action-card.check-out {
  border-color: var(--warning-color);
}

.action-card.check-out:hover {
  background: linear-gradient(135deg, var(--warning-color), #d97706);
  color: white;
}

.action-card.manual-entry {
  border-color: var(--primary-color);
}

.action-card.manual-entry:hover {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.action-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.action-content p {
  color: var(--gray-600);
  font-size: 0.9rem;
}

.action-card:hover .action-content p {
  color: rgba(255, 255, 255, 0.9);
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

.table-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-input,
.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.9rem;
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
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.table-row:hover {
  background: var(--gray-50);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.present {
  background: #dcfce7;
  color: #166534;
}

.status-badge.absent {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.sick {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.leave {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.permission {
  background: #f3e8ff;
  color: #7c3aed;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-500);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.current-time {
  background: var(--gray-50);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  color: var(--gray-700);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
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
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--gray-700);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--gray-300);
}

@media (max-width: 768px) {
  .attendance-container {
    padding: 1rem;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-controls {
    flex-direction: column;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>