<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-section">
          <img src="/hopechannel.jpg" alt="Hope Channel" class="auth-logo" />
          <h2>Daftar Akun Baru</h2>
          <p>{{ currentStep === 1 ? 'Masukkan nomor handphone untuk verifikasi' : currentStep === 2 ? 'Masukkan kode OTP yang dikirim' : 'Lengkapi data diri Anda' }}</p>
        </div>
      </div>

      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Verifikasi HP</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Kode OTP</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <span class="step-number">3</span>
          <span class="step-label">Data Diri</span>
        </div>
      </div>

      <!-- Step 1: Phone Number Verification -->
      <form v-if="currentStep === 1" @submit.prevent="sendOTP" class="auth-form">
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
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Mengirim OTP...' : 'Kirim Kode OTP' }}
        </button>
      </form>

      <!-- Step 2: OTP Verification -->
      <form v-if="currentStep === 2" @submit.prevent="verifyOTP" class="auth-form">
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
            @click="resendOTP"
            :disabled="resendCooldown > 0 || loading"
          >
            {{ resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : 'Kirim Ulang OTP' }}
          </button>
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Memverifikasi...' : 'Verifikasi OTP' }}
        </button>

        <button
          type="button"
          class="back-button"
          @click="currentStep = 1"
        >
          Kembali
        </button>
      </form>

      <!-- Step 3: Complete Registration -->
      <form v-if="currentStep === 3" @submit.prevent="completeRegistration" class="auth-form">
        <div class="form-group">
          <label for="fullName">Nama Lengkap</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            placeholder="Masukkan nama lengkap"
            :class="{ 'error': errors.fullName }"
            required
          />
          <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Masukkan alamat email"
            :class="{ 'error': errors.email }"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 6 karakter"
              :class="{ 'error': errors.password }"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Konfirmasi Password</label>
          <div class="password-input">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Ulangi password"
              :class="{ 'error': errors.confirmPassword }"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Mendaftar...' : 'Daftar Sekarang' }}
        </button>

        <button
          type="button"
          class="back-button"
          @click="currentStep = 2"
        >
          Kembali
        </button>
      </form>

      <div class="auth-footer">
        <p>
          Sudah punya akun?
          <router-link to="/login" class="auth-link">Masuk di sini</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../../services/authService'

export default {
  name: 'Register',
  data() {
    return {
      currentStep: 1,
      form: {
        phone: '',
        otp: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {},
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      resendCooldown: 0,
      otpToken: ''
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
      this.errors = {}
      
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
    
    validateRegistration() {
      this.errors = {}
      
      if (!this.form.fullName.trim()) {
        this.errors.fullName = 'Nama lengkap harus diisi'
      }
      
      if (!this.form.email.trim()) {
        this.errors.email = 'Email harus diisi'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(this.form.email)) {
          this.errors.email = 'Format email tidak valid'
        }
      }
      
      if (!this.form.password) {
        this.errors.password = 'Password harus diisi'
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password minimal 6 karakter'
      }
      
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = 'Konfirmasi password harus diisi'
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Password tidak cocok'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async sendOTP() {
      if (!this.validatePhone()) return
      
      this.loading = true
      
      try {
        const result = await authService.sendRegistrationOTP(this.form.phone)
        
        if (result.success) {
          this.otpToken = result.data.token
          this.currentStep = 2
          this.startResendCooldown()
        } else {
          if (result.message.includes('sudah terdaftar')) {
            this.errors.phone = 'Nomor handphone sudah terdaftar'
          } else {
            this.errors.phone = result.message || 'Gagal mengirim OTP. Silakan coba lagi.'
          }
        }
      } catch (error) {
        this.errors.phone = 'Gagal mengirim OTP. Silakan coba lagi.'
      } finally {
        this.loading = false
      }
    },
    
    async verifyOTP() {
      if (!this.validateOTP()) return
      
      this.loading = true
      
      try {
        const result = await authService.verifyRegistrationOTP(this.form.phone, this.form.otp, this.otpToken)
        
        if (result.success) {
          this.currentStep = 3
        } else {
          this.errors.otp = result.message || 'Kode OTP tidak valid atau sudah kadaluarsa'
        }
      } catch (error) {
        this.errors.otp = 'Gagal memverifikasi OTP. Silakan coba lagi.'
      } finally {
        this.loading = false
      }
    },
    
    async resendOTP() {
      this.loading = true
      
      try {
        const result = await authService.resendRegistrationOTP(this.form.phone)
        
        if (result.success) {
          this.otpToken = result.data.token
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
    
    async completeRegistration() {
      if (!this.validateRegistration()) return
      
      this.loading = true
      
      try {
        const result = await authService.register({
          phone: this.form.phone,
          fullName: this.form.fullName,
          email: this.form.email,
          password: this.form.password,
          otpToken: this.otpToken
        })
        
        if (result.success) {
          // Trigger storage event untuk update UI
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: localStorage.getItem('user')
          }))
          
          // Redirect ke dashboard
          this.$router.push('/')
        } else {
          if (result.message.includes('email') && result.message.includes('sudah')) {
            this.errors.email = 'Email sudah terdaftar'
          } else {
            this.errors.general = result.message || 'Gagal mendaftar. Silakan coba lagi.'
          }
        }
      } catch (error) {
        console.log('Registration error:', error.response?.data); // Debug log
        
        if (error.response?.status === 422 && error.response?.data?.errors) {
          // Handle specific field validation errors
          const errors = error.response.data.errors;
          this.errors = {}; // Clear previous errors
          
          if (errors.email) this.errors.email = errors.email[0];
          if (errors.phone) this.errors.phone = errors.phone[0];
          if (errors.fullName) this.errors.fullName = errors.fullName[0];
          if (errors.name) this.errors.fullName = errors.name[0]; // Backend might expect 'name'
          if (errors.password) this.errors.password = errors.password[0];
          if (errors.otpToken) this.errors.general = 'Token OTP tidak valid atau sudah kadaluarsa';
          
          // If no specific field errors, show general message
          if (Object.keys(this.errors).length === 0) {
            this.errors.general = error.response?.data?.message || 'Data tidak valid';
          }
        } else {
          this.errors.general = error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.';
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
  background: white;
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

.auth-footer {
  text-align: center;
  margin-top: 20px;
}

.auth-footer p {
  color: #718096;
  font-size: 14px;
}

.auth-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
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