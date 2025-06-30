<template>
  <div class="attendance">
    <!-- Header Section -->
    <div class="header">
      <div class="header-left">
        <h1>Absensi Renungan Pagi</h1>
        <p>Riwayat kehadiran renungan pagi keseluruhan</p>
      </div>
      <div class="time-info">
        <div class="current-time">
          <span class="time">{{ currentTimeDisplay }}</span>
          <span class="date">{{ currentDateDisplay }}</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Attendance History -->
      <div class="section">
        <div class="section-header">
          <h2>Riwayat Kehadiran</h2>
          <div class="section-header-actions">
            <button class="btn btn-primary" @click="refreshData" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Tanggal:</label>
            <input 
              type="date" 
              v-model="dateFilter" 
              @change="loadAttendanceHistory"
              class="filter-input"
            />
          </div>
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="statusFilter" @change="loadAttendanceHistory" class="filter-select">
              <option value="">Semua Status</option>
              <option value="present">Hadir</option>
              <option value="late">Terlambat</option>
              <option value="absent">Tidak Hadir</option>
              <option value="leave">Cuti</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Urutkan:</label>
            <select v-model="sortOrder" @change="loadAttendanceHistory" class="filter-select">
              <option value="date-desc">Tanggal (Terbaru)</option>
              <option value="date-asc">Tanggal (Terlama)</option>
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Cari:</label>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Cari nama karyawan..."
              @input="loadAttendanceHistory"
              class="filter-input"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Memuat data absensi...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ error }}</p>
            <button @click="loadAttendanceHistory" class="btn btn-primary">Coba Lagi</button>
          </div>
        </div>

        <!-- Attendance Table -->
        <div v-else class="table-container">
          <table class="attendance-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Karyawan</th>
                <th>Email</th>
                <th>Tanggal</th>
                <th>Waktu Hadir</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(attendance, index) in paginatedAttendances" :key="attendance.id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>
                  <div class="employee-info">
                    <strong>{{ attendance.user_name }}</strong>
                  </div>
                </td>
                <td>{{ attendance.user_email }}</td>
                <td>{{ formatDate(attendance.date) }}</td>
                <td>
                  <span v-if="attendance.attended_at" class="time-attended">
                    {{ attendance.attended_at }}
                  </span>
                  <span v-else class="time-not-attended">-</span>
                </td>
                <td>
                  <span class="status-badge" :class="attendance.status_color">
                    {{ attendance.status_label }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <select 
                      v-model="attendance.status" 
                      @change="updateAttendanceStatus(attendance)"
                      class="status-select"
                      :disabled="loading"
                    >
                      <option value="present">Hadir</option>
                      <option value="late">Terlambat</option>
                      <option value="absent">Tidak Hadir</option>
                      <option value="leave">Cuti</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="attendances.length === 0" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <p>Tidak ada data absensi untuk periode yang dipilih</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="btn-pagination"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <span class="page-info">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="btn-pagination"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <i :class="notificationIcon"></i>
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import morningReflectionService from '../services/morningReflectionService';

export default {
  setup() {
    const currentTime = ref(new Date());
    const timeInterval = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // Data
    const attendances = ref([]);

    // Search and filter reactive variables
    const searchQuery = ref("");
    const dateFilter = ref("");
    const sortOrder = ref("date-desc");
    const statusFilter = ref("");

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // Notification
    const showNotification = ref(false);
    const notificationMessage = ref("");
    const notificationType = ref("success");

    // Update waktu setiap detik
    const updateTime = () => {
      currentTime.value = new Date();
    };

    // Computed properties
    const currentTimeDisplay = computed(() => {
      return currentTime.value.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    });

    const currentDateDisplay = computed(() => {
      return currentTime.value.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    const filteredAttendances = computed(() => {
      let filtered = attendances.value;

      // Filter berdasarkan pencarian
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(attendance =>
          attendance.user_name.toLowerCase().includes(query) ||
          attendance.user_email.toLowerCase().includes(query)
        );
      }

      // Filter berdasarkan tanggal
      if (dateFilter.value) {
        filtered = filtered.filter(attendance => attendance.date === dateFilter.value);
      }

      // Filter berdasarkan status
      if (statusFilter.value) {
        filtered = filtered.filter(attendance => attendance.status === statusFilter.value);
      }

      // Sorting
      filtered.sort((a, b) => {
        switch (sortOrder.value) {
          case "date-desc":
            return new Date(b.date) - new Date(a.date);
          case "date-asc":
            return new Date(a.date) - new Date(b.date);
          case "name-asc":
            return a.user_name.localeCompare(b.user_name);
          case "name-desc":
            return b.user_name.localeCompare(a.user_name);
          default:
            return 0;
        }
      });

      return filtered;
    });

    const paginatedAttendances = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredAttendances.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredAttendances.value.length / itemsPerPage.value);
    });

    const notificationIcon = computed(() => {
      return notificationType.value === "success"
        ? "fas fa-check-circle"
        : "fas fa-exclamation-circle";
    });

    // Methods
    const loadAttendanceHistory = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Validasi parameter sebelum request
        const params = {
          per_page: itemsPerPage.value,
          page: currentPage.value
        };

        // Hanya tambahkan parameter jika ada nilai
        if (searchQuery.value && searchQuery.value.trim() !== '') {
          params.search = searchQuery.value.trim();
        }
        if (dateFilter.value && dateFilter.value !== '') {
          params.date = dateFilter.value;
        }
        if (statusFilter.value && statusFilter.value !== '') {
          params.status = statusFilter.value;
        }

        const result = await morningReflectionService.getGaAttendanceHistory(params);
        
        if (result.success) {
          attendances.value = result.data.attendances || [];
          // Update pagination jika ada
          if (result.data.pagination) {
            currentPage.value = result.data.pagination.current_page || 1;
            itemsPerPage.value = result.data.pagination.per_page || 10;
          }
        } else {
          error.value = result.message || 'Gagal memuat data absensi';
        }
      } catch (err) {
        console.error("Error loading attendance history:", err);
        error.value = "Gagal memuat data absensi. Silakan coba lagi.";
        attendances.value = [];
      } finally {
        loading.value = false;
      }
    };

    const updateAttendanceStatus = async (attendance) => {
      try {
        loading.value = true;

        // Update status di local state terlebih dahulu
        const originalStatus = attendance.status;
        attendance.status_label = morningReflectionService.getStatusLabel(attendance.status);
        attendance.status_color = morningReflectionService.getStatusColor(attendance.status);

        // Simpan ke backend (implementasi sesuai dengan API yang tersedia)
        const updateData = {
          user_id: attendance.user_id,
          date: attendance.date,
          status: attendance.status
        };

        // Jika ada API untuk update status, gunakan di sini
        // await morningReflectionService.updateAttendanceStatus(updateData);

        showNotificationMessage("Status berhasil diperbarui", "success");

        // Refresh data untuk memastikan konsistensi
        await loadAttendanceHistory();

      } catch (err) {
        console.error("Error updating attendance status:", err);

        // Rollback status jika gagal
        attendance.status = originalStatus;
        attendance.status_label = morningReflectionService.getStatusLabel(originalStatus);
        attendance.status_color = morningReflectionService.getStatusColor(originalStatus);

        showNotificationMessage("Gagal memperbarui status", "error");
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      currentPage.value = 1;
      loadAttendanceHistory();
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const showNotificationMessage = (message, type = "success") => {
      notificationMessage.value = message;
      notificationType.value = type;
      showNotification.value = true;

      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };

    // Lifecycle
    onMounted(() => {
      updateTime();
      timeInterval.value = setInterval(updateTime, 1000);
      loadAttendanceHistory();
    });

    onUnmounted(() => {
      if (timeInterval.value) {
        clearInterval(timeInterval.value);
      }
    });

    return {
      currentTimeDisplay,
      currentDateDisplay,
      loading,
      error,
      attendances,
      searchQuery,
      dateFilter,
      sortOrder,
      statusFilter,
      currentPage,
      itemsPerPage,
      paginatedAttendances,
      totalPages,
      showNotification,
      notificationMessage,
      notificationType,
      notificationIcon,
      loadAttendanceHistory,
      updateAttendanceStatus,
      refreshData,
      formatDate,
      showNotificationMessage
    };
  }
};
</script>

