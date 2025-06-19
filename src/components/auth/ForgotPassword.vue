<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-section">
          <img src="/hopechannel.jpg" alt="Hope Channel" class="auth-logo" />
          <h2>Reset Password</h2>
          <p>{{ currentStep === 1 ? 'Masukkan nomor handphone untuk reset password' : 'Masukkan kode OTP dan password baru Anda' }}</p>
        </div>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Verifikasi HP</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Reset Password</span>
        </div>
      </div>

      <!-- Step 1: Phone Number Input -->
      <form v-if="currentStep === 1" @submit.prevent="sendResetOTP" class="auth-form">
        <div class="form-group">
          <label for="phone">Nomor Handphone</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            placeholder="Contoh: 08123456789"
            :class="{ 'error': errors.phone }"
            required
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          <p class="help-text">Masukkan nomor handphone yang terdaftar di akun Anda</p>
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Mengirim OTP...' : 'Kirim Kode OTP' }}
        </button>

        <div class="auth-footer">
          <router-link to="/login" class="back-link">
            ← Kembali ke Login
          </router-link>
        </div>
      </form>

      <!-- Step 2: OTP and New Password -->
      <form v-if="currentStep === 2" @submit.prevent="resetPassword" class="auth-form">
        <div class="form-group">
          <label for="otp">Kode OTP</label>
          <input
            id="otp"
            v-model="form.otp"
            type="text"
            placeholder="Masukkan 6 digit kode OTP"
            maxlength="6"
            :class="{ 'error': errors.otp }"
            required
          />
          <span v-if="errors.otp" class="error-message">{{ errors.otp }}</span>
          <p class="otp-info">Kode OTP telah dikirim ke {{ form.phone }}</p>
        </div>

        <div class="otp-actions">
          <button
            type="button"
            class="resend-button"
            @click="resendResetOTP"
            :disabled="resendCooldown > 0 || loading"
          >
            {{ resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : 'Kirim Ulang OTP' }}
          </button>
        </div>
        <div class="form-group">
          <label for="newPassword">Password Baru</label>
          <div class="password-input">
            <input
              id="newPassword"
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Minimal 8 karakter"
              :class="{ 'error': errors.newPassword }"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showNewPassword = !showNewPassword"
            >
              {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
        </div>

        <div class="form-group">
          <label for="confirmNewPassword">Konfirmasi Password Baru</label>
          <div class="password-input">
            <input
              id="confirmNewPassword"
              v-model="form.confirmNewPassword"
              :type="showConfirmNewPassword ? 'text' : 'password'"
              placeholder="Ulangi password baru"
              :class="{ 'error': errors.confirmNewPassword }"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmNewPassword = !showConfirmNewPassword"
            >
              {{ showConfirmNewPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.confirmNewPassword" class="error-message">{{ errors.confirmNewPassword }}</span>
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Mengubah Password...' : 'Ubah Password' }}
        </button>

        <button
          type="button"
          class="back-button"
          @click="currentStep = 1"
        >
          Kembali
        </button>
      </form>

      <!-- Success Message -->
      <div v-if="currentStep === 3" class="success-message">
        <div class="success-icon">✅</div>
        <h3>Password Berhasil Diubah!</h3>
        <p>Password Anda telah berhasil diubah. Silakan login dengan password baru.</p>
        <router-link to="/login" class="auth-button">
          Login Sekarang
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../../services/authService'

export default {
  name: 'ForgotPassword',
  data() {
    return {
      currentStep: 1,
      form: {
        phone: '',
        otp: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      errors: {},
      loading: false,
      showNewPassword: false,
      showConfirmNewPassword: false,
      resendCooldown: 0
    }
  },
  methods: {
    validatePhone() {
      this.errors = {}
      
      if (!this.form.phone.trim()) {
        this.errors.phone = 'Nomor handphone harus diisi'
        return false
      }
      
      // Validasi format nomor handphone Indonesia
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/
      if (!phoneRegex.test(this.form.phone.replace(/\s/g, ''))) {
        this.errors.phone = 'Format nomor handphone tidak valid'
        return false
      }
      
      return true
    },
    
    validateOTP() {
      // Don't clear all errors, only OTP-related ones
      delete this.errors.otp
      
      if (!this.form.otp.trim()) {
        this.errors.otp = 'Kode OTP harus diisi'
        return false
      }
      
      if (this.form.otp.length !== 6) {
        this.errors.otp = 'Kode OTP harus 6 digit'
        return false
      }
      
      return true
    },
    
    validateNewPassword() {
      // Don't clear all errors, only password-related ones
      delete this.errors.newPassword
      delete this.errors.confirmNewPassword
      
      if (!this.form.newPassword) {
        this.errors.newPassword = 'Password baru harus diisi'
      } else if (this.form.newPassword.length < 8) {
        this.errors.newPassword = 'Password minimal 8 karakter'
      }
      
      if (!this.form.confirmNewPassword) {
        this.errors.confirmNewPassword = 'Konfirmasi password harus diisi'
      } else if (this.form.newPassword !== this.form.confirmNewPassword) {
        this.errors.confirmNewPassword = 'Password tidak cocok'
      }
      
      return !this.errors.newPassword && !this.errors.confirmNewPassword
    },
    
    async sendResetOTP() {
      if (!this.validatePhone()) return
      
      this.loading = true
      
      try {
        const result = await authService.sendResetPasswordOTP(this.form.phone)
        console.log('Send Reset OTP Result:', result) // Debug log
        
        if (result.success) {
          this.currentStep = 2
          this.startResendCooldown()
        } else {
          console.error('Send Reset OTP Failed:', result.message) // Debug log
          if (result.message.includes('tidak terdaftar') || result.message.includes('tidak ditemukan')) {
            this.errors.phone = 'Nomor handphone tidak terdaftar'
          } else {
            this.errors.phone = result.message || 'Gagal mengirim OTP. Silakan coba lagi.'
          }
        }
      } catch (error) {
        console.error('Send Reset OTP Error:', error) // Debug log
        this.errors.phone = 'Gagal mengirim OTP. Silakan coba lagi.'
      } finally {
        this.loading = false
      }
    },
    
    async resendResetOTP() {
      this.loading = true
      
      try {
        const result = await authService.resendResetPasswordOTP(this.form.phone)
        
        if (result.success) {
          this.form.otp = ''
          this.startResendCooldown()
        } else {
          this.errors.otp = result.message || 'Gagal mengirim ulang OTP. Silakan coba lagi.'
        }
      } catch (error) {
        this.errors.otp = 'Gagal mengirim ulang OTP. Silakan coba lagi.'
      } finally {
        this.loading = false
      }
    },
    
    async resetPassword() {
      if (!this.validateOTP() || !this.validateNewPassword()) return
      
      this.loading = true
      
      try {
        const result = await authService.resetPassword(
          this.form.phone, 
          this.form.otp, 
          this.form.newPassword, 
          this.form.confirmNewPassword
        )
        
        if (result.success) {
          this.currentStep = 3
        } else {
          // Handle validation errors from backend
          if (result.message && result.message.includes('OTP')) {
            this.errors.otp = result.message
          } else {
            this.errors.newPassword = result.message || 'Gagal mengubah password. Silakan coba lagi.'
          }
        }
      } catch (error) {
        if (error.response?.status === 422 && error.response?.data?.errors) {
          const backendErrors = error.response.data.errors
          if (backendErrors.otp_code) {
            this.errors.otp = backendErrors.otp_code[0]
          }
          if (backendErrors.password) {
            this.errors.newPassword = backendErrors.password[0]
          }
          if (backendErrors.phone) {
            this.errors.phone = backendErrors.phone[0]
          }
        } else {
          this.errors.newPassword = 'Gagal mengubah password. Silakan coba lagi.'
        }
      } finally {
        this.loading = false
      }
    },
    
    startResendCooldown() {
      this.resendCooldown = 60
      const interval = setInterval(() => {
        this.resendCooldown--
        if (this.resendCooldown <= 0) {
          clearInterval(interval)
        }
      }, 1000)
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 20px;
  object-fit: cover;
}

.auth-header h2 {
  color: #1a202c;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.auth-header p {
  color: #718096;
  font-size: 14px;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #667eea;
  color: white;
}

.step.completed .step-number {
  background: #48bb78;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #718096;
  text-align: center;
}

.step.active .step-label {
  color: #667eea;
  font-weight: 500;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 10px;
  transition: background 0.3s;
}

.step-line.completed {
  background: #48bb78;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #2d3748;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input.error {
  border-color: #e53e3e;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

.help-text {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.otp-info {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.otp-actions {
  display: flex;
  justify-content: center;
}

.resend-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.resend-button:disabled {
  color: #718096;
  cursor: not-allowed;
  text-decoration: none;
}

.auth-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-button {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.back-link:hover {
  text-decoration: underline;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.success-message h3 {
  color: #1a202c;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.success-message p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 24px;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
  
  .auth-header h2 {
    font-size: 20px;
  }
  
  .step-indicator {
    padding: 0 10px;
  }
  
  .step-line {
    width: 30px;
    margin: 0 5px;
  }
  
  .step-label {
    font-size: 10px;
  }
}
</style>
