<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <img src="/hopechannel.jpg" alt="Hope Channel Indonesia" class="logo" />
          <div class="title-section">
            <h1>Hope Channel Indonesia</h1>
            <p>Enterprise HR Management System</p>
          </div>
        </div>
        <div class="user-section">
          <span class="welcome-text">Welcome, HR Admin</span>
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ employees.length }}</h3>
            <p>Total Karyawan</p>
            <span class="stat-change positive">+{{ newEmployeesThisMonth }} bulan ini</span>
          </div>
        </div>
        
        <div class="stat-card success">
          <div class="stat-icon">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ activeEmployees }}</h3>
            <p>Karyawan Aktif</p>
            <span class="stat-change positive">{{ Math.round((activeEmployees/employees.length)*100) }}% aktif</span>
          </div>
        </div>
        
        <div class="stat-card warning">
          <div class="stat-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalTrainings }}</h3>
            <p>Total Pelatihan</p>
            <span class="stat-change">Sertifikasi karyawan</span>
          </div>
        </div>
        
        <div class="stat-card info">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-content">
            <h3>Rp {{ formatCurrency(totalSalary) }}</h3>
            <p>Total Gaji Bulanan</p>
            <span class="stat-change positive">Termasuk tunjangan</span>
          </div>
        </div>
      </div>

      <!-- Action Section -->
      <div class="action-section">
        <div class="section-header">
          <h2>Manajemen Karyawan</h2>
          <router-link to="/add-employee" class="btn-primary">
            <i class="fas fa-plus"></i>
            Tambah Karyawan Baru
          </router-link>
        </div>
      </div>

      <!-- Employee Table -->
      <div class="table-section">
        <div class="table-header">
          <h3>Daftar Karyawan</h3>
          <div class="table-controls">
            <input 
              type="text" 
              placeholder="Cari karyawan..." 
              v-model="searchQuery"
              class="search-input"
            />
            <select v-model="filterDepartment" class="filter-select">
              <option value="">Semua Departemen</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Production">Production</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>
        
        <div class="table-container" v-if="filteredEmployees.length">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>NIK</th>
                <th>NIP</th>
                <th>Jabatan</th>
                <th>Gaji Total</th>
                <th>Pelatihan</th>
                <th>Dokumen</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in paginatedEmployees" :key="employee.id" class="table-row">
                <td>
                  <div class="employee-info">
                    <strong>{{ employee.nama_lengkap }}</strong>
                    <small>{{ employee.tingkat_pendidikan }}</small>
                  </div>
                </td>
                <td>{{ employee.nik }}</td>
                <td>{{ employee.nip || '-' }}</td>
                <td>
                  <span class="job-title">{{ employee.jabatan_saat_ini }}</span>
                </td>
                <td>
                  <div class="salary-info">
                    <strong>Rp {{ formatCurrency(calculateTotalSalary(employee)) }}</strong>
                    <small>Gaji: {{ formatCurrency(employee.gaji_pokok) }}</small>
                  </div>
                </td>
                <td>
                  <span class="training-count">
                    {{ employee.trainings ? employee.trainings.length : 0 }} pelatihan
                  </span>
                </td>
                <td>
                  <div class="documents-list">
                    <span v-if="employee.documents && employee.documents.length" class="doc-count">
                      {{ employee.documents.length }} dokumen
                      <div class="doc-tooltip">
                        <a
                          v-for="doc in employee.documents"
                          :key="doc.id"
                          :href="`${apiUrl}/storage/${doc.file_path}`"
                          target="_blank"
                          class="doc-link"
                        >
                          <i class="fas fa-file-pdf"></i>
                          {{ doc.document_type }}
                        </a>
                      </div>
                    </span>
                    <span v-else class="no-docs">Tidak ada</span>
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon view" @click="viewEmployee(employee.id)" title="Lihat Detail">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit" @click="editEmployee(employee.id)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" @click="deleteEmployee(employee.id)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-state">
          <i class="fas fa-users"></i>
          <h3>Belum ada data karyawan</h3>
          <p>Mulai dengan menambahkan karyawan pertama Anda</p>
          <router-link to="/add-employee" class="btn-primary">
            Tambah Karyawan
          </router-link>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="pagination-info">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            <i class="fas fa-chevron-right"></i>
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
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      employees: [],
      searchQuery: '',
      filterDepartment: '',
      currentPage: 1,
      itemsPerPage: 10,
      apiUrl: 'http://localhost:8000',
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
    };
  },
  computed: {
    activeEmployees() {
      return this.employees.length; // Semua karyawan dianggap aktif
    },
    newEmployeesThisMonth() {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return this.employees.filter(emp => {
        const startDate = new Date(emp.tanggal_mulai_kerja);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      }).length;
    },
    totalTrainings() {
      return this.employees.reduce((total, emp) => {
        return total + (emp.trainings ? emp.trainings.length : 0);
      }, 0);
    },
    totalSalary() {
      return this.employees.reduce((total, emp) => {
        return total + this.calculateTotalSalary(emp);
      }, 0);
    },
    filteredEmployees() {
      let filtered = this.employees;
      
      if (this.searchQuery) {
        filtered = filtered.filter(emp => 
          emp.nama_lengkap.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          emp.nik.includes(this.searchQuery) ||
          emp.jabatan_saat_ini.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      if (this.filterDepartment) {
        filtered = filtered.filter(emp => 
          emp.jabatan_saat_ini.toLowerCase().includes(this.filterDepartment.toLowerCase())
        );
      }
      
      return filtered;
    },
    paginatedEmployees() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredEmployees.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const response = await axios.get(`${this.apiUrl}/api/employees`);
        this.employees = response.data;
      } catch (error) {
        console.error('Error fetching employees:', error);
        this.showNotificationMessage('Gagal mengambil data karyawan', 'error');
      }
    },
    calculateTotalSalary(employee) {
      const gaji = parseFloat(employee.gaji_pokok) || 0;
      const tunjangan = parseFloat(employee.tunjangan) || 0;
      const bonus = parseFloat(employee.bonus) || 0;
      return gaji + tunjangan + bonus;
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount);
    },
    viewEmployee(id) {
      this.$router.push(`/employee/${id}`);
    },
    editEmployee(id) {
      this.$router.push(`/edit-employee/${id}`);
    },
    async deleteEmployee(id) {
      if (confirm('Apakah Anda yakin ingin menghapus karyawan ini beserta semua data terkait?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${id}`);
          this.fetchEmployees();
          this.showNotificationMessage('Karyawan berhasil dihapus', 'success');
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus karyawan', 'error');
        }
      }
    },
    showNotificationMessage(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }
  },
};
</script>
