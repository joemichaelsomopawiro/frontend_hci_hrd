<template>
  <div class="edit-employee-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-btn" title="Kembali">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="page-title">
          <h1>Edit Karyawan</h1>
          <p>Hope Channel Indonesia - Enterprise HR System</p>
        </div>
        <div class="header-actions" v-if="employee">
          <button @click="viewEmployee" class="btn-secondary">
            <i class="fas fa-eye"></i>
            Lihat Detail
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

    <!-- Edit Form -->
    <div v-else-if="employee" class="form-container">
      <form @submit.prevent="submitForm" class="employee-form">
        
        <!-- Employee Summary -->
        <div class="employee-summary">
          <div class="summary-content">
            <div class="employee-avatar">
              <i class="fas fa-user-edit"></i>
            </div>
            <div class="employee-info">
              <h2>{{ form.nama_lengkap || 'Nama tidak tersedia' }}</h2>
              <p class="job-title">{{ form.jabatan_saat_ini || 'Jabatan tidak tersedia' }}</p>
              <div class="employee-meta">
                <span class="meta-item" v-if="form.nik">
                  <i class="fas fa-id-card"></i>
                  NIK: {{ form.nik }}
                </span>
                <span class="meta-item" v-if="form.nip">
                  <i class="fas fa-id-badge"></i>
                  NIP: {{ form.nip }}
                </span>
              </div>
            </div>
            <div class="edit-status">
              <h3>Mode Edit</h3>
              <p class="status-text">Mengubah data karyawan</p>
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="form-section">
          <div class="section-header">
            <h3><i class="fas fa-user"></i> Informasi Personal</h3>
          </div>
          <div class="form-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Lengkap *</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input 
                    v-model="form.nama_lengkap" 
                    type="text" 
                    required 
                    class="form-input" 
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>NIK *</label>
                <div class="input-wrapper">
                  <i class="fas fa-id-card input-icon"></i>
                  <input 
                    v-model="form.nik" 
                    type="text" 
                    maxlength="16" 
                    required 
                    class="form-input" 
                    placeholder="16 digit NIK"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>NIP</label>
                <div class="input-wrapper">
                  <i class="fas fa-id-badge input-icon"></i>
                  <input 
                    v-model="form.nip" 
                    type="text" 
                    maxlength="20" 
                    class="form-input" 
                    placeholder="Nomor Induk Pegawai"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Tanggal Lahir *</label>
                <div class="input-wrapper">
                  <i class="fas fa-calendar input-icon"></i>
                  <input 
                    v-model="form.tanggal_lahir" 
                    type="date" 
                    required 
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Jenis Kelamin *</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input 
                    v-model="form.jenis_kelamin" 
                    type="text" 
                    required 
                    class="form-input" 
                    placeholder="Laki-laki / Perempuan"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Status Pernikahan *</label>
                <div class="select-wrapper">
                  <i class="fas fa-heart input-icon"></i>
                  <select v-model="form.status_pernikahan" required class="form-select">
                    <option value="">Pilih Status</option>
                    <option value="Belum Menikah">Belum Menikah</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai">Cerai</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group full-width">
                <label>Alamat *</label>
                <div class="input-wrapper">
                  <i class="fas fa-map-marker-alt input-icon"></i>
                  <textarea 
                    v-model="form.alamat" 
                    required 
                    class="form-textarea" 
                    rows="3"
                    placeholder="Alamat lengkap"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Employment Information -->
        <div class="form-section">
          <div class="section-header">
            <h3><i class="fas fa-briefcase"></i> Informasi Pekerjaan</h3>
          </div>
          <div class="form-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Jabatan Saat Ini *</label>
                <div class="input-wrapper">
                  <i class="fas fa-user-tie input-icon"></i>
                  <input 
                    v-model="form.jabatan_saat_ini" 
                    type="text" 
                    required 
                    class="form-input"
                    placeholder="Posisi/Jabatan"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Tanggal Mulai Kerja *</label>
                <div class="input-wrapper">
                  <i class="fas fa-calendar-check input-icon"></i>
                  <input 
                    v-model="form.tanggal_mulai_kerja" 
                    type="date" 
                    required 
                    class="form-input"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Tingkat Pendidikan *</label>
                <div class="select-wrapper">
                  <i class="fas fa-graduation-cap input-icon"></i>
                  <select v-model="form.tingkat_pendidikan" required class="form-select">
                    <option value="">Pilih Pendidikan</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">Diploma 3</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                    <option value="S3">Doktor (S3)</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Gaji Pokok *</label>
                <div class="currency-input-wrapper">
                  <span class="currency-label">Rp</span>
                  <input 
                    v-model="form.gaji_pokok" 
                    type="number" 
                    required 
                    class="form-input currency-input"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Tunjangan</label>
                <div class="currency-input-wrapper">
                  <span class="currency-label">Rp</span>
                  <input 
                    v-model="form.tunjangan" 
                    type="number" 
                    class="form-input currency-input"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Bonus</label>
                <div class="currency-input-wrapper">
                  <span class="currency-label">Rp</span>
                  <input 
                    v-model="form.bonus" 
                    type="number" 
                    class="form-input currency-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <!-- Salary Summary Card -->
              <div class="form-group full-width">
                <div class="salary-summary">
                  <h4>Ringkasan Gaji</h4>
                  <div class="salary-breakdown">
                    <div class="salary-item">
                      <span>Gaji Pokok:</span>
                      <span>Rp {{ formatCurrency(form.gaji_pokok || 0) }}</span>
                    </div>
                    <div class="salary-item">
                      <span>Tunjangan:</span>
                      <span>Rp {{ formatCurrency(form.tunjangan || 0) }}</span>
                    </div>
                    <div class="salary-item">
                      <span>Bonus:</span>
                      <span>Rp {{ formatCurrency(form.bonus || 0) }}</span>
                    </div>
                    <div class="salary-total">
                      <span>Total:</span>
                      <span>Rp {{ formatCurrency(calculateTotal()) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label>Department *</label>
                <div class="select-wrapper">
                  <i class="fas fa-building input-icon"></i>
                  <select v-model="form.department" required class="form-select">
                    <option value="">Pilih Department</option>
                    <option value="HR">Human Resources</option>
                    <option value="Program">Program</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">Information Technology</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Role *</label>
                <div class="select-wrapper">
                  <i class="fas fa-user-tag input-icon"></i>
                  <select v-model="form.role" required class="form-select" @change="updateManagerOptions">
                    <option value="">Pilih Role</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Program Manager">Program Manager</option>
                    <option value="Distribution Manager">Distribution Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group" v-if="form.role === 'Employee'">
                <label>Manager *</label>
                <div class="select-wrapper">
                  <i class="fas fa-user-tie input-icon"></i>
                  <select v-model="form.manager_id" required class="form-select">
                    <option value="">Pilih Manager</option>
                    <option v-for="manager in availableManagers" :key="manager.id" :value="manager.id">
                      {{ manager.nama_lengkap }} ({{ manager.role }})
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="form-group" v-if="form.role === 'Employee'">
                <label>Manager Type *</label>
                <div class="select-wrapper">
                  <i class="fas fa-sitemap input-icon"></i>
                  <select v-model="form.manager_type" required class="form-select">
                    <option value="">Pilih Manager Type</option>
                    <option value="direct">Direct Manager</option>
                    <option value="hr">HR Manager</option>
                    <option value="program">Program Manager</option>
                    <option value="distribution">Distribution Manager</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="form-section">
          <div class="section-header">
            <h3><i class="fas fa-file-alt"></i> Informasi Tambahan</h3>
          </div>
          <div class="form-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Nomor BPJS Kesehatan</label>
                <div class="input-wrapper">
                  <i class="fas fa-medkit input-icon"></i>
                  <input 
                    v-model="form.nomor_bpjs_kesehatan" 
                    type="text" 
                    maxlength="20" 
                    class="form-input"
                    placeholder="Nomor BPJS Kesehatan"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Nomor BPJS Ketenagakerjaan</label>
                <div class="input-wrapper">
                  <i class="fas fa-hard-hat input-icon"></i>
                  <input 
                    v-model="form.nomor_bpjs_ketenagakerjaan" 
                    type="text" 
                    maxlength="20" 
                    class="form-input"
                    placeholder="Nomor BPJS Ketenagakerjaan"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>NPWP</label>
                <div class="input-wrapper">
                  <i class="fas fa-receipt input-icon"></i>
                  <input 
                    v-model="form.npwp" 
                    type="text" 
                    maxlength="20" 
                    class="form-input"
                    placeholder="Nomor NPWP"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Nomor Kontrak</label>
                <div class="input-wrapper">
                  <i class="fas fa-file-contract input-icon"></i>
                  <input 
                    v-model="form.nomor_kontrak" 
                    type="text" 
                    maxlength="50" 
                    class="form-input"
                    placeholder="Nomor Kontrak Kerja"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>Tanggal Kontrak Berakhir</label>
                <div class="input-wrapper">
                  <i class="fas fa-calendar-times input-icon"></i>
                  <input 
                    v-model="form.tanggal_kontrak_berakhir" 
                    type="date" 
                    class="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="$router.go(-1)" class="btn-secondary">
            <i class="fas fa-times"></i>
            Batal
          </button>
          <button type="button" @click="resetForm" class="btn-warning">
            <i class="fas fa-undo"></i>
            Reset
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            <i class="fas fa-save"></i>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
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

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Menyimpan perubahan...</p>
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
  name: 'EditEmployee',
  data() {
    return {
      employee: null,
      form: {
        nama_lengkap: '',
        nik: '',
        nip: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        alamat: '',
        status_pernikahan: '',
        jabatan_saat_ini: '',
        tanggal_mulai_kerja: '',
        tingkat_pendidikan: '',
        gaji_pokok: '',
        tunjangan: '',
        bonus: '',
        nomor_bpjs_kesehatan: '',
        nomor_bpjs_ketenagakerjaan: '',
        npwp: '',
        nomor_kontrak: '',
        tanggal_kontrak_berakhir: '',
        department: '',
        role: '',
        manager_id: '',
        manager_type: '',
      },
      originalForm: {},
      loading: true,
      isSubmitting: false,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      apiUrl: 'http://localhost:8000',
      availableManagers: [],
      allEmployees: [],
    };
  },
  mounted() {
    this.fetchEmployee();
    this.loadManagers();
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
          this.populateForm();
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
    
    populateForm() {
      if (!this.employee) return;
      
      // Populate form with employee data
      Object.keys(this.form).forEach(key => {
        if (this.employee[key] !== undefined) {
          this.form[key] = this.employee[key];
        }
      });
      
      // Format dates for input fields
      if (this.form.tanggal_lahir) {
        this.form.tanggal_lahir = this.formatDateForInput(this.form.tanggal_lahir);
      }
      if (this.form.tanggal_mulai_kerja) {
        this.form.tanggal_mulai_kerja = this.formatDateForInput(this.form.tanggal_mulai_kerja);
      }
      if (this.form.tanggal_kontrak_berakhir) {
        this.form.tanggal_kontrak_berakhir = this.formatDateForInput(this.form.tanggal_kontrak_berakhir);
      }
      
      // Store original form data for reset functionality
      this.originalForm = { ...this.form };
    },
    
    formatDateForInput(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount || 0);
    },
    
    calculateTotal() {
      const gaji = parseFloat(this.form.gaji_pokok) || 0;
      const tunjangan = parseFloat(this.form.tunjangan) || 0;
      const bonus = parseFloat(this.form.bonus) || 0;
      return gaji + tunjangan + bonus;
    },
    
    validateForm() {
      const requiredFields = [
        'nama_lengkap', 'nik', 'tanggal_lahir', 'jenis_kelamin', 
        'alamat', 'status_pernikahan', 'jabatan_saat_ini', 
        'tanggal_mulai_kerja', 'tingkat_pendidikan', 'gaji_pokok',
        'department', 'role'
      ];
      
      // Add manager_id and manager_type validation for employees
      if (this.form.role === 'Employee') {
        requiredFields.push('manager_id', 'manager_type');
      }
      
      for (let field of requiredFields) {
        if (!this.form[field] || this.form[field].toString().trim() === '') {
          this.showNotificationMessage(`Field ${field} harus diisi`, 'error');
          return false;
        }
      }
      
      // Validasi NIK (16 digit)
      if (this.form.nik.length !== 16) {
        this.showNotificationMessage('NIK harus 16 digit', 'error');
        return false;
      }
      
      // Validasi gaji (harus angka positif)
      if (isNaN(this.form.gaji_pokok) || this.form.gaji_pokok <= 0) {
        this.showNotificationMessage('Gaji pokok harus berupa angka positif', 'error');
        return false;
      }
      
      return true;
    },
    
    async submitForm() {
      if (!this.validateForm()) return;
      
      this.isSubmitting = true;
      try {
        const response = await axios.put(`${this.apiUrl}/api/employees/${this.employee.id}`, this.form, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        this.showNotificationMessage('Data karyawan berhasil diperbarui!', 'success');
        setTimeout(() => {
          this.$router.push(`/employee/${this.employee.id}`);
        }, 2000);
      } catch (error) {
        console.error('Error updating employee:', error);
        
        let errorMessage = 'Gagal memperbarui data karyawan.';
        
        if (error.response?.status === 422) {
          errorMessage = 'Data tidak valid. Periksa form dan coba lagi.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Karyawan tidak ditemukan.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showNotificationMessage(errorMessage, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    resetForm() {
      if (confirm('Apakah Anda yakin ingin mereset form ke data asli?')) {
        this.form = { ...this.originalForm };
        this.showNotificationMessage('Form berhasil direset', 'success');
      }
    },
    
    viewEmployee() {
      this.$router.push(`/employee/${this.employee.id}`);
    },
    
    showNotificationMessage(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    },

    async loadManagers() {
      try {
        const response = await fetch(`${this.apiUrl}/api/employees`);
        if (response.ok) {
          const data = await response.json();
          this.allEmployees = data.data || data;
          this.updateManagerOptions();
        }
      } catch (error) {
        console.error('Error loading managers:', error);
      }
    },

    updateManagerOptions() {
      // Filter managers based on role
      this.availableManagers = this.allEmployees.filter(employee => {
        return ['HR Manager', 'Program Manager', 'Distribution Manager'].includes(employee.role);
      });
    },
  },
};
</script>

<style scoped>
/* Edit Employee Specific Styles */
.edit-employee-container {
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

.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.employee-form {
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* Employee Summary for Edit */
.employee-summary {
  background: linear-gradient(135deg, var(--warning-color) 0%, #d97706 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 2rem;
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

.edit-status {
  text-align: right;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.edit-status h3 {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-text {
  font-size: 1rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Form Sections */
.form-section {
  border-bottom: 1px solid var(--gray-200);
}

.form-section:last-of-type {
  border-bottom: none;
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
  background: var(--warning-color);
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
  color: var(--warning-color);
  font-size: 1.25rem;
}

.form-content {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 1rem;
  color: var(--gray-400);
  z-index: 1;
}

.input-wrapper.textarea-wrapper {
  align-items: flex-start;
}

.input-wrapper.textarea-wrapper .input-icon {
  top: 1.2rem;
}

.input-prefix {
  position: absolute;
  left: 2.5rem;
  color: var(--gray-500);
  font-weight: 500;
  z-index: 2;
  pointer-events: none;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--warning-color);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
}

.form-input.currency {
  padding-left: 3rem;
}

.form-input[type="number"] {
  padding-left: 4rem;
}

.input-wrapper .form-input {
  padding-left: 3rem;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper .input-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray-400);
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
}

.select-wrapper .form-select {
  padding-left: 3rem;
  width: 100%;
}



.salary-summary {
  background: linear-gradient(135deg, var(--warning-color) 0%, #d97706 100%);
  color: white;
  padding: 1.25rem;
  border-radius: 12px;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.salary-summary::before {
  content: '';
  position: absolute;
  top: -10px;
  right: -10px;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}

.salary-summary h4 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.salary-summary h4::before {
  content: '💰';
  font-size: 1.2rem;
}

.salary-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.salary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.95rem;
}

.salary-item span:first-child {
  font-weight: 500;
  opacity: 0.9;
}

.salary-item span:last-child {
  font-weight: 600;
  font-size: 1rem;
  text-align: right;
  min-width: 120px;
}

.salary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0 0.5rem 0;
  font-weight: 700;
  font-size: 1.2rem;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
  margin-top: 0.5rem;
  position: relative;
  z-index: 2;
}

.salary-total span:last-child {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  min-width: 140px;
  text-align: center;
}

/* Currency Input Styling */
.currency-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-label {
  background: var(--gray-100);
  color: var(--gray-700);
  padding: 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 50px;
  text-align: center;
}

.currency-input {
  flex: 1;
  padding: 1rem !important;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 2rem;
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.btn-secondary:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.btn-secondary:hover i {
  color: var(--text-primary) !important;
}

.btn-warning {
  background: linear-gradient(135deg, var(--warning-color) 0%, #d97706 100%);
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

.btn-warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-icon {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.btn-icon:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-icon.view:hover {
  background: var(--info-color);
  border-color: var(--info-color);
}

.btn-icon.edit:hover {
  background: var(--warning-color);
  border-color: var(--warning-color);
}

.btn-icon.delete:hover {
  background: var(--error-color);
  border-color: var(--error-color);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay .loading-spinner {
  background: var(--bg-secondary);
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: var(--shadow-xl);
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
  
  .edit-status {
    text-align: center;
  }
  
  .form-container {
    padding: 1rem;
  }
  
  .form-content {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .input-prefix {
    left: 2.25rem;
  }
  
  .form-input[type="number"] {
    padding-left: 3.5rem;
  }
  

  
  .form-actions {
    flex-direction: column;
  }
  
  .notification {
    right: 1rem;
    left: 1rem;
  }
  
  .salary-summary {
    padding: 1rem;
    margin-top: 0.75rem;
  }
  
  .salary-summary h4 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .salary-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
  }
  
  .salary-item span:last-child {
    min-width: 100px;
    font-size: 0.95rem;
  }
  
  .salary-total {
    font-size: 1.1rem;
    padding: 0.75rem 0 0.375rem 0;
  }
  
  .salary-total span:last-child {
    min-width: 120px;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
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
  
  .form-content {
    padding: 1rem;
  }
  
  .form-actions {
    padding: 1rem;
  }
  
  .salary-summary {
    padding: 0.875rem;
  }
  
  .salary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }
  
  .salary-item span:last-child {
    min-width: auto;
    font-size: 1rem;
    font-weight: 700;
  }
  
  .salary-total {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .salary-total span:last-child {
    width: 100%;
    min-width: auto;
  }
}
</style>
