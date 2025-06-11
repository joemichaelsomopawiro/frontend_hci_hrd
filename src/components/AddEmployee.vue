<template>
  <div class="add-employee-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-btn">
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
    async submitForm() {
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        
        // Add form data
        Object.keys(this.form).forEach((key) => {
          if (this.form[key]) formData.append(key, this.form[key]);
        });
        
        // Add documents
        this.documents.forEach((file, index) => {
          formData.append(`documents[${index}]`, file);
        });

        // Add employment histories
        this.employmentHistories.forEach((history, index) => {
          if (history.company_name) {
            Object.keys(history).forEach(key => {
              if (history[key]) {
                formData.append(`employment_histories[${index}][${key}]`, history[key]);
              }
            });
          }
        });

        // Add trainings
        this.trainings.forEach((training, index) => {
          if (training.training_name) {
            Object.keys(training).forEach(key => {
              if (training[key]) {
                formData.append(`trainings[${index}][${key}]`, training[key]);
              }
            });
          }
        });

        // Add benefits
        this.benefits.forEach((benefit, index) => {
          if (benefit.benefit_type) {
            Object.keys(benefit).forEach(key => {
              if (benefit[key]) {
                formData.append(`benefits[${index}][${key}]`, benefit[key]);
              }
            });
          }
        });

        const response = await axios.post(`${this.apiUrl}/api/employees`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.showNotificationMessage('Data karyawan berhasil disimpan!', 'success');
        setTimeout(() => {
          this.$router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Error submitting form:', error);
        this.showNotificationMessage(
          error.response?.data?.message || 'Gagal menyimpan data karyawan.',
          'error'
        );
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
