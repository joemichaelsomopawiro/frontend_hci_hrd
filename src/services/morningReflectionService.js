// Service untuk Morning Reflection API
const API_BASE_URL = '/api/morning-reflection';

class MorningReflectionService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isDevelopment = import.meta.env.DEV;
  }

  // Helper method untuk membuat headers
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Helper method untuk handle response
  async handleResponse(response) {
    // Jika response tidak ok, coba parse error message
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Jika tidak bisa parse JSON, gunakan status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Cek apakah response kosong
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
  }

  // GET /api/morning-reflection/status
  async getStatus() {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting morning reflection status:', error.message);
      throw error;
    }
  }

  // POST /api/morning-reflection/attend
  async attend(userId, testingMode = false) {
    try {
      const response = await fetch(`${this.baseURL}/attend`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: userId,
          testing_mode: testingMode
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error attending morning reflection:', error.message);
      throw error;
    }
  }

  // GET /api/morning-reflection/attendance
  async getAttendance(userId, date = null) {
    try {
      const params = new URLSearchParams();
      if (userId && userId !== '') params.append('user_id', userId);
      if (date && date !== '') params.append('date', date);
      
      const response = await fetch(`${this.baseURL}/attendance?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting attendance:', error.message);
      throw error;
    }
  }

  // GET /api/morning-reflection/attendance/{userId}/{date}
  async getAttendanceByDate(userId, date) {
    try {
      const response = await fetch(`${this.baseURL}/attendance/${userId}/${date}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting attendance by date:', error.message);
      throw error;
    }
  }

  // GET /api/morning-reflection/weekly-attendance/{userId}
  async getWeeklyAttendance(userId, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await fetch(`${this.baseURL}/weekly-attendance/${userId}?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting weekly attendance:', error.message);
      throw error;
    }
  }

  // GET /api/morning-reflection/config
  async getConfig() {
    try {
      const response = await fetch(`${this.baseURL}/config`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting config:', error.message);
      throw error;
    }
  }

  // PUT /api/morning-reflection/config (Admin/GA only)
  async updateConfig(configData) {
    try {
      const response = await fetch(`${this.baseURL}/config`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(configData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error updating config:', error.message);
      throw error;
    }
  }

  // GET /api/morning-reflection/today-attendance (Admin/GA only)
  async getTodayAttendance(perPage = 10) {
    try {
      const params = new URLSearchParams();
      if (perPage) params.append('per_page', perPage);
      
      const response = await fetch(`${this.baseURL}/today-attendance?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting today attendance:', error.message);
      throw error;
    }
  }

  // GET /api/morning-reflection/statistics
  async getStatistics(period = 'week') {
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      
      const response = await fetch(`${this.baseURL}/statistics?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.warn('Error getting statistics:', error.message);
      throw error;
    }
  }

  // Helper method untuk cek apakah user sudah hadir hari ini
  async checkTodayAttendance(userId) {
    try {
      const result = await this.getAttendance(userId);
      return result.data?.attended || false;
    } catch (error) {
      console.warn('Error checking today attendance:', error.message);
      // Jika error karena model tidak ditemukan, return false
      if (error.message.includes('WorshipConfig') || error.message.includes('500')) {
        console.log('Model WorshipConfig tidak ditemukan, menggunakan fallback');
        return false;
      }
      return false;
    }
  }

  // Helper method untuk absen dengan validasi
  async attendWithValidation(userId, testingMode = false) {
    try {
      // Cek status renungan pagi terlebih dahulu
      const status = await this.getStatus();
      
      if (!status.data?.active) {
        throw new Error('Hari ini tidak ada renungan pagi');
      }
      
      if (!status.data?.is_open && !status.data?.is_passed) {
        throw new Error('Renungan pagi belum dimulai');
      }
      
      // Cek apakah sudah hadir
      const hasAttended = await this.checkTodayAttendance(userId);
      if (hasAttended) {
        throw new Error('Anda sudah hadir di renungan pagi hari ini');
      }
      
      // Absen
      return await this.attend(userId, testingMode);
    } catch (error) {
      console.warn('Error in attendWithValidation:', error.message);
      throw error;
    }
  }

  /**
   * Get GA Dashboard data - statistik absensi hari ini dengan data real
   */
  async getGaDashboardData(date = null) {
    try {
      // Ambil data employees real dari API
      const employeesResponse = await fetch('/api/employees', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees data');
      }
      
      const employeesData = await employeesResponse.json();
      const employees = employeesData.data || employeesData || [];
      
      // Cek apakah hari ini adalah hari absensi renungan pagi
      const today = date ? new Date(date) : new Date();
      const dayOfWeek = today.getDay(); // 0 = Minggu, 1 = Senin, 2 = Selasa, dst
      const currentTime = today.getHours() * 60 + today.getMinutes(); // dalam menit
      
      // Absensi renungan pagi hanya pada Senin (1), Rabu (3), Jumat (5) jam 7:10-7:35
      const isWorshipDay = [1, 3, 5].includes(dayOfWeek); // Senin, Rabu, Jumat
      const isWorshipTime = currentTime >= 430 && currentTime <= 455; // 7:10-7:35 dalam menit
      
      // Jika bukan hari absensi atau belum waktunya, return data kosong
      if (!isWorshipDay) {
        return {
          success: true,
          data: {
            date: today.toISOString().split('T')[0],
            total_employees: employees.length,
            present_today: 0,
            on_time_today: 0,
            late_today: 0,
            absent_today: employees.length,
            leave_today: 0,
            attendance_rate: 0,
            today_attendance_list: employees.map(employee => ({
              id: null,
              user_id: employee.id,
              user_name: employee.nama_lengkap,
              user_email: employee.email || `${employee.nama_lengkap.toLowerCase().replace(/\s+/g, '.')}@company.com`,
              attended: false,
              attended_at: null,
              status: 'absent',
              status_label: 'Tidak Hadir',
              status_color: 'danger'
            })),
            is_worship_day: false,
            worship_time_status: 'Bukan hari absensi renungan pagi'
          }
        };
      }
      
      // Jika hari absensi tapi belum waktunya
      if (isWorshipDay && currentTime < 430) {
        return {
          success: true,
          data: {
            date: today.toISOString().split('T')[0],
            total_employees: employees.length,
            present_today: 0,
            on_time_today: 0,
            late_today: 0,
            absent_today: employees.length,
            leave_today: 0,
            attendance_rate: 0,
            today_attendance_list: employees.map(employee => ({
              id: null,
              user_id: employee.id,
              user_name: employee.nama_lengkap,
              user_email: employee.email || `${employee.nama_lengkap.toLowerCase().replace(/\s+/g, '.')}@company.com`,
              attended: false,
              attended_at: null,
              status: 'absent',
              status_label: 'Belum Waktunya',
              status_color: 'secondary'
            })),
            is_worship_day: true,
            worship_time_status: 'Belum waktunya absensi (7:10-7:35)'
          }
        };
      }
      
      // Ambil data absensi renungan pagi hari ini
      const todayStr = today.toISOString().split('T')[0];
      const attendanceResponse = await fetch(`/api/morning-reflection/attendance?date=${todayStr}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      let todayAttendances = [];
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        todayAttendances = attendanceData.data || [];
      }
      
      // Hitung statistik berdasarkan data real
      const totalEmployees = employees.length;
      const presentToday = todayAttendances.filter(att => att.status === 'present' || att.status === 'attended').length;
      const lateToday = todayAttendances.filter(att => att.status === 'late').length;
      
      // Cek karyawan yang cuti hari ini (bisa diambil dari leave requests)
      let leaveToday = 0;
      try {
        const leaveResponse = await fetch(`/api/leave-requests?date=${todayStr}&status=approved`, {
          method: 'GET',
          headers: this.getHeaders()
        });
        if (leaveResponse.ok) {
          const leaveData = await leaveResponse.json();
          leaveToday = (leaveData.data || []).length;
        }
      } catch (error) {
        console.warn('Could not fetch leave data:', error);
      }
      
      const absentToday = totalEmployees - presentToday - lateToday - leaveToday;
      
      // Buat daftar kehadiran hari ini
      const todayAttendanceList = employees.map(employee => {
        const attendance = todayAttendances.find(att => att.user_id === employee.id);
        const isOnLeave = leaveToday > 0; // Logic untuk cek cuti bisa diperbaiki sesuai kebutuhan
        
        if (attendance) {
          return {
            id: attendance.id,
            user_id: employee.id,
            user_name: employee.nama_lengkap,
            user_email: employee.email || `${employee.nama_lengkap.toLowerCase().replace(/\s+/g, '.')}@company.com`,
            attended: true,
            attended_at: attendance.attended_at ? new Date(attendance.attended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
            status: attendance.status,
            status_label: this.getStatusLabel(attendance.status),
            status_color: this.getStatusColor(attendance.status)
          };
        } else if (isOnLeave) {
          return {
            id: null,
            user_id: employee.id,
            user_name: employee.nama_lengkap,
            user_email: employee.email || `${employee.nama_lengkap.toLowerCase().replace(/\s+/g, '.')}@company.com`,
            attended: false,
            attended_at: null,
            status: 'leave',
            status_label: 'Cuti',
            status_color: 'info'
          };
        } else {
          return {
            id: null,
            user_id: employee.id,
            user_name: employee.nama_lengkap,
            user_email: employee.email || `${employee.nama_lengkap.toLowerCase().replace(/\s+/g, '.')}@company.com`,
            attended: false,
            attended_at: null,
            status: 'absent',
            status_label: 'Tidak Hadir',
            status_color: 'danger'
          };
        }
      });
      
      const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;
      const onTimeToday = presentToday - lateToday;
      
      return {
        success: true,
        data: {
          date: todayStr,
          total_employees: totalEmployees,
          present_today: presentToday,
          on_time_today: onTimeToday,
          late_today: lateToday,
          absent_today: absentToday,
          leave_today: leaveToday,
          attendance_rate: attendanceRate,
          today_attendance_list: todayAttendanceList,
          is_worship_day: true,
          worship_time_status: isWorshipTime ? 'Sedang berlangsung' : 'Sudah selesai'
        }
      };
      
    } catch (error) {
      console.error('Error fetching GA dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get GA Attendance History - riwayat absensi keseluruhan dengan data real
   */
  async getGaAttendanceHistory(params = {}) {
    try {
      // Ambil data employees real
      const employeesResponse = await fetch('/api/employees', {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees data');
      }
      
      const employeesData = await employeesResponse.json();
      const employees = employeesData.data || employeesData || [];
      
      // Ambil data absensi renungan pagi dengan validasi parameter
      const queryParams = new URLSearchParams();
      if (params.per_page && params.per_page > 0) {
        queryParams.append('per_page', params.per_page);
      }
      if (params.page && params.page > 0) {
        queryParams.append('page', params.page);
      }
      if (params.date && params.date !== '') {
        queryParams.append('date', params.date);
      }
      if (params.user_id && params.user_id !== '') {
        queryParams.append('user_id', params.user_id);
      }
      if (params.status && params.status !== '') {
        queryParams.append('status', params.status);
      }
      
      const attendanceResponse = await fetch(`/api/morning-reflection/attendance?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      let attendances = [];
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        attendances = attendanceData.data || [];
      }
      
      // Gabungkan data attendance dengan employee
      const attendanceList = attendances.map(attendance => {
        const employee = employees.find(emp => emp.id === attendance.user_id);
        return {
          id: attendance.id,
          user_id: attendance.user_id,
          user_name: employee ? employee.nama_lengkap : `User ${attendance.user_id}`,
          user_email: employee ? (employee.email || `${employee.nama_lengkap.toLowerCase().replace(/\s+/g, '.')}@company.com`) : 'unknown@company.com',
          date: attendance.date,
          status: attendance.status,
          status_label: this.getStatusLabel(attendance.status),
          attended_at: attendance.attended_at ? new Date(attendance.attended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
        };
      });
      
      return {
        success: true,
        data: {
          attendances: attendanceList,
          pagination: {
            current_page: 1,
            per_page: params.per_page || 10,
            total: attendanceList.length,
            last_page: 1
          }
        }
      };
      
    } catch (error) {
      console.error('Error fetching GA attendance history:', error);
      throw error;
    }
  }

  /**
   * Helper method untuk mendapatkan label status
   */
  getStatusLabel(status) {
    const statusMap = {
      'present': 'Hadir',
      'attended': 'Hadir',
      'late': 'Terlambat',
      'absent': 'Tidak Hadir',
      'not_attended': 'Tidak Hadir',
      'leave': 'Cuti'
    };
    return statusMap[status] || status;
  }

  /**
   * Helper method untuk mendapatkan warna status
   */
  getStatusColor(status) {
    const colorMap = {
      'present': 'success',
      'attended': 'success',
      'late': 'warning',
      'absent': 'danger',
      'not_attended': 'danger',
      'leave': 'info'
    };
    return colorMap[status] || 'secondary';
  }
}

// Export singleton instance
export default new MorningReflectionService(); 