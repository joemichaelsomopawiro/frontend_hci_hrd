import axios from 'axios'

// Base URL untuk API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// Axios instance dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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
      // Token expired atau invalid - hanya redirect jika bukan di halaman login
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/forgot-password') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

class AuthService {
  // Login dengan email/phone dan password
  async login(identifier, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        login: identifier,
        password
      })
      
      // Backend mengembalikan nested structure: response.data.data
      const { user, token } = response.data.data
      
      // Simpan token dan user data dari response login
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Debug log untuk memastikan data tersimpan
      console.log('Login successful - User data:', user)
      console.log('Login successful - Token:', token)
      
      // Trigger storage event untuk update UI
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(user)
      }))
      
      return { success: true, data: { token, user } }
    } catch (error) {
      console.error('Login error:', error.response?.data)
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
        phone
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
  async verifyRegistrationOTP(phone, otp_code) {
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        phone,
        otp_code
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
      const response = await apiClient.post('/auth/register', {
        phone: userData.phone,
        name: userData.fullName,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password
      })
      
      // Backend mengembalikan nested structure: response.data.data
      const { user, token } = response.data.data
      
      // Simpan token dan user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Debug log untuk memastikan data tersimpan
      console.log('Register successful - User data:', user)
      console.log('Register successful - Token:', token)
      
      // Trigger storage event untuk update UI
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(user)
      }))
      
      return {
        success: true,
        data: { token, user }
      }
    } catch (error) {
      // For validation errors (422), throw the error to be handled by the component
      if (error.response?.status === 422) {
        throw error;
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registrasi gagal'
      }
    }
  }
  
  // Kirim OTP untuk reset password
  async sendResetPasswordOTP(phone) {
    try {
      const response = await apiClient.post('/auth/send-forgot-password-otp', {
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
  
  // Kirim ulang OTP untuk reset password
  async resendResetPasswordOTP(phone) {
    try {
      const response = await apiClient.post('/auth/resend-otp', {
        phone,
        type: 'forgot_password'
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
  
  // Reset password dengan OTP
  async resetPassword(phone, otp_code, password, password_confirmation) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        phone,
        otp_code,
        password,
        password_confirmation
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
      console.warn('Logout API call failed:', error.message)
    } finally {
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
    try {
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.warn('Error parsing user data:', error)
      return null
    }
  }
  
  // Get token
  getToken() {
    return localStorage.getItem('token')
  }
  
  // Fetch user profile from API
  async fetchUserProfile() {
    try {
      const response = await apiClient.get('/auth/me')
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengambil data user'
      }
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData()
      formData.append('profile_picture', file)
      
      const response = await apiClient.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update user data di localStorage dengan foto profil baru
      const currentUser = this.getCurrentUser()
      if (currentUser && response.data.data?.profile_picture_url) {
        currentUser.profile_picture = response.data.data.profile_picture_url
        localStorage.setItem('user', JSON.stringify(currentUser))
        
        // Trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(currentUser)
        }))
      }
      
      return {
        success: true,
        data: currentUser
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengunggah foto profil'
      }
    }
  }

  // Delete profile picture
  async deleteProfilePicture() {
    try {
      const response = await apiClient.delete('/auth/delete-profile-picture')
      
      // Update user data di localStorage
      const currentUser = this.getCurrentUser()
      if (currentUser) {
        currentUser.profile_picture = null
        localStorage.setItem('user', JSON.stringify(currentUser))
        
        // Trigger storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(currentUser)
        }))
      }
      
      return {
        success: true,
        data: currentUser
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menghapus foto profil'
      }
    }
  }

  // Refresh user data in localStorage
  async refreshUserData() {
    try {
      const result = await this.fetchUserProfile()
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.data))
        
        // Trigger storage event untuk update UI
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(result.data)
        }))
        
        return result
      }
      return result
    } catch (error) {
      console.warn('Failed to refresh user data:', error)
      return { success: false, message: 'Failed to refresh user data' }
    }
  }
}

// Export instance
export default new AuthService()

// Export class untuk testing
export { AuthService }

// Export axios instance untuk digunakan di service lain
export { apiClient }
