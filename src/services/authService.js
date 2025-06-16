import axios from 'axios'

// Base URL untuk API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Axios instance dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor untuk handle error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

class AuthService {
  // Login dengan email/phone dan password
  async login(identifier, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        identifier,
        password
      })
      
      const { token, user } = response.data
      
      // Simpan token dan user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { success: true, data: { token, user } }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal'
      }
    }
  }
  
  // Kirim OTP untuk registrasi
  async sendRegistrationOTP(phone) {
    try {
      const response = await apiClient.post('/auth/send-register-otp', {
        phone,
        type: 'register'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim OTP'
      }
    }
  }
  
  // Verifikasi OTP untuk registrasi
  async verifyRegistrationOTP(phone, otp, token) {
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        phone,
        otp_code,
        type: 'register'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verifikasi OTP gagal'
      }
    }
  }
  
  // Kirim ulang OTP untuk registrasi
  async resendRegistrationOTP(phone) {
    try {
      const response = await apiClient.post('/auth/resend-otp', {
        phone,
        type: 'register'
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim ulang OTP'
      }
    }
  }
  
  // Registrasi user baru
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      
      const { token, user } = response.data
      
      // Simpan token dan user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return {
        success: true,
        data: { token, user }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registrasi gagal'
      }
    }
  }
  
  // Kirim OTP untuk reset password
  async sendResetPasswordOTP(phone) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        phone
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim OTP reset password'
      }
    }
  }
  
  // Verifikasi OTP untuk reset password
  async verifyResetPasswordOTP(phone, otp, token) {
    try {
      const response = await apiClient.post('/auth/verify-reset-otp', {
        phone,
        otp,
        token
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verifikasi OTP reset password gagal'
      }
    }
  }
  
  // Kirim ulang OTP untuk reset password
  async resendResetPasswordOTP(phone) {
    try {
      const response = await apiClient.post('/auth/resend-reset-otp', {
        phone
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim ulang OTP reset password'
      }
    }
  }
  
  // Reset password
  async resetPassword(phone, newPassword, token) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        phone,
        newPassword,
        token
      })
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Reset password gagal'
      }
    }
  }
  
  // Logout
  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Ignore error, just clear local storage
      console.warn('Logout API call failed:', error.message)
    } finally {
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
  }
  
  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
  
  // Get token
  getToken() {
    return localStorage.getItem('token')
  }
  
  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh-token')
      
      const { token } = response.data
      localStorage.setItem('token', token)
      
      return {
        success: true,
        data: { token }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Refresh token gagal'
      }
    }
  }
}

// Export instance
export default new AuthService()

// Export class untuk testing
export { AuthService }

// Export axios instance untuk digunakan di service lain
export { apiClient }