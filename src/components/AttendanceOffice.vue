<template>
  <div class="attendance-office">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Absensi Kantor</h1>
      <p class="text-gray-600">Sistem absensi masuk dan pulang kantor</p>
    </div>

    <!-- Status Hari Ini -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="bg-blue-500 rounded-full p-3 mr-4">
            <i class="fas fa-clock text-white"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800">Waktu Sekarang</h3>
            <p class="text-lg font-bold text-blue-600">{{ currentTime }}</p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="bg-green-500 rounded-full p-3 mr-4">
            <i class="fas fa-sign-in-alt text-white"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800">Jam Masuk</h3>
            <p class="text-lg font-bold text-green-600">{{ todayAttendance?.check_in || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <div class="bg-red-500 rounded-full p-3 mr-4">
            <i class="fas fa-sign-out-alt text-white"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800">Jam Pulang</h3>
            <p class="text-lg font-bold text-red-600">{{ todayAttendance?.check_out || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tombol Aksi -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <button 
        @click="checkIn" 
        :disabled="todayAttendance?.check_in || isLoading"
        class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
      >
        <i class="fas fa-sign-in-alt mr-2"></i>
        {{ todayAttendance?.check_in ? 'Sudah Check In' : 'Check In' }}
      </button>

      <button 
        @click="checkOut" 
        :disabled="!todayAttendance?.check_in || todayAttendance?.check_out || isLoading"
        class="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
      >
        <i class="fas fa-sign-out-alt mr-2"></i>
        {{ todayAttendance?.check_out ? 'Sudah Check Out' : 'Check Out' }}
      </button>
    </div>

    <!-- Riwayat Absensi -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Riwayat Absensi</h2>
        <div class="flex gap-2">
          <input 
            type="date" 
            v-model="filterDate"
            class="border border-gray-300 rounded px-3 py-2"
          />
          <button 
            @click="loadAttendances" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            <i class="fas fa-sync mr-1"></i> Refresh
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Kerja</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="attendance in attendances" :key="attendance.id">
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(attendance.date) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ attendance.check_in || '-' }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ attendance.check_out || '-' }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ calculateWorkHours(attendance) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span :class="getStatusClass(attendance)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ getStatusText(attendance) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="attendances.length === 0" class="text-center py-8">
        <i class="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
        <p class="text-gray-500">Belum ada data absensi</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AttendanceOffice',
  setup() {
    const currentTime = ref('')
    const attendances = ref([])
    const todayAttendance = ref(null)
    const filterDate = ref('')
    const isLoading = ref(false)

    const API_BASE_URL = 'http://127.0.0.1:8000/api'

    // Update waktu setiap detik
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('id-ID')
    }

    // Format tanggal
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Hitung jam kerja
    const calculateWorkHours = (attendance) => {
      if (!attendance.check_in || !attendance.check_out) return '-'
      
      const checkIn = new Date(`${attendance.date} ${attendance.check_in}`)
      const checkOut = new Date(`${attendance.date} ${attendance.check_out}`)
      const diff = (checkOut - checkIn) / (1000 * 60 * 60) // dalam jam
      
      return `${diff.toFixed(1)} jam`
    }

    // Status class
    const getStatusClass = (attendance) => {
      if (!attendance.check_in) return 'bg-red-100 text-red-800'
      if (!attendance.check_out) return 'bg-yellow-100 text-yellow-800'
      return 'bg-green-100 text-green-800'
    }

    // Status text
    const getStatusText = (attendance) => {
      if (!attendance.check_in) return 'Tidak Hadir'
      if (!attendance.check_out) return 'Belum Check Out'
      return 'Hadir'
    }

    // Load Attendances
    const loadAttendances = async () => {
      try {
        isLoading.value = true
        const token = localStorage.getItem('token')
        const params = {}
        
        if (filterDate.value) {
          params.date = filterDate.value
        }
    
        const response = await axios.get(`${API_BASE_URL}/attendances`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params
        })
    
        attendances.value = response.data.data || []
        
        // Cari absensi hari ini
        const today = new Date().toISOString().split('T')[0]
        todayAttendance.value = attendances.value.find(att => att.date === today)
        
      } catch (error) {
        console.error('Error loading attendances:', error)
        alert('Gagal memuat data absensi')
      } finally {
        isLoading.value = false
      }
    }

    // Check In
    const checkIn = async () => {
      try {
        isLoading.value = true
        const token = localStorage.getItem('token')
        
        const response = await axios.post(`${API_BASE_URL}/attendances/check-in`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
    
        alert('Check in berhasil!')
        await loadAttendances()
        
      } catch (error) {
        console.error('Error check in:', error)
        alert('Gagal check in: ' + (error.response?.data?.message || 'Terjadi kesalahan'))
      } finally {
        isLoading.value = false
      }
    }

    // Check Out
    const checkOut = async () => {
      try {
        isLoading.value = true
        const token = localStorage.getItem('token')
        
        const response = await axios.post(`${API_BASE_URL}/attendances/check-out`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
    
        alert('Check out berhasil!')
        await loadAttendances()
        
      } catch (error) {
        console.error('Error check out:', error)
        alert('Gagal check out: ' + (error.response?.data?.message || 'Terjadi kesalahan'))
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      updateTime()
      setInterval(updateTime, 1000)
      loadAttendances()
    })

    return {
      currentTime,
      attendances,
      todayAttendance,
      filterDate,
      isLoading,
      formatDate,
      calculateWorkHours,
      getStatusClass,
      getStatusText,
      loadAttendances,
      checkIn,
      checkOut
    }
  }
}
</script>