// Konfigurasi untuk development mode
export const developmentConfig = {
  // Mode development
  isDevelopment: import.meta.env.DEV,
  
  // API Configuration
  api: {
    baseURL: '/api',
    timeout: 10000,
    retryAttempts: 3
  },
  
  // Morning Reflection Configuration
  morningReflection: {
    // Hari renungan pagi (0=Sunday, 1=Monday, ..., 6=Saturday)
    worshipDays: [1, 3, 5], // Senin, Rabu, Jumat
    
    // Waktu renungan pagi
    startTime: '07:10',
    endTime: '07:35',
    
    // Link Zoom
    zoomLink: 'https://zoom.us/j/123456789',
    
    // Judul dan deskripsi
    title: 'Renungan Pagi',
    description: 'Renungan pagi bersama tim HCI'
  },
  
  // Dummy Data Configuration
  dummyData: {
    // Jumlah pegawai dummy
    totalEmployees: 8,
    
    // Persentase kehadiran dummy (0-100)
    attendanceRate: 60,
    
    // Data pegawai dari database
    employees: [
      {
        id: 8,
        nama_lengkap: 'Jelly Lukas',
        nik: '1111111111111111',
        nip: 'HR001',
        jabatan_saat_ini: 'HR',
        manager_id: null
      },
      {
        id: 13,
        nama_lengkap: 'Jefry Siadari',
        nik: '1231231231231312',
        nip: '12312323',
        jabatan_saat_ini: 'Program Manager',
        manager_id: null
      },
      {
        id: 14,
        nama_lengkap: 'Joe Michael Somopawiro',
        nik: '1231231231231231',
        nip: '1231231',
        jabatan_saat_ini: 'Editor',
        manager_id: 13
      },
      {
        id: 18,
        nama_lengkap: 'Daniel Luther Somopawiro',
        nik: '9879879879879879',
        nip: '123123176',
        jabatan_saat_ini: 'Finance',
        manager_id: 8
      },
      {
        id: 19,
        nama_lengkap: 'Natanael',
        nik: '6782167281938738',
        nip: '78327832',
        jabatan_saat_ini: 'Social Media',
        manager_id: 23
      },
      {
        id: 20,
        nama_lengkap: 'Albert',
        nik: '6378329932932923',
        nip: '932932',
        jabatan_saat_ini: 'General Affairs',
        manager_id: 8
      },
      {
        id: 21,
        nama_lengkap: 'Timothy',
        nik: '8272739292010101',
        nip: null,
        jabatan_saat_ini: 'Office Assistant',
        manager_id: 8
      },
      {
        id: 23,
        nama_lengkap: 'Steven Mandey',
        nik: '7178487865416789',
        nip: '9891818',
        jabatan_saat_ini: 'Distribution Manager',
        manager_id: null
      }
    ]
  },
  
  // Error Handling Configuration
  errorHandling: {
    // Tampilkan error di console
    showConsoleErrors: true,
    
    // Tampilkan warning di console
    showConsoleWarnings: true,
    
    // Fallback ke localStorage
    useLocalStorageFallback: true,
    
    // Retry attempts untuk API calls
    maxRetries: 3,
    
    // Timeout untuk API calls (ms)
    timeout: 10000
  },
  
  // UI Configuration
  ui: {
    // Theme
    theme: 'light',
    
    // Language
    language: 'id',
    
    // Timezone
    timezone: 'Asia/Jakarta',
    
    // Date format
    dateFormat: 'DD/MM/YYYY',
    
    // Time format
    timeFormat: 'HH:mm'
  },
  
  // Testing Configuration
  testing: {
    // Testing mode untuk fitur tertentu
    testingMode: false,
    
    // Mock data untuk testing
    useMockData: false,
    
    // Simulasi delay API (ms)
    apiDelay: 500
  }
};

// Helper functions
export const devHelpers = {
  // Cek apakah dalam development mode
  isDev() {
    return developmentConfig.isDevelopment;
  },
  
  // Log development message
  log(message, type = 'info') {
    if (developmentConfig.isDevelopment) {
      const timestamp = new Date().toLocaleTimeString();
      const prefix = `[DEV ${timestamp}]`;
      
      switch (type) {
        case 'error':
          console.error(prefix, message);
          break;
        case 'warn':
          console.warn(prefix, message);
          break;
        case 'info':
        default:
          console.log(prefix, message);
          break;
      }
    }
  },
  
  // Generate dummy attendance data
  generateDummyAttendance(employees, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    return employees.slice(0, 5).map((emp, index) => ({
      id: index + 1,
      user_id: emp.id,
      user_name: emp.nama_lengkap,
      user_position: emp.jabatan_saat_ini,
      date: targetDate,
      attended_at: index % 2 === 0 ? new Date().toISOString() : null,
      status: index % 2 === 0 ? 'attended' : 'not_attended',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  },
  
  // Calculate attendance statistics
  calculateAttendanceStats(attendances, totalEmployees) {
    const attendedUsers = attendances.filter(a => a.status === 'attended');
    const notAttendedUsers = attendances.filter(a => a.status === 'not_attended');
    
    return {
      total_users: totalEmployees,
      attended_users: attendedUsers.length,
      not_attended_users: notAttendedUsers.length,
      attendance_rate: Math.round((attendedUsers.length / totalEmployees) * 100)
    };
  }
};

export default developmentConfig; 