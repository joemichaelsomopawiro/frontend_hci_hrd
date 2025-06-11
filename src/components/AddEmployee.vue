<template>
  <div class="container">
    <h1>Tambah Pegawai</h1>
    <form @submit.prevent="submitForm">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input v-model="form.nama_lengkap" type="text" required />
        </div>
        <div class="form-group">
          <label>NIK</label>
          <input v-model="form.nik" type="text" maxlength="16" required />
        </div>
        <div class="form-group">
          <label>NIP</label>
          <input v-model="form.nip" type="text" />
        </div>
        <div class="form-group">
          <label>Tanggal Lahir</label>
          <input v-model="form.tanggal_lahir" type="date" required />
        </div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select v-model="form.jenis_kelamin" required>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div class="form-group">
          <label>Alamat</label>
          <textarea v-model="form.alamat" required></textarea>
        </div>
        <div class="form-group">
          <label>Status Pernikahan</label>
          <select v-model="form.status_pernikahan" required>
            <option value="Belum Menikah">Belum Menikah</option>
            <option value="Menikah">Menikah</option>
            <option value="Cerai">Cerai</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jabatan Saat Ini</label>
          <input v-model="form.jabatan_saat_ini" type="text" required />
        </div>
        <div class="form-group">
          <label>Tanggal Mulai Kerja</label>
          <input v-model="form.tanggal_mulai_kerja" type="date" required />
        </div>
        <div class="form-group">
          <label>Tingkat Pendidikan</label>
          <input v-model="form.tingkat_pendidikan" type="text" required />
        </div>
        <div class="form-group">
          <label>Gaji</label>
          <input v-model="form.gaji" type="number" required />
        </div>
        <div class="form-group">
          <label>Nomor BPJS</label>
          <input v-model="form.nomor_bpjs" type="text" />
        </div>
        <div class="form-group">
          <label>NPWP</label>
          <input v-model="form.npwp" type="text" />
        </div>
        <div class="form-group">
          <label>Dokumen (PDF/JPG/PNG, max 2MB)</label>
          <input type="file" multiple accept=".pdf,.jpg,.png" @change="handleFileUpload" />
        </div>
      </div>
      <button type="submit" class="btn-primary" style="margin-top: 1.5rem;">Simpan</button>
    </form>

    <!-- Popup Notifikasi -->
    <div
      v-if="showNotification"
      class="notification"
      :class="{ error: notificationType === 'error' }"
    >
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
        gaji: '',
        nomor_bpjs: '',
        npwp: '',
      },
      documents: [],
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      apiUrl: 'http://localhost:8000',
    };
  },
  methods: {
    handleFileUpload(event) {
      this.documents = Array.from(event.target.files);
    },
    async submitForm() {
      try {
        const formData = new FormData();
        Object.keys(this.form).forEach((key) => {
          if (this.form[key]) formData.append(key, this.form[key]);
        });
        this.documents.forEach((file, index) => {
          formData.append(`documents[${index}]`, file);
        });

        const response = await axios.post(`${this.apiUrl}/api/employees`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.showNotification = true;
        this.notificationMessage = response.data.message || 'Data berhasil disimpan!';
        this.notificationType = 'success';
        setTimeout(() => {
          this.showNotification = false;
          this.$router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Error submitting form:', error);
        this.showNotification = true;
        this.notificationMessage = error.response?.data?.message || 'Gagal menyimpan data.';
        this.notificationType = 'error';
        setTimeout(() => (this.showNotification = false), 2000);
      }
    },
  },
};
</script>