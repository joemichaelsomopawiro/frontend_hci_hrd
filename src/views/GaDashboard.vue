<template>
  <div class="ga-dashboard">
    <div class="dashboard-header">
      <h1>Dashboard General Affairs</h1>
      <p>Manajemen Absensi Renungan Pagi</p>
    </div>

    <!-- Statistik -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon present">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.present }}</h3>
          <p>Hadir Hari Ini</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon absent">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.absent }}</h3>
          <p>Tidak Hadir</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon late">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.late }}</h3>
          <p>Terlambat</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon leave">
          <i class="fas fa-umbrella-beach"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.leave }}</h3>
          <p>Cuti</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-section">
      <div class="filter-group">
        <label>Tanggal:</label>
        <input type="date" v-model="selectedDate" @change="filterData">
      </div>
      
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="selectedStatus" @change="filterData">
          <option value="">Semua Status</option>
          <option value="present">Hadir</option>
          <option value="absent">Tidak Hadir</option>
          <option value="late">Terlambat</option>
          <option value="leave">Cuti</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Cari:</label>
        <input type="text" v-model="searchQuery" @input="filterData" placeholder="Nama pegawai...">
      </div>
      
      <div class="filter-group">
        <button @click="loadData" class="btn-refresh">
          <i class="fas fa-sync-alt"></i>
          Refresh Data
        </button>
      </div>
      
      <div class="filter-group">
        <button @click="debugData" class="btn-debug">
          <i class="fas fa-bug"></i>
          Debug Data
        </button>
      </div>
      
      <div class="filter-group">
        <button @click="resetData" class="btn-reset">
          <i class="fas fa-trash"></i>
          Reset Data
        </button>
      </div>
    </div>

    <!-- Tabel -->
    <div class="table-container">
      <div v-if="filteredData.length === 0" class="no-data">
        <i class="fas fa-inbox"></i>
        <p>Belum ada data absensi renungan pagi</p>
        <small>Data akan muncul setelah user melakukan absensi renungan pagi</small>
      </div>
      
      <table v-else class="attendance-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Jabatan</th>
            <th>Tanggal</th>
            <th>Waktu</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in filteredData" :key="record.id">
            <td>{{ index + 1 }}</td>
            <td>{{ record.name }}</td>
            <td>{{ record.position }}</td>
            <td>{{ formatDate(record.date) }}</td>
            <td>{{ record.attendance_time || '-' }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="editRecord(record)">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { useGaStore } from '../stores/gaStore'

export default {
  name: 'GaDashboard',
  data() {
    return {
      gaStore: useGaStore(),
      selectedDate: new Date().toISOString().split('T')[0],
      selectedStatus: '',
      searchQuery: '',
      attendanceData: [],
      stats: {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0
      }
    }
  },
  computed: {
    filteredData() {
      let filtered = [...this.attendanceData];
      
      if (this.selectedDate) {
        filtered = filtered.filter(item => item.date === this.selectedDate);
      }
      
      if (this.selectedStatus) {
        filtered = filtered.filter(item => item.status === this.selectedStatus);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.position.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        console.log('Loading GA Dashboard data...');
        
        // Load data dari GA Store dengan error handling
        try {
          await this.gaStore.fetchMorningReflectionHistory();
        } catch (error) {
          console.warn('Error loading morning reflection history:', error);
        }
        
        try {
          await this.gaStore.fetchEmployees();
        } catch (error) {
          console.warn('Error loading employees:', error);
        }
        
        console.log('GA Store data:', {
          reflections: this.gaStore.morningReflectionHistory,
          employees: this.gaStore.employees
        });
        
        // Transform data untuk tampilan
        this.attendanceData = this.transformAttendanceData();
        
        console.log('Transformed attendance data:', this.attendanceData);
        
        this.calculateStats();
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback: set data kosong jika error
        this.attendanceData = [];
        this.stats = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
    },
    
    transformAttendanceData() {
      const reflections = this.gaStore.morningReflectionHistory || [];
      const employees = this.gaStore.employees || [];
      
      console.log('Transforming data:', { reflections, employees });
      
      return reflections.map(reflection => {
        const employee = employees.find(emp => emp.id === reflection.user_id);
        console.log('Finding employee for user_id:', reflection.user_id, 'Found:', employee);
        
        return {
          id: reflection.id,
          name: employee ? employee.nama_lengkap : `User ${reflection.user_id}`,
          position: employee ? employee.jabatan : '-',
          date: reflection.date,
          attendance_time: reflection.timestamp ? new Date(reflection.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          status: reflection.status || 'present'
        };
      });
    },
    
    calculateStats() {
      const today = this.selectedDate;
      const todayData = this.attendanceData.filter(item => item.date === today);
      
      this.stats.present = todayData.filter(item => item.status === 'present').length;
      this.stats.absent = todayData.filter(item => item.status === 'absent').length;
      this.stats.late = todayData.filter(item => item.status === 'late').length;
      this.stats.leave = todayData.filter(item => item.status === 'leave').length;
    },
    
    filterData() {
      // Refresh data dan stats
      this.attendanceData = this.transformAttendanceData();
      this.calculateStats();
    },
    
    editRecord(record) {
      console.log('Edit record:', record);
    },
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('id-ID');
    },
    
    getStatusClass(status) {
      const classMap = {
        present: 'status-present',
        absent: 'status-absent',
        late: 'status-late',
        leave: 'status-leave'
      };
      return classMap[status] || '';
    },
    
    getStatusText(status) {
      const textMap = {
        present: 'Hadir',
        absent: 'Tidak Hadir',
        late: 'Terlambat',
        leave: 'Cuti'
      };
      return textMap[status] || status;
    },
    
    debugData() {
      console.log('=== DEBUG DATA ===');
      console.log('LocalStorage morningReflectionHistory:', localStorage.getItem('morningReflectionHistory'));
      console.log('LocalStorage employees:', localStorage.getItem('employees'));
      console.log('GA Store morningReflectionHistory:', this.gaStore.morningReflectionHistory);
      console.log('GA Store employees:', this.gaStore.employees);
      console.log('Transformed attendanceData:', this.attendanceData);
      console.log('Filtered data:', this.filteredData);
      console.log('Stats:', this.stats);
      console.log('==================');
      
      // Tampilkan alert dengan data
      alert(`Data Debug:\n\nReflections: ${this.gaStore.morningReflectionHistory?.length || 0}\nEmployees: ${this.gaStore.employees?.length || 0}\nAttendance: ${this.attendanceData?.length || 0}`);
    },
    
    resetData() {
      // Implementasi reset data
      console.log('Reset data');
    }
  }
}
</script>

<style scoped>
.ga-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 28px;
}

.dashboard-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.present {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
}

.stat-icon.absent {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.stat-icon.late {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.stat-icon.leave {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th {
  background: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 1px solid #e1e8ed;
}

.attendance-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f3f4;
}

.attendance-table tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-present {
  background: rgba(46, 204, 113, 0.1);
  color: #27ae60;
}

.status-badge.status-absent {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.status-badge.status-late {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.status-badge.status-leave {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.btn-edit {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-refresh {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-refresh:hover {
  background: #2980b9;
}

.btn-debug {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-debug:hover {
  background: #2980b9;
}

.btn-reset {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.btn-reset:hover {
  background: #2980b9;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}

.no-data p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.no-data small {
  color: #999;
}

@media (max-width: 768px) {
  .ga-dashboard {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-group input,
  .filter-group select {
    min-width: auto;
  }
  
  .attendance-table {
    font-size: 14px;
  }
  
  .attendance-table th,
  .attendance-table td {
    padding: 10px;
  }
}
</style>
