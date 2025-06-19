<template>
  <div class="view-employee-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-btn" title="Kembali">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="page-title">
          <h1>Detail Karyawan</h1>
          <p>Hope Channel Indonesia - Enterprise HR System</p>
        </div>
        <div class="header-actions" v-if="employee">
          <button @click="editEmployee" class="btn-primary">
            <i class="fas fa-edit"></i>
            Edit
          </button>
          <button @click="deleteEmployee" class="btn-danger">
            <i class="fas fa-trash"></i>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Memuat data karyawan...</p>
      </div>
    </div>

    <!-- Employee Details -->
    <div v-else-if="employee" class="employee-details">
      <div class="details-container">
        
        <!-- Employee Summary Card -->
        <div class="employee-summary">
          <div class="summary-content">
            <div class="employee-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="employee-info">
              <h2>{{ employee.nama_lengkap || 'Nama tidak tersedia' }}</h2>
              <p class="job-title">{{ employee.jabatan_saat_ini || 'Jabatan tidak tersedia' }}</p>
              <div class="employee-meta">
                <span class="meta-item" v-if="employee.nik">
                  <i class="fas fa-id-card"></i>
                  NIK: {{ employee.nik }}
                </span>
                <span class="meta-item" v-if="employee.nip">
                  <i class="fas fa-id-badge"></i>
                  NIP: {{ employee.nip }}
                </span>
                <span class="meta-item" v-if="employee.tanggal_mulai_kerja">
                  <i class="fas fa-calendar"></i>
                  Bergabung: {{ formatDate(employee.tanggal_mulai_kerja) }}
                </span>
              </div>
            </div>
            <div class="salary-summary">
              <h3>Total Gaji</h3>
              <p class="salary-amount">Rp {{ formatCurrency(calculateTotalSalary()) }}</p>
              <small>Per bulan</small>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="detail-section">
          <div class="section-header">
            <h3><i class="fas fa-user"></i> Informasi Personal</h3>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Nama Lengkap</label>
              <span>{{ employee.nama_lengkap || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>NIK</label>
              <span>{{ employee.nik || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>NIP</label>
              <span>{{ employee.nip || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Tanggal Lahir</label>
              <span>{{ employee.tanggal_lahir ? `${formatDate(employee.tanggal_lahir)} (${calculateAge()} tahun)` : '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Jenis Kelamin</label>
              <span v-if="employee.jenis_kelamin">
                <i :class="employee.jenis_kelamin === 'Laki-laki' ? 'fas fa-mars text-blue-500' : 'fas fa-venus text-pink-500'"></i>
                {{ employee.jenis_kelamin }}
              </span>
              <span v-else>-</span>
            </div>
            <div class="detail-item">
              <label>Status Pernikahan</label>
              <span v-if="employee.status_pernikahan">
                <i class="fas fa-heart"></i>
                {{ employee.status_pernikahan }}
              </span>
              <span v-else>-</span>
            </div>
            <div class="detail-item full-width">
              <label>Alamat</label>
              <span>{{ employee.alamat || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Employment Information -->
        <div class="detail-section">
          <div class="section-header">
            <h3><i class="fas fa-briefcase"></i> Informasi Pekerjaan</h3>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Jabatan Saat Ini</label>
              <span class="job-badge" v-if="employee.jabatan_saat_ini">{{ employee.jabatan_saat_ini }}</span>
              <span v-else>-</span>
            </div>
            <div class="detail-item">
              <label>Tanggal Mulai Kerja</label>
              <span v-if="employee.tanggal_mulai_kerja">{{ formatDate(employee.tanggal_mulai_kerja) }} ({{ calculateWorkDuration() }})</span>
              <span v-else>-</span>
            </div>
            <div class="detail-item">
              <label>Tingkat Pendidikan</label>
              <span v-if="employee.tingkat_pendidikan">
                <i class="fas fa-graduation-cap"></i>
                {{ employee.tingkat_pendidikan }}
              </span>
              <span v-else>-</span>
            </div>
            <div class="detail-item">
              <label>Gaji Pokok</label>
              <span class="salary-item">Rp {{ formatCurrency(employee.gaji_pokok || 0) }}</span>
            </div>
            <div class="detail-item">
              <label>Tunjangan</label>
              <span class="salary-item">Rp {{ formatCurrency(employee.tunjangan || 0) }}</span>
            </div>
            <div class="detail-item">
              <label>Bonus</label>
              <span class="salary-item">Rp {{ formatCurrency(employee.bonus || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="detail-section" v-if="employee.documents && employee.documents.length > 0">
          <div class="section-header">
            <h3><i class="fas fa-folder-open"></i> Dokumen ({{ employee.documents.length }})</h3>
          </div>
          <div class="documents-grid">
            <div 
              v-for="doc in employee.documents" 
              :key="doc.id"
              class="document-card"
            >
              <div class="document-icon">
                <i :class="getDocumentIcon(doc.file_path || '')"></i>
              </div>
              <div class="document-info">
                <h4>{{ doc.document_type || 'Dokumen' }}</h4>
                <small>{{ doc.file_path ? getFileExtension(doc.file_path).toUpperCase() : 'FILE' }}</small>
              </div>
              <div class="document-actions">
                <a 
                  v-if="doc.file_path"
                  :href="`${apiUrl}/storage/${doc.file_path}`"
                  target="_blank"
                  class="btn-view"
                  title="Lihat Dokumen"
                >
                  <i class="fas fa-eye"></i>
                </a>
                <button 
                  @click="deleteDocument(doc.id)"
                  class="btn-delete"
                  title="Hapus Dokumen"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Employment History -->
        <div class="detail-section" v-if="employee.employment_histories && employee.employment_histories.length > 0">
          <div class="section-header">
            <h3><i class="fas fa-history"></i> Riwayat Pekerjaan ({{ employee.employment_histories.length }})</h3>
          </div>
          <div class="timeline">
            <div 
              v-for="(history, index) in employee.employment_histories" 
              :key="history.id || index"
              class="timeline-item"
            >
              <div class="timeline-marker">{{ index + 1 }}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4>{{ history.position || 'Posisi tidak tersedia' }}</h4>
                  <button 
                    @click="deleteEmploymentHistory(history.id)"
                    class="btn-delete-small"
                    title="Hapus Riwayat"
                    v-if="history.id"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <p class="company-name">{{ history.company_name || 'Perusahaan tidak tersedia' }}</p>
                <div class="timeline-period" v-if="history.start_date">
                  <i class="fas fa-calendar"></i>
                  {{ formatDate(history.start_date) }} - 
                  {{ history.end_date ? formatDate(history.end_date) : 'Sekarang' }}
                  <span class="duration">({{ calculateDuration(history.start_date, history.end_date) }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Training History -->
        <div class="detail-section" v-if="employee.trainings && employee.trainings.length > 0">
          <div class="section-header">
            <h3><i class="fas fa-graduation-cap"></i> Riwayat Pelatihan ({{ employee.trainings.length }})</h3>
          </div>
          <div class="training-grid">
            <div 
              v-for="training in employee.trainings" 
              :key="training.id || Math.random()"
              class="training-card"
            >
              <div class="training-header">
                <h4>{{ training.training_name || 'Pelatihan tidak tersedia' }}</h4>
                <button 
                  @click="deleteTraining(training.id)"
                  class="btn-delete-small"
                  title="Hapus Pelatihan"
                  v-if="training.id"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <p class="training-institution" v-if="training.institution">
                <i class="fas fa-university"></i>
                {{ training.institution }}
              </p>
              <div class="training-details">
                <span class="training-date" v-if="training.completion_date">
                  <i class="fas fa-calendar-check"></i>
                  {{ formatDate(training.completion_date) }}
                </span>
                <span class="certificate-number" v-if="training.certificate_number">
                  <i class="fas fa-certificate"></i>
                  {{ training.certificate_number }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Benefits -->
        <div class="detail-section" v-if="employee.benefits && employee.benefits.length > 0">
          <div class="section-header">
            <h3><i class="fas fa-gift"></i> Tunjangan & Benefit ({{ employee.benefits.length }})</h3>
          </div>
          <div class="benefits-grid">
            <div 
              v-for="benefit in employee.benefits" 
              :key="benefit.id || Math.random()"
              class="benefit-card"
            >
              <div class="benefit-header">
                <h4>{{ benefit.benefit_type || 'Benefit tidak tersedia' }}</h4>
                <button 
                  @click="deleteBenefit(benefit.id)"
                  class="btn-delete-small"
                  title="Hapus Benefit"
                  v-if="benefit.id"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="benefit-amount">
                Rp {{ formatCurrency(benefit.amount || 0) }}
              </div>
              <div class="benefit-date" v-if="benefit.start_date">
                <i class="fas fa-calendar-alt"></i>
                Mulai: {{ formatDate(benefit.start_date) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Data tidak dapat dimuat</h3>
      <p>Terjadi kesalahan saat memuat data karyawan</p>
      <button @click="fetchEmployee" class="btn-primary">
        <i class="fas fa-refresh"></i>
        Coba Lagi
      </button>
      <button @click="$router.push('/')" class="btn-secondary">
        Kembali ke Dashboard
      </button>
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
  name: 'ViewEmployee',
  data() {
    return {
      employee: null,
      loading: true,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      apiUrl: 'http://localhost:8000',
    };
  },
  mounted() {
    this.fetchEmployee();
  },
  methods: {
    async fetchEmployee() {
      this.loading = true;
      try {
        const id = this.$route.params.id;
        
        if (!id || isNaN(id)) {
          throw new Error('Invalid employee ID');
        }
        
        console.log('Fetching employee with ID:', id);
        
        const response = await axios.get(`${this.apiUrl}/api/employees/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        if (response.data) {
          this.employee = response.data;
          console.log('Employee data loaded successfully:', this.employee);
        } else {
          throw new Error('No data received');
        }
        
      } catch (error) {
        console.error('Error fetching employee:', error);
        
        if (error.response?.status === 404) {
          this.showNotificationMessage('Karyawan tidak ditemukan', 'error');
        } else if (error.response?.status === 500) {
          this.showNotificationMessage('Server error. Silakan coba lagi.', 'error');
        } else {
          this.showNotificationMessage('Gagal memuat data karyawan', 'error');
        }
        
        this.employee = null;
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount || 0);
    },
    
    calculateAge() {
      if (!this.employee?.tanggal_lahir) return '-';
      try {
        const birthDate = new Date(this.employee.tanggal_lahir);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      } catch (error) {
        return '-';
      }
    },
    
    calculateWorkDuration() {
      if (!this.employee?.tanggal_mulai_kerja) return '-';
      try {
        const startDate = new Date(this.employee.tanggal_mulai_kerja);
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        
        if (years > 0) {
          return `${years} tahun ${months} bulan`;
        } else if (months > 0) {
          return `${months} bulan`;
        } else {
          return `${diffDays} hari`;
        }
      } catch (error) {
        return '-';
      }
    },
    
    calculateDuration(startDate, endDate) {
      if (!startDate) return '-';
      try {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        
        if (years > 0) {
          return `${years} tahun ${months} bulan`;
        } else if (months > 0) {
          return `${months} bulan`;
        } else {
          return `${diffDays} hari`;
        }
      } catch (error) {
        return '-';
      }
    },
    
    calculateTotalSalary() {
      if (!this.employee) return 0;
      try {
        const gaji = parseFloat(this.employee.gaji_pokok) || 0;
        const tunjangan = parseFloat(this.employee.tunjangan) || 0;
        const bonus = parseFloat(this.employee.bonus) || 0;
        return gaji + tunjangan + bonus;
      } catch (error) {
        return 0;
      }
    },
    
    getDocumentIcon(filePath) {
      if (!filePath) return 'fas fa-file text-gray-500';
      const extension = this.getFileExtension(filePath);
      switch (extension) {
        case 'pdf':
          return 'fas fa-file-pdf text-red-500';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'fas fa-file-image text-blue-500';
        default:
          return 'fas fa-file text-gray-500';
      }
    },
    
    getFileExtension(filePath) {
      if (!filePath || typeof filePath !== 'string') return '';
      try {
        return filePath.split('.').pop().toLowerCase();
      } catch (error) {
        return '';
      }
    },
    
    editEmployee() {
      this.$router.push(`/edit-employee/${this.employee.id}`);
    },
    
    async deleteEmployee() {
      if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${this.employee.id}`);
          this.showNotificationMessage('Karyawan berhasil dihapus', 'success');
          setTimeout(() => {
            this.$router.push('/');
          }, 2000);
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus karyawan', 'error');
        }
      }
    },
    
    async deleteDocument(documentId) {
      if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${this.employee.id}/documents/${documentId}`);
          this.showNotificationMessage('Dokumen berhasil dihapus', 'success');
          this.fetchEmployee();
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus dokumen', 'error');
        }
      }
    },
    
    async deleteEmploymentHistory(historyId) {
      if (confirm('Apakah Anda yakin ingin menghapus riwayat pekerjaan ini?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${this.employee.id}/employment-histories/${historyId}`);
          this.showNotificationMessage('Riwayat pekerjaan berhasil dihapus', 'success');
          this.fetchEmployee();
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus riwayat pekerjaan', 'error');
        }
      }
    },
    
    async deleteTraining(trainingId) {
      if (confirm('Apakah Anda yakin ingin menghapus data pelatihan ini?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${this.employee.id}/trainings/${trainingId}`);
          this.showNotificationMessage('Data pelatihan berhasil dihapus', 'success');
          this.fetchEmployee();
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus data pelatihan', 'error');
        }
      }
    },
    
    async deleteBenefit(benefitId) {
      if (confirm('Apakah Anda yakin ingin menghapus data benefit ini?')) {
        try {
          await axios.delete(`${this.apiUrl}/api/employees/${this.employee.id}/benefits/${benefitId}`);
          this.showNotificationMessage('Data benefit berhasil dihapus', 'success');
          this.fetchEmployee();
        } catch (error) {
          this.showNotificationMessage('Gagal menghapus data benefit', 'error');
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


<style scoped>
/* ViewEmployee Specific Styles */
.view-employee-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
}

.page-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--gray-200);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.loading-container, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state i {
  font-size: 3rem;
  color: var(--gray-400);
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.5rem;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--gray-500);
  margin-bottom: 2rem;
}

.details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Employee Summary Card */
.employee-summary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.employee-summary::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.employee-avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.employee-info {
  flex: 1;
}

.employee-info h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.job-title {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 1rem;
  font-weight: 500;
}

.employee-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.salary-summary {
  text-align: right;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.salary-summary h3 {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.salary-amount {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Detail Sections */
.detail-section {
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.detail-section:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.section-header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  position: relative;
}

.section-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-color);
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h3 i {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.detail-item:hover {
  background: var(--gray-100);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: var(--gray-900);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.job-badge {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
  box-shadow: var(--shadow-sm);
}

.salary-item {
  font-weight: 700;
  color: var(--success-color);
  font-size: 1.125rem;
}

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.document-card {
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.document-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(30, 64, 175, 0.1), transparent);
  transition: left 0.5s;
}

.document-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.document-card:hover::before {
  left: 100%;
}

.document-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
}

.document-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.document-info small {
  color: var(--gray-500);
  font-size: 0.75rem;
  font-weight: 500;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-delete, .btn-delete-small {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-view {
  background: linear-gradient(135deg, var(--info-color) 0%, #0891b2 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-view:hover {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  text-decoration: none;
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-delete, .btn-delete-small {
  background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-delete:hover, .btn-delete-small:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Timeline Styles */
.timeline {
  padding: 1.5rem;
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 20px;
  top: 50px;
  bottom: -32px;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary-color), var(--gray-200));
}

.timeline-marker {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: var(--shadow);
  border: 3px solid white;
}

.timeline-content {
  flex: 1;
  background: var(--gray-50);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.timeline-content:hover {
  background: var(--bg-secondary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.timeline-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
}

.company-name {
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.timeline-period {
  color: var(--gray-500);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
}

.duration {
  color: var(--primary-color);
  font-weight: 600;
  margin-left: 0.5rem;
}

/* Training and Benefits Grid */
.training-grid, .benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.training-card, .benefit-card {
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.training-card::before, .benefit-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent);
  transition: left 0.5s;
}

.training-card:hover, .benefit-card:hover {
  background: var(--bg-secondary);
  border-color: var(--warning-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.training-card:hover::before, .benefit-card:hover::before {
  left: 100%;
}

.training-header, .benefit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.training-header h4, .benefit-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
}

.training-institution {
  color: var(--gray-600);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.training-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.training-date, .certificate-number {
  color: var(--gray-500);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
}

.benefit-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--success-color);
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.benefit-date {
  color: var(--gray-500);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--gray-200);
}

/* Button Styles */
.btn-danger {
  background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* Notification */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.notification.success {
  background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.notification.error {
  background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
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

/* Color Classes for Icons */
.text-blue-500 { color: #3b82f6; }
.text-pink-500 { color: #ec4899; }
.text-red-500 { color: #ef4444; }
.text-gray-500 { color: #6b7280; }

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .summary-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .employee-meta {
    justify-content: center;
  }
  
  .salary-summary {
    text-align: center;
  }
  
  .details-container {
    padding: 1rem;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .documents-grid, .training-grid, .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .timeline-item::after {
    display: none;
  }
  
  .notification {
    right: 1rem;
    left: 1rem;
  }
  
  .meta-item {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1rem;
  }
  
  .employee-summary {
    padding: 1.5rem;
  }
  
  .employee-info h2 {
    font-size: 1.5rem;
  }
  
  .salary-amount {
    font-size: 1.25rem;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .detail-grid {
    padding: 1rem;
    gap: 1rem;
  }
  
  .timeline {
    padding: 1rem;
  }
  
  .training-grid, .benefits-grid, .documents-grid {
    padding: 1rem;
  }
}
</style>
