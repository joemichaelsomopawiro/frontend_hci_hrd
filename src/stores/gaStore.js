import { defineStore } from 'pinia'
import axios from 'axios'
import morningReflectionService from '../services/morningReflectionService'

// Set base URL for API requests
axios.defaults.baseURL = '/api'
axios.defaults.headers.common['Accept'] = 'application/json'

export const useGaStore = defineStore('ga', {
  state: () => ({
    employees: [],
    reflections: [],
    leaves: [],
    attendances: [],
    leaveRequests: [],
    attendanceStats: {},
    leaveStats: {},
    morningReflectionHistory: [],
    // Dashboard specific data
    dashboardAttendances: [],
    dashboardLeaveRequests: [],
    attendanceStatistics: {},
    leaveStatistics: {},
    dashboardLoading: false,
    form: {
      name: '',
      email: '',
      phone: '',
      position: '',
      department: ''
    },
    errors: {},
    loading: false,
    currentTime: null,
    zoomForm: {
      name: '',
      email: ''
    },
    zoomMeetingInfo: {
      url: 'https://zoom.us/j/123456789',
      meetingId: '123 456 789',
      passcode: '123456'
    },
    // Testing dan konfigurasi worship
    testingMode: false, // Set ke false untuk production
    worshipConfig: {
      startHour: 17, // Jam 5 sore
      startMinute: 50, // Buka jam 17:50
      endHour: 18, // Jam 6 sore
      endMinute: 20, // Tutup jam 18:20
      worshipDays: [6] // Sabtu
    }
  }),
  getters: {
    // Cek apakah hari ini adalah hari worship (Senin, Rabu, Jumat)
    isTodayWorshipDay() {
      // Jika testing mode aktif, selalu return true
      if (this.testingMode) {
        return true
      }
      
      const today = new Date()
      const dayOfWeek = today.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
      return this.worshipConfig.worshipDays.includes(dayOfWeek)
    },
    
    // Cek status waktu untuk zoom
    zoomTimeStatus() {
      // Jika testing mode aktif, selalu return 'Hadir'
      if (this.testingMode) {
        return 'Hadir'
      }
      
      const now = new Date()
      const today = new Date()
      const startTime = new Date(
        today.getFullYear(), 
        today.getMonth(), 
        today.getDate(), 
        this.worshipConfig.startHour, 
        this.worshipConfig.startMinute
      )
      const endTime = new Date(
        today.getFullYear(), 
        today.getMonth(), 
        today.getDate(), 
        this.worshipConfig.endHour, 
        this.worshipConfig.endMinute
      )
      
      if (now >= startTime && now <= endTime) {
        return 'Hadir'
      } else {
        return 'Tutup'
      }
    }
  },
  actions: {
    // Update waktu saat ini
    updateCurrentTime() {
      this.currentTime = new Date()
    },
    
    // Data dummy untuk employees
    getDummyEmployees() {
      return [
        {
          id: 8,
          nama_lengkap: 'Jelly Lukas',
          nik: '1111111111111111',
          nip: 'HR001',
          tanggal_lahir: '1985-01-01',
          jenis_kelamin: 'Laki-laki',
          alamat: 'Jakarta',
          status_pernikahan: 'Menikah',
          jabatan_saat_ini: 'HR',
          manager_id: null,
          tanggal_mulai_kerja: '2020-01-01',
          tingkat_pendidikan: 'S1',
          gaji_pokok: 15000000.00,
          tunjangan: 0.00,
          bonus: 0.00,
          nomor_bpjs_kesehatan: null,
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-18 07:24:24',
          updated_at: '2025-06-18 07:24:24'
        },
        {
          id: 13,
          nama_lengkap: 'Jefry Siadari',
          nik: '1231231231231312',
          nip: '12312323',
          tanggal_lahir: '2025-06-23',
          jenis_kelamin: 'Perempuan',
          alamat: '123123132',
          status_pernikahan: 'Cerai',
          jabatan_saat_ini: 'Program Manager',
          manager_id: null,
          tanggal_mulai_kerja: '2025-06-23',
          tingkat_pendidikan: 'S1',
          gaji_pokok: 10000000.00,
          tunjangan: 0.00,
          bonus: 0.00,
          nomor_bpjs_kesehatan: '124243234',
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-23 02:36:32',
          updated_at: '2025-06-23 02:55:42'
        },
        {
          id: 14,
          nama_lengkap: 'Joe Michael Somopawiro',
          nik: '1231231231231231',
          nip: '1231231',
          tanggal_lahir: '2025-06-23',
          jenis_kelamin: 'Laki-laki',
          alamat: '123123123',
          status_pernikahan: 'Menikah',
          jabatan_saat_ini: 'Editor',
          manager_id: 13,
          tanggal_mulai_kerja: '2025-06-23',
          tingkat_pendidikan: 'S3',
          gaji_pokok: 100000.00,
          tunjangan: 10000.00,
          bonus: 1000000.00,
          nomor_bpjs_kesehatan: null,
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-23 04:43:21',
          updated_at: '2025-06-23 04:43:21'
        },
        {
          id: 18,
          nama_lengkap: 'Daniel Luther Somopawiro',
          nik: '9879879879879879',
          nip: '123123176',
          tanggal_lahir: '2025-06-23',
          jenis_kelamin: 'Laki-laki',
          alamat: '123123123',
          status_pernikahan: 'Menikah',
          jabatan_saat_ini: 'Finance',
          manager_id: 8,
          tanggal_mulai_kerja: '2025-06-23',
          tingkat_pendidikan: 'S3',
          gaji_pokok: 100000.00,
          tunjangan: 10000.00,
          bonus: 1000000.00,
          nomor_bpjs_kesehatan: null,
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-23 04:43:21',
          updated_at: '2025-06-23 04:43:21'
        },
        {
          id: 19,
          nama_lengkap: 'Natanael',
          nik: '6782167281938738',
          nip: '78327832',
          tanggal_lahir: '2024-06-07',
          jenis_kelamin: 'Laki-laki',
          alamat: 'bukit duri',
          status_pernikahan: 'Belum Menikah',
          jabatan_saat_ini: 'Social Media',
          manager_id: 23,
          tanggal_mulai_kerja: '2025-06-02',
          tingkat_pendidikan: 'S1',
          gaji_pokok: 8893232.00,
          tunjangan: 9300.00,
          bonus: 300.00,
          nomor_bpjs_kesehatan: '9320',
          nomor_bpjs_ketenagakerjaan: '9320',
          npwp: '932',
          nomor_kontrak: '032',
          tanggal_kontrak_berakhir: '2025-08-04',
          created_at: '2025-06-23 14:35:00',
          updated_at: '2025-06-23 14:35:00'
        },
        {
          id: 20,
          nama_lengkap: 'Albert',
          nik: '6378329932932923',
          nip: '932932',
          tanggal_lahir: '2023-11-07',
          jenis_kelamin: 'Laki-laki',
          alamat: 'jakarta',
          status_pernikahan: 'Belum Menikah',
          jabatan_saat_ini: 'General Affairs',
          manager_id: 8,
          tanggal_mulai_kerja: '2025-06-02',
          tingkat_pendidikan: 'S1',
          gaji_pokok: 100000.00,
          tunjangan: 0.00,
          bonus: 0.00,
          nomor_bpjs_kesehatan: null,
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-24 06:52:05',
          updated_at: '2025-06-24 06:52:05'
        },
        {
          id: 21,
          nama_lengkap: 'Timothy',
          nik: '8272739292010101',
          nip: null,
          tanggal_lahir: '2025-06-05',
          jenis_kelamin: 'Laki-laki',
          alamat: 'bekasi',
          status_pernikahan: 'Belum Menikah',
          jabatan_saat_ini: 'Office Assistant',
          manager_id: 8,
          tanggal_mulai_kerja: '2025-05-29',
          tingkat_pendidikan: 'S1',
          gaji_pokok: 900000.00,
          tunjangan: 0.00,
          bonus: 0.00,
          nomor_bpjs_kesehatan: null,
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-26 02:33:01',
          updated_at: '2025-06-26 02:33:01'
        },
        {
          id: 23,
          nama_lengkap: 'Steven Mandey',
          nik: '7178487865416789',
          nip: '9891818',
          tanggal_lahir: '2025-06-23',
          jenis_kelamin: 'Laki-laki',
          alamat: 'bandung',
          status_pernikahan: 'Belum Menikah',
          jabatan_saat_ini: 'Distribution Manager',
          manager_id: null,
          tanggal_mulai_kerja: '2025-06-23',
          tingkat_pendidikan: 'S1',
          gaji_pokok: 10000000.00,
          tunjangan: 0.00,
          bonus: 0.00,
          nomor_bpjs_kesehatan: '124243234',
          nomor_bpjs_ketenagakerjaan: null,
          npwp: null,
          nomor_kontrak: null,
          tanggal_kontrak_berakhir: null,
          created_at: '2025-06-23 02:36:32',
          updated_at: '2025-06-23 02:55:42'
        }
      ];
    },
    
    async fetchEmployees() {
      try {
        const response = await axios.get('/api/employees');
        this.employees = response.data.data || response.data;
      } catch (error) {
        console.warn('Error fetching employees:', error.message);
        this.employees = [];
      }
    },
    
    async fetchReflections() {
      try {
        // Untuk sementara, gunakan data lokal karena backend belum ada
        const localReflections = JSON.parse(localStorage.getItem('reflections') || '[]');
        this.reflections = localReflections;
      } catch (error) {
        console.error('Error fetching reflections:', error)
        this.reflections = []
      }
    },
    
    async fetchLeaves() {
      try {
        const response = await axios.get('/ga/leaves')
        this.leaves = response.data.data
      } catch (error) {
        console.error('Error fetching leaves:', error)
        this.leaves = []
      }
    },
    
    // Dashboard data fetching methods
    async fetchDashboardAttendances() {
      this.dashboardLoading = true
      try {
        // Untuk sementara, gunakan data lokal karena backend belum ada
        const localAttendances = JSON.parse(localStorage.getItem('dashboardAttendances') || '[]');
        this.dashboardAttendances = localAttendances;
      } catch (error) {
        console.error('Error fetching dashboard attendances:', error)
        this.dashboardAttendances = []
      } finally {
        this.dashboardLoading = false
      }
    },
    
    async fetchDashboardLeaveRequests() {
      this.dashboardLoading = true
      try {
        const response = await axios.get('/ga/dashboard/leave-requests')
        this.dashboardLeaveRequests = response.data.data
      } catch (error) {
        console.error('Error fetching dashboard leave requests:', error)
        this.dashboardLeaveRequests = []
      } finally {
        this.dashboardLoading = false
      }
    },
    
    async fetchAttendanceStatistics() {
      this.dashboardLoading = true
      try {
        const response = await axios.get('/ga/dashboard/attendance-statistics')
        this.attendanceStatistics = response.data.data
      } catch (error) {
        console.error('Error fetching attendance statistics:', error)
        this.attendanceStatistics = {}
      } finally {
        this.dashboardLoading = false
      }
    },
    
    async fetchLeaveStatistics() {
      this.dashboardLoading = true
      try {
        const response = await axios.get('/ga/dashboard/leave-statistics')
        this.leaveStatistics = response.data.data
      } catch (error) {
        console.error('Error fetching leave statistics:', error)
        this.leaveStatistics = {}
      } finally {
        this.dashboardLoading = false
      }
    },
    
    // Fetch morning reflection history
    async fetchMorningReflectionHistory() {
      try {
        const response = await morningReflectionService.getTodayAttendance(10);
        this.morningReflectionHistory = response.data || [];
      } catch (error) {
        console.warn('Error fetching morning reflection history:', error.message);
        // Fallback: jika error role, gunakan data kosong
        if (error.message.includes('Access denied') || error.message.includes('403')) {
          console.log('User tidak memiliki akses GA, menggunakan data kosong');
          this.morningReflectionHistory = [];
        } else {
          this.morningReflectionHistory = [];
        }
      }
    },
    
    // Record worship morning attendance
    async recordWorshipAttendance(attendanceData) {
      try {
        const userId = attendanceData.user_id;
        if (!userId) {
          throw new Error('User ID tidak ditemukan');
        }

        // Gunakan service untuk absen dengan validasi
        const result = await morningReflectionService.attendWithValidation(userId, this.testingMode);
        
        if (result.success) {
          // Refresh data setelah berhasil mencatat
          await this.fetchMorningReflectionHistory();
          return { success: true, message: 'Kehadiran berhasil dicatat' };
        } else {
          throw new Error(result.message || 'Gagal mencatat kehadiran');
        }
      } catch (error) {
        console.error('Error recording worship attendance:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Add user to employees data
    async addUserToEmployees(userId) {
      try {
        // Ambil data user dari localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        
        // Cek apakah user sudah ada di employees
        const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        const userExists = existingEmployees.find(emp => emp.id === userId);
        
        if (!userExists) {
          // Tambahkan user baru
          const newEmployee = {
            id: userId,
            nama_lengkap: user.nama_lengkap || user.name || 'Unknown User',
            jabatan: user.jabatan || user.role || 'Employee'
          };
          
          existingEmployees.push(newEmployee);
          localStorage.setItem('employees', JSON.stringify(existingEmployees));
          this.employees = existingEmployees;
        }
      } catch (error) {
        console.error('Error adding user to employees:', error);
      }
    },
    
    // Submit attendance for morning reflection
    async submitAttendance(attendanceData) {
      this.loading = true
      try {
        const response = await axios.post('/ga/morning-reflections', attendanceData)
        // Add the new attendance to the history
          await this.fetchMorningReflectionHistory()
        return response.data
      } catch (error) {
        console.error('Error submitting attendance:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Join Zoom meeting for morning reflection
    async joinZoomMeeting() {
      this.loading = true
      
      try {
        // Validasi waktu dan hari jika bukan testing mode
        if (!this.testingMode) {
          if (!this.isTodayWorshipDay) {
            return {
              success: false,
              message: 'Hari ini bukan hari renungan pagi (Senin, Rabu, Jumat)'
            }
          }
          
          if (this.zoomTimeStatus !== 'Hadir') {
            return {
              success: false,
              message: 'Waktu renungan pagi sudah berakhir atau belum dimulai (07:10 - 07:35)'
            }
          }
        }
        
        // Ambil data user dari localStorage
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          return {
            success: false,
            message: 'Data user tidak ditemukan. Silakan login ulang.'
          }
        }
        
        const user = JSON.parse(userStr)
        
        // Kirim request ke backend untuk join zoom dan catat kehadiran
        const payload = {
          employee_id: user.id,
          user_name: user.nama_lengkap || user.name,
          user_role: user.role || user.position,
          attendance_time: new Date().toISOString(),
          type: 'morning_reflection',
          testing_mode: this.testingMode
        }
        
        const response = await axios.post('/ga/zoom-join', payload)
        
        // Buka Zoom meeting di tab baru
        const zoomUrl = response.data.zoom_link || this.zoomMeetingInfo.url
        window.open(zoomUrl, '_blank')
        
        // Refresh data setelah berhasil join
        await this.fetchMorningReflectionHistory()
        
        return {
          success: true,
          message: 'Berhasil bergabung ke Zoom dan kehadiran tercatat!',
          data: response.data
        }
        
      } catch (error) {
        let errorMessage = 'Terjadi kesalahan saat bergabung ke Zoom'
        
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors
          errorMessage = Object.values(error.response.data.errors).flat().join(', ')
        } else if (error.response?.status === 403) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        
        console.error('Error joining zoom:', error)
        return { success: false, message: errorMessage }
      } finally {
        this.loading = false
      }
    },
    
    // Load all dashboard data at once
    async loadDashboardData() {
      this.dashboardLoading = true
      try {
        await Promise.all([
          this.fetchDashboardAttendances(),
          this.fetchDashboardLeaveRequests(),
          this.fetchAttendanceStatistics(),
          this.fetchLeaveStatistics(),
          this.fetchMorningReflectionHistory()
        ])
        return { success: true, message: 'Dashboard data loaded successfully' }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        return { success: false, message: 'Failed to load dashboard data' }
      } finally {
        this.dashboardLoading = false
      }
    },
    
    // Submit manual attendance
    async submitAttendance() {
      this.errors = null
      this.loading = true
      try {
        const response = await axios.post('/ga/morning-reflections', this.form)
        await this.fetchReflections() // Refresh data
        this.form = { employee_id: '', date: '', status: '' }
        return { success: true, message: 'Absensi berhasil disimpan!' }
      } catch (error) {
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors
          return { success: false, message: 'Validation error' }
        }
        return { success: false, message: 'Error recording attendance.' }
      }
    },
    // Join Zoom dan record attendance otomatis
    async joinZoomMeeting(employeeId) {
      this.errors = null
      this.loading = true
      
      try {
        // Cek apakah hari ini adalah hari worship (skip jika testing mode)
        if (!this.testingMode && !this.isTodayWorshipDay) {
          throw new Error('Renungan pagi hanya diadakan pada hari Senin, Rabu, dan Jumat')
        }
        
        // Cek waktu (skip jika testing mode)
        const timeStatus = this.zoomTimeStatus
        if (!this.testingMode && !timeStatus.canJoin) {
          const endTime = `${String(this.worshipConfig.endHour).padStart(2, '0')}:${String(this.worshipConfig.endMinute).padStart(2, '0')}`
          throw new Error(`Waktu absensi sudah ditutup. Absensi hanya diperbolehkan hingga jam ${endTime} WIB`)
        }
        
        // Record zoom join ke backend
        const response = await axios.post('/ga/zoom-join', {
          employee_id: employeeId,
          zoom_link: this.zoomMeetingInfo.url,
          testing_mode: this.testingMode
        })
        
        // Refresh data reflections
        await this.fetchReflections()
        
        // Buka link zoom di tab baru
        if (response.data.zoom_link) {
          window.open(response.data.zoom_link, '_blank')
        }
        
        return {
          success: true,
          message: response.data.message || 'Berhasil bergabung ke Zoom dan absensi tercatat!',
          data: response.data.data,
          zoom_link: response.data.zoom_link
        }
        
      } catch (error) {
        let errorMessage = 'Terjadi kesalahan saat bergabung ke Zoom'
        
        if (error.response?.status === 422) {
          this.errors = error.response.data.errors
          errorMessage = Object.values(error.response.data.errors).flat().join(', ')
        } else if (error.response?.status === 403) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        
        console.error('Error joining zoom:', error)
        return { success: false, message: errorMessage }
      } finally {
        this.loading = false
      }
    },
    
    // Reset form
    resetForm() {
      this.form = { employee_id: '', date: '', status: '' }
      this.errors = null
    },
    
    // Load all dashboard data
    async loadDashboardData() {
      try {
        await Promise.all([
          this.fetchDashboardAttendances(),
          this.fetchDashboardLeaveRequests(),
          this.fetchAttendanceStatistics(),
          this.fetchLeaveStatistics()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    },

    // Reset zoom form
    resetZoomForm() {
      this.zoomForm = { employee_id: '', zoom_link: 'https://zoom.us/j/meeting' }
      this.errors = null
    },
    
    // Toggle testing mode
    toggleTestingMode() {
      this.testingMode = !this.testingMode
      console.log(`Testing mode: ${this.testingMode ? 'ON' : 'OFF'}`)
    },
    
    // Update worship config
    updateWorshipConfig(config) {
      this.worshipConfig = { ...this.worshipConfig, ...config }
      console.log('Worship config updated:', this.worshipConfig)
    },
    
    // Set worship time
    setWorshipTime(startHour, startMinute, endHour, endMinute) {
      this.worshipConfig.startHour = startHour
      this.worshipConfig.startMinute = startMinute
      this.worshipConfig.endHour = endHour
      this.worshipConfig.endMinute = endMinute
      console.log(`Worship time set: ${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} - ${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`)
    }
  }
})