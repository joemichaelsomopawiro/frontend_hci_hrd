<template>
  <div class="container">
    <h1>Daftar Pegawai</h1>
    <router-link to="/add-employee" class="btn-primary">Tambah Pegawai</router-link>
    <div v-if="employees.length" style="margin-top: 1rem;">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>NIK</th>
            <th>Jabatan</th>
            <th>Dokumen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>{{ employee.nama_lengkap }}</td>
            <td>{{ employee.nik }}</td>
            <td>{{ employee.jabatan_saat_ini }}</td>
            <td>
              <span v-if="employee.documents.length">
                <a
                  v-for="doc in employee.documents"
                  :key="doc.id"
                  :href="`${apiUrl}/storage/${doc.file_path}`"
                  target="_blank"
                  class="green"
                >
                  {{ doc.file_path.split('/').pop().split('.')[0] }}
                </a>
              </span>
              <span v-else>Tidak ada dokumen</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else style="color: #6b7280; margin-top: 1rem;">Belum ada data pegawai.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Dashboard',
  data() {
    return {
      employees: [],
      apiUrl: 'http://localhost:8000',
    };
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
        alert('Gagal mengambil data pegawai. Pastikan backend berjalan.');
      }
    },
  },
};
</script>