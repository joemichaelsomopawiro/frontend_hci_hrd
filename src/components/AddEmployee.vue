<template>
  <div class="add-employee-container">
    <div class="page-header">
      <div class="header-content">
        <!-- Tombol Back dengan Icon -->
        <button @click="$router.go(-1)" class="back-btn" title="Kembali">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="page-title">
          <h1>Tambah Pegawai Baru</h1>
          <p>Hope Channel Indonesia - Enterprise HR System</p>
        </div>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="submitForm" class="employee-form">
        <!-- Informasi Personal -->
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

        <!-- Informasi Pekerjaan -->
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

        <!-- Informasi Tambahan -->
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

        <!-- Riwayat Pekerjaan -->
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

        <!-- Pelatihan & Sertifikasi -->
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

        <!-- Tunjangan & Benefit -->
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

        <!-- Tombol Aksi -->
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

    <!-- Notifikasi -->
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
      if (this.form.nik.length !== 16) {
        this.showNotificationMessage('NIK harus 16 digit', 'error');
        return false;
      }
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
      // Optional: Debug log
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }
      this.isSubmitting = true;
      try {
        const formData = new FormData();
        Object.keys(this.form).forEach((key) => {
          if (this.form[key] !== null && this.form[key] !== undefined && this.form[key] !== '') {
            formData.append(key, this.form[key]);
          }
        });
        if (this.documents && this.documents.length > 0) {
          this.documents.forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
          });
        }
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
        if (this.benefits && this.benefits.length > 0) {
          this.benefits.forEach((benefit, index) => {
            if (benefit.benefit_type && benefit.benefit_type.trim() !== '') {
              formData.append(`benefits[${index}][benefit_type]`, benefit.benefit_type);
              formData.append(`benefits[${index}][amount]`, benefit.amount || '0');
              if (benefit.start_date) formData.append(`benefits[${index}][start_date]`, benefit.start_date);
            }
          });
        }
        // this.debugRequest(formData); // Optional debug
        await axios.post(`${this.apiUrl}/api/employees`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 30000,
        });
        this.showNotificationMessage('Data karyawan berhasil disimpan!', 'success');
        setTimeout(() => {
          this.$router.push('/');
        }, 2000);
      } catch (error) {
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

<style>
:root {
  --primary-color: #2563eb;
  --primary-dark: #1e3a8a;
  --primary-light: #4f87ff;
  --secondary-color: #f59e0b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #06b6d4;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --white: #ffffff;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--gray-50);
  color: var(--gray-900);
  line-height: 1.6;
}

/* Container */
.add-employee-container {
  min-height: 100vh;
  background: var(--gray-50);
}

/* Header */
.page-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 1.5rem 2rem;
}

.page-header .header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.page-title p {
  color: var(--gray-500);
  font-size: 0.95rem;
}

/* Back Button */
.back-btn {
  width: 44px;
  height: 44px;
  border: 2px solid var(--gray-300);
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  color: var(--gray-600);
  position: relative;
  overflow: hidden;
}
.back-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(30, 64, 175, 0.1), transparent);
  transition: left 0.5s;
}
.back-btn:hover::before {
  left: 100%;
}
.back-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}
.back-btn:active {
  transform: translateY(0);
}
.back-btn i {
  transition: transform 0.2s ease;
}
.back-btn:hover i {
  transform: translateX(-2px);
}
.back-btn[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gray-800);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  animation: tooltipFadeIn 0.2s ease;
}
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Form Container */
.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem;
}

.employee-form {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

/* Section */
.form-section {
  padding: 2rem;
  border-bottom: 1px solid var(--gray-100);
}
.form-section:last-child {
  border-bottom: none;
  padding-bottom: 2rem;
}
.section-header {
  background: var(--gray-50);
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Grid & Group */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem 1.75rem;
}
.form-group {
  margin-bottom: 0;
}
.form-group.full-width {
  grid-column: 1 / -1;
}

/* Label & Input */
.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
  display: block;
}
.form-input,
.form-select,
.form-textarea {
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--gray-300);
  transition: all 0.2s ease-in-out;
  font-size: 0.95rem;
  color: var(--gray-900);
  background-color: var(--white);
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

/* Input Group (Prefix) */
.input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
}
.input-group:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}
.input-prefix {
  background-color: var(--gray-100);
  padding: 0.85rem 1rem;
  border-right: 1px solid var(--gray-300);
  color: var(--gray-600);
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1;
}
.input-group .form-input {
  border: none;
  flex: 1;
  padding-left: 0.75rem;
}

/* Button */
.btn-primary, .btn-secondary {
  padding: 0.9rem 1.75rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.2);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  color: white;
}
.btn-secondary {
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-400);
  box-shadow: var(--shadow-sm);
}
.btn-secondary:hover {
  background: var(--gray-100);
  border-color: var(--gray-500);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* File Upload */
.file-upload-area {
  border: 2px dashed var(--gray-300);
  border-radius: 12px;
  background-color: var(--gray-50);
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
}
.file-upload-area:hover {
  border-color: var(--primary-color);
  background-color: var(--gray-100);
}
.file-upload-area .upload-content i {
  font-size: 2.5rem;
  color: var(--gray-400);
  margin-bottom: 0.75rem;
}
.file-upload-area .upload-content p {
  color: var(--gray-600);
  font-weight: 500;
  margin-bottom: 0.25rem;
}
.file-upload-area .upload-content .upload-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: underline;
}
.file-upload-area .file-input {
  opacity: 0;
  position: absolute;
  left: 0; top: 0; width: 100%; height: 100%;
  cursor: pointer;
}

.file-list {
  margin-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
  padding-top: 1.5rem;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--gray-50);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid var(--gray-200);
}
.file-item .file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.file-item .file-info i {
  color: var(--primary-color);
  font-size: 1.1rem;
}
.file-item .file-info span {
  font-weight: 500;
  color: var(--gray-800);
}
.file-item .file-info small {
  color: var(--gray-500);
  font-size: 0.8rem;
}
.remove-file {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.remove-file:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* History Item */
.history-item {
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
}
.history-item .form-grid {
  gap: 1rem 1.5rem;
}
.history-item .remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.history-item .remove-btn:hover {
  color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

/* Form Actions */
.form-actions {
  padding: 1.5rem 2rem;
  background-color: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Loading & Notification */
.loading-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.loading-spinner i {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}
.loading-spinner p {
  color: var(--gray-700);
  font-weight: 500;
}
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  z-index: 1001;
  animation: slideInFromRight 0.3s ease-out;
}
.notification.success {
  background-color: var(--success-color);
  color: white;
}
.notification.error {
  background-color: var(--error-color);
  color: white;
}
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 900px) {
  .form-container {
    padding: 1rem;
  }
  .employee-form {
    border-radius: 6px;
  }
  .form-section {
    padding: 1rem;
  }
  .section-header {
    padding: 1rem;
  }
  .form-actions {
    padding: 1rem;
  }
}
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .form-container {
    padding: 0.5rem;
  }
  .page-header {
    padding: 1rem 0.5rem;
  }
}
</style>
