// Konfigurasi untuk Renungan Pagi (Morning Reflection)
export const worshipConfig = {
  // Mode testing - set ke false untuk production
  testingMode: false,
  
  // Konfigurasi waktu worship
  schedule: {
    // Jam mulai worship (format 24 jam)
    startHour: 7, // Jam 7 pagi
    startMinute: 10, // Buka jam 07:10
    
    // Jam akhir worship (format 24 jam)
    endHour: 7, // Jam 7 pagi
    endMinute: 35, // Tutup jam 07:35
    
    // Hari-hari worship (0=Minggu, 1=Senin, 2=Selasa, dst)
    worshipDays: [1, 3, 5], // Senin, Rabu, Jumat
    startTime: '07:10', // WIB
    endTime: '07:35', // WIB
    timezone: 'Asia/Jakarta'
  },
  
  // Zoom meeting info
  zoomMeeting: {
    url: 'https://us05web.zoom.us/j/83944037030?pwd=JqekgNraYcrjb4xEJWqU52uOQ8GhCV.1',
    meetingId: '839 440 37030',
    passcode: 'JqekgNraYcrjb4xEJWqU52uOQ8GhCV.1'
  },
  
  // Link Zoom untuk renungan pagi
  zoomLink: 'https://us05web.zoom.us/j/83944037030?pwd=JqekgNraYcrjb4xEJWqU52uOQ8GhCV.1',
  
  // Password Zoom (opsional)
  zoomPassword: 'JqekgNraYcrjb4xEJWqU52uOQ8GhCV.1',
  
  // Pesan notifikasi
  messages: {
    notStarted: 'Renungan pagi akan dimulai dalam',
    active: 'Sesi renungan pagi sedang berlangsung',
    ended: 'Sesi renungan pagi telah berakhir',
    attendanceRecorded: 'Kehadiran renungan pagi berhasil dicatat!',
    attendanceFailed: 'Gagal mencatat kehadiran. Silakan coba lagi.',
    notWorshipDay: 'Hari ini bukan jadwal renungan pagi',
    sessionNotActive: 'Sesi renungan belum dimulai atau sudah berakhir.'
  },
  
  // Helper functions
  helpers: {
    // Format waktu untuk display
    formatTime(hour, minute) {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    },
    // Get nama hari dalam bahasa Indonesia
    getDayName(dayIndex) {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      return days[dayIndex]
    },
    // Get daftar hari worship dalam bahasa Indonesia
    getWorshipDaysNames() {
      return this.schedule.worshipDays.map(day => this.getDayName(day))
    }
  }
}

// Export individual configs for easier access
export const { testingMode, schedule, zoomMeeting, helpers } = worshipConfig

// Quick access functions
export const isTestingMode = () => worshipConfig.testingMode
export const getWorshipSchedule = () => worshipConfig.schedule
export const getZoomMeetingInfo = () => worshipConfig.zoomMeeting

// Console helper untuk debugging
export const logConfig = () => {
  console.group('🙏 Worship Configuration')
  console.log('Testing Mode:', worshipConfig.testingMode ? '✅ ON' : '❌ OFF')
  console.log('Worship Days:', helpers.getWorshipDaysNames().join(', '))
  console.log('Worship Time:', `${helpers.formatTime(schedule.startHour, schedule.startMinute)} - ${helpers.formatTime(schedule.endHour, schedule.endMinute)} WIB`)
  console.log('Zoom Meeting:', zoomMeeting.url)
  console.groupEnd()
}

export default worshipConfig;