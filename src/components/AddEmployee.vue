<template>
  <div class="add-employee-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-btn" title="Kembali">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="page-title">
          <h1>Tambah Karyawan Baru</h1>
          <p>Hope Channel Indonesia - Enterprise HR System</p>
        </div>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="submitForm" class="employee-form">
        <!-- Personal Information Section -->
        <div class="form-section">
          <div class="section-header">
            <h2><i class="fas fa-user"></i> Informasi Personal</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Nama Lengkap *</label>
              <input v-model="form.nama_lengkap" type="text" required class="form-input" />
            </div>
            
            <div class="form-group">
              <label>NIK *</label>
              <input v-model="form.nik" type="text" maxlength="16" required class="form-input" />
            </div>
            
            <div class="form-group">
              <label>NIP</label>
              <input v-model="form.nip" type="text" maxlength="20" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Tanggal Lahir *</label>
              <input v-model="form.tanggal_lahir" type="date" required class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Jenis Kelamin *</label>
              <select v-model="form.jenis_kelamin" required class="form-select">
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Status Pernikahan *</label>
              <select v-model="form.status_pernikahan" required class="form-select">
                <option value="">Pilih Status</option>
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
                <option value="Cerai">Cerai</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label>Alamat *</label>
              <textarea v-model="form.alamat" required class="form-textarea" rows="3"></textarea>
            </div>
          </div>
        </div>

        <!-- Employment Information Section -->
        <div class="form-section">
          <div class="section-header">
            <h2><i class="fas fa-briefcase"></i> Informasi Pekerjaan</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Jabatan Saat Ini *</label>
              <input v-model="form.jabatan_saat_ini" type="text" required class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Tanggal Mulai Kerja *</label>
              <input v-model="form.tanggal_mulai_kerja" type="date" required class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Tingkat Pendidikan *</label>
              <select v-model="form.tingkat_pendidikan" required class="form-select">
                <option value="">Pilih Pendidikan</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">Diploma 3</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Gaji Pokok *</label>
              <div class="input-group">
                <span class="input-prefix">Rp</span>
                <input v-model="form.gaji_pokok" type="number" required class="form-input" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Tunjangan</label>
              <div class="input-group">
                <span class="input-prefix">Rp</span>
                <input v-model="form.tunjangan" type="number" class="form-input" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Bonus</label>
              <div class="input-group">
                <span class="input-prefix">Rp</span>
                <input v-model="form.bonus" type="number" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="form-section">
          <div class="section-header">
            <h2><i class="fas fa-file-alt"></i> Informasi Tambahan</h2>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Nomor BPJS Kesehatan</label>
              <input v-model="form.nomor_bpjs_kesehatan" type="text" maxlength="20" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Nomor BPJS Ketenagakerjaan</label>
              <input v-model="form.nomor_bpjs_ketenagakerjaan" type="text" maxlength="20" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>NPWP</label>
              <input v-model="form.npwp" type="text" maxlength="20" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Nomor Kontrak</label>
              <input v-model="form.nomor_kontrak" type="text" maxlength="50" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Tanggal Kontrak Berakhir</label>
              <input v-model="form.tanggal_kontrak_berakhir" type="date" class="form-input" />
            </div>
            
            <div class="form-group full-width">
              <label>Dokumen Pendukung</label>
              <div class="file-upload-area" @drop="handleFileDrop" @dragover.prevent @dragenter.prevent>
                <div class="upload-content">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Drag & drop files atau <span class="upload-link">browse</span></p>
                  <small>PDF, JPG, PNG (Max 2MB per file)</small>
                </div>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload" class="file-input" />
              </div>
              
              <!-- File List -->
              <div v-if="documents.length" class="file-list">
                <div v-for="(file, index) in documents" :key="index" class="file-item">
                  <div class="file-info">
                    <i class="fas fa-file"></i>
                    <span>{{ file.name }}</span>
                    <small>{{ formatFileSize(file.size) }}</small>
                  </div>
                  <button type="button" @click="removeFile(index)" class="remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Employment History Section -->
        <div class="form-section">
          <div class="section-header">
            <h2><i class="fas fa-history"></i> Riwayat Pekerjaan</h2>
            <button type="button" @click="addEmploymentHistory" class="btn-secondary">
              <i class="fas fa-plus"></i> Tambah Riwayat
            </button>
          </div>
          <div v-for="(history, index) in employmentHistories" :key="index" class="history-item">
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Perusahaan</label>
                <input v-model="history.company_name" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Posisi</label>
                <input v-model="history.position" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Tanggal Mulai</label>
                <input v-model="history.start_date" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label>Tanggal Selesai</label>
                <input v-model="history.end_date" type="date" class="form-input" />
              </div>
            </div>
            <button type="button" @click="removeEmploymentHistory(index)" class="remove-btn">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>

        <!-- Training Section -->
        <div class="form-section">
          <div class="section-header">
            <h2><i class="fas fa-graduation-cap"></i> Pelatihan & Sertifikasi</h2>
            <button type="button" @click="addTraining" class="btn-secondary">
              <i class="fas fa-plus"></i> Tambah Pelatihan
            </button>
          </div>
          <div v-for="(training, index) in trainings" :key="index" class="history-item">
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Pelatihan</label>
                <input v-model="training.training_name" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Institusi</label>
                <input v-model="training.institution" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Tanggal Selesai</label>
                <input v-model="training.completion_date" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label>Nomor Sertifikat</label>
                <input v-model="training.certificate_number" type="text" class="form-input" />
              </div>
            </div>
            <button type="button" @click="removeTraining(index)" class="remove-btn">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>

        <!-- Benefits Section -->
        <div class="form-section">
          <div class="section-header">
            <h2><i class="fas fa-gift"></i> Tunjangan & Benefit</h2>
            <button type="button" @click="addBenefit" class="btn-secondary">
              <i class="fas fa-plus"></i> Tambah Benefit
            </button>
          </div>
          <div v-for="(benefit, index) in benefits" :key="index" class="history-item">
            <div class="form-grid">
              <div class="form-group">
                <label>Jenis Benefit</label>
                <input v-model="benefit.benefit_type" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>Jumlah</label>
                <div class="input-group">
                  <span class="input-prefix">Rp</span>
                  <input v-model="benefit.amount" type="number" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label>Tanggal Mulai</label>
                <input v-model="benefit.start_date" type="date" class="form-input" />
              </div>
            </div>
            <button type="button" @click="removeBenefit(index)" class="remove-btn">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="$router.go(-1)" class="btn-secondary">
            <i class="fas fa-times"></i>
            Batal
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            <i class="fas fa-save"></i>
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isSubmitting" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Menyimpan data karyawan...</p>
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
  name: 'AddEmployee',
  data() {
    return {
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
      },
      documents: [],
      employmentHistories: [],
      trainings: [],
      benefits: [],
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      isSubmitting: false,
      apiUrl: 'http://localhost:8000',
    };
  },
  methods: {
    validateForm() {
      const requiredFields = [
        'nama_lengkap', 'nik', 'tanggal_lahir', 'jenis_kelamin', 
        'alamat', 'status_pernikahan', 'jabatan_saat_ini', 
        'tanggal_mulai_kerja', 'tingkat_pendidikan', 'gaji_pokok'
      ];
      
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
    
    handleFileUpload(event) {
      const files = Array.from(event.target.files);
      this.documents = [...this.documents, ...files];
    },
    
    handleFileDrop(event) {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      this.documents = [...this.documents, ...files];
    },
    
    removeFile(index) {
      this.documents.splice(index, 1);
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    addEmploymentHistory() {
      this.employmentHistories.push({
        company_name: '',
        position: '',
        start_date: '',
        end_date: ''
      });
    },
    
    removeEmploymentHistory(index) {
      this.employmentHistories.splice(index, 1);
    },
    
    addTraining() {
      this.trainings.push({
        training_name: '',
        institution: '',
        completion_date: '',
        certificate_number: ''
      });
    },
    
    removeTraining(index) {
      this.trainings.splice(index, 1);
    },
    
    addBenefit() {
      this.benefits.push({
        benefit_type: '',
        amount: '',
        start_date: ''
      });
    },
    
    removeBenefit(index) {
      this.benefits.splice(index, 1);
    },
    
    debugRequest(formData) {
      console.log('=== DEBUG REQUEST ===');
      console.log('API URL:', `${this.apiUrl}/api/employees`);
      console.log('Form Data Entries:');
      
      const entries = [];
      for (let [key, value] of formData.entries()) {
        entries.push({ key, value: value instanceof File ? `File: ${value.name}` : value });
      }
      console.table(entries);
      
      console.log('Documents count:', this.documents.length);
      console.log('Employment histories count:', this.employmentHistories.length);
      console.log('Trainings count:', this.trainings.length);
      console.log('Benefits count:', this.benefits.length);
      console.log('=== END DEBUG ===');
    },
    
    async submitForm() {
      // Validasi form terlebih dahulu
      if (!this.validateForm()) {
        return;
      }
      
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        
        // Add basic form data dengan validasi
        Object.keys(this.form).forEach((key) => {
          if (this.form[key] !== null && this.form[key] !== undefined && this.form[key] !== '') {
            formData.append(key, this.form[key]);
          }
        });
        
        // Add documents dengan pengecekan yang lebih ketat
        if (this.documents && this.documents.length > 0) {
          this.documents.forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
          });
        }

        // Format employment histories dengan validasi
        if (this.employmentHistories && this.employmentHistories.length > 0) {
          this.employmentHistories.forEach((history, index) => {
            if (history.company_name && history.company_name.trim() !== '') {
              formData.append(`employment_histories[${index}][company_name]`, history.company_name);
              if (history.position) formData.append(`employment_histories[${index}][position]`, history.position);
              if (history.start_date) formData.append(`employment_histories[${index}][start_date]`, history.start_date);
              if (history.end_date) formData.append(`employment_histories[${index}][end_date]`, history.end_date);
            }
          });
        }

        // Format trainings dengan validasi
        if (this.trainings && this.trainings.length > 0) {
          this.trainings.forEach((training, index) => {
            if (training.training_name && training.training_name.trim() !== '') {
              formData.append(`trainings[${index}][training_name]`, training.training_name);
              if (training.institution) formData.append(`trainings[${index}][institution]`, training.institution);
              if (training.completion_date) formData.append(`trainings[${index}][completion_date]`, training.completion_date);
              if (training.certificate_number) formData.append(`trainings[${index}][certificate_number]`, training.certificate_number);
            }
          });
        }

        // Format benefits dengan validasi
        if (this.benefits && this.benefits.length > 0) {
          this.benefits.forEach((benefit, index) => {
            if (benefit.benefit_type && benefit.benefit_type.trim() !== '') {
              formData.append(`benefits[${index}][benefit_type]`, benefit.benefit_type);
              formData.append(`benefits[${index}][amount]`, benefit.amount || '0');
              if (benefit.start_date) formData.append(`benefits[${index}][start_date]`, benefit.start_date);
            }
          });
        }

        // Debug: Log formData content
        this.debugRequest(formData);

        const response = await axios.post(`${this.apiUrl}/api/employees`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 30000, // 30 second timeout
        });

        this.showNotificationMessage('Data karyawan berhasil disimpan!', 'success');
        setTimeout(() => {
          this.$router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Full error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        let errorMessage = 'Gagal menyimpan data karyawan.';
        
        if (error.response?.status === 500) {
          errorMessage = 'Server error. Periksa koneksi dan coba lagi.';
        } else if (error.response?.status === 422) {
          errorMessage = 'Data tidak valid. Periksa form dan coba lagi.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showNotificationMessage(errorMessage, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    showNotificationMessage(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    },
  },
};
</script>