<style scoped>
/* GA Attendance Styles */
.attendance {
  min-height: 100vh;
  background: var(--gray-50);
  padding: 2rem;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.header-left h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.header-left p {
  color: var(--gray-600);
  margin: 0;
}

.time-info {
  text-align: right;
}

.current-time .time {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.current-time .date {
  display: block;
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
}

/* Content */
.content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Section */
.section {
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.section-header-actions {
  display: flex;
  gap: 1rem;
}

/* Filters */
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--white);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
}

.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--white);
  transition: border-color 0.2s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner i {
  font-size: 2rem;
  color: var(--primary-color);
}

.loading-spinner p {
  color: var(--gray-600);
  margin: 0;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-message i {
  font-size: 2rem;
  color: var(--error-color);
}

.error-message p {
  color: var(--gray-700);
  margin: 0;
}

/* Table Container */
.table-container {
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
}

.attendance-table th {
  background: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
  font-size: 0.875rem;
}

.attendance-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
  vertical-align: middle;
}

.attendance-table tbody tr:hover {
  background: var(--gray-50);
}

/* Employee Info */
.employee-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.employee-info strong {
  color: var(--gray-900);
  font-weight: 600;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.success {
  background: var(--success-color);
  color: white;
}

.status-badge.warning {
  background: var(--warning-color);
  color: white;
}

.status-badge.danger {
  background: var(--error-color);
  color: white;
}

.status-badge.info {
  background: var(--info-color);
  color: white;
}

.status-badge.secondary {
  background: var(--gray-500);
  color: white;
}

/* Time Display */
.time-attended {
  color: var(--success-color);
  font-weight: 600;
}

.time-not-attended {
  color: var(--gray-500);
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.status-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--white);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.status-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.btn-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  background: var(--white);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-pagination:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: var(--success-color);
}

.notification.error {
  background: var(--error-color);
}

.notification i {
  font-size: 1.25rem;
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
  .attendance {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .time-info {
    text-align: center;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .section-header-actions {
    justify-content: center;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .attendance-table {
    font-size: 0.875rem;
  }

  .attendance-table th,
  .attendance-table td {
    padding: 0.75rem 0.5rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .notification {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .attendance-table {
    font-size: 0.75rem;
  }

  .attendance-table th,
  .attendance-table td {
    padding: 0.5rem 0.25rem;
  }

  .status-badge {
    font-size: 0.625rem;
    padding: 0.125rem 0.5rem;
  }

  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>

