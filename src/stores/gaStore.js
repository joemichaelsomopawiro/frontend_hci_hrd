import { defineStore } from 'pinia'
import axios from 'axios'

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
      startHour: 7,
      startMinute: 10, // Buka jam 07:10
      endHour: 7,
      endMinute: 35, // Tutup jam 07:35
      worshipDays: [1, 3, 5] // Monday, Wednesday, Friday
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
    
    async fetchEmployees() {
      try {
        const response = await axios.get('/ga/employees')
        this.employees = response.data.data
      } catch (error) {
        console.error('Error fetching employees:', error)
        this.employees = []
      }
    },
    
    async fetchReflections() {
      try {
        const response = await axios.get('/ga/morning-reflections')
        this.reflections = response.data.data
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
        const response = await axios.get('/ga/dashboard/attendances')
        this.dashboardAttendances = response.data.data
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
      this.loading = true
      try {
        const response = await axios.get('/ga/dashboard/morning-reflection-history')
        this.morningReflectionHistory = response.data.data
        return this.morningReflectionHistory
      } catch (error) {
        console.error('Error fetching morning reflection history:', error)
        return []
      } finally {
        this.loading = false
      }
    },
    
    // Submit attendance for morning reflection
    async submitAttendance(attendanceData) {
      this.loading = true
      try {
        const response = await axios.post('/ga/morning-reflections', attendanceData)
        // Add the new attendance to the history
        if (response.data.success) {
          // Refresh the morning reflection history
          await this.fetchMorningReflectionHistory()
        }
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