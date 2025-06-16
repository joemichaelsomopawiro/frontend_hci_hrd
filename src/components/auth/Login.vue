<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-section">
            <div class="logo-wrapper">
              <img src="/hopechannel.jpg" alt="Hope Channel" class="auth-logo" />
            </div>
            <h1 class="auth-title">Selamat Datang</h1>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="identifier" class="form-label">
              <svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email atau Nomor Handphone
            </label>
            <div class="input-wrapper">
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                placeholder="Masukkan email atau nomor handphone"
                :class="{ 'error': errors.identifier }"
                class="form-input"
                required
              />
            </div>
            <span v-if="errors.identifier" class="error-message">{{ errors.identifier }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">
              <svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <circle cx="12" cy="16" r="1"></circle>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Password
            </label>
            <div class="input-wrapper password-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                :class="{ 'error': errors.password }"
                class="form-input"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              >
                <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-actions">
            <router-link to="/forgot-password" class="forgot-link">
              Lupa Password?
            </router-link>
          </div>

          <button
            type="submit"
            class="auth-button"
            :disabled="loading"
          >
            <span v-if="loading" class="loading-spinner"></span>
            <span v-if="!loading">Masuk ke Sistem</span>
            <span v-else>Memproses...</span>
          </button>

          <div v-if="errors.general" class="error-message general-error">
            <svg class="error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ errors.general }}
          </div>

          <div class="auth-footer">
            <p class="footer-text">
              Belum memiliki akses?
              <router-link to="/register" class="auth-link">Hubungi Administrator</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../../services/authService'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        identifier: '',
        password: ''
      },
      errors: {},
      loading: false,
      showPassword: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      
      if (!this.form.identifier.trim()) {
        this.errors.identifier = 'Email atau nomor handphone harus diisi'
      }
      
      if (!this.form.password) {
        this.errors.password = 'Password harus diisi'
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password minimal 6 karakter'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async handleLogin(event) {
      // Prevent form submission reload
      if (event) {
        event.preventDefault()
      }
      
      if (!this.validateForm()) return
      
      this.loading = true
      
      try {
        const result = await authService.login(this.form.identifier, this.form.password)
        
        if (result.success) {
          // Redirect ke dashboard
          this.$router.push('/')
        } else {
          // Handle specific error messages
          this.errors = {} // Clear previous errors
          
          if (result.message.includes('password') && result.message.includes('salah')) {
            this.errors.password = 'Password yang Anda masukkan salah'
          } else if (result.message.includes('tidak ditemukan') || result.message.includes('tidak terdaftar')) {
            this.errors.identifier = 'Email atau nomor handphone tidak terdaftar'
          } else if (result.message.includes('kredensial') || result.message.includes('login')) {
            this.errors.password = 'Email/nomor handphone atau password salah'
          } else {
            this.errors.general = result.message || 'Terjadi kesalahan. Silakan coba lagi.'
          }
          
          // Don't clear password field on error - let user try again
          // this.form.password = ''
        }
      } catch (error) {
        console.error('Login error:', error)
        this.errors = {}
        
        if (error.response?.status === 401) {
          this.errors.password = 'Email/nomor handphone atau password salah'
        } else if (error.response?.status === 422 && error.response?.data?.errors) {
          // Handle validation errors from backend
          const backendErrors = error.response.data.errors
          if (backendErrors.login) this.errors.identifier = backendErrors.login[0]
          if (backendErrors.password) this.errors.password = backendErrors.password[0]
        } else {
          this.errors.general = 'Terjadi kesalahan koneksi. Silakan coba lagi.'
        }
        
        // Don't clear password field on error - let user try again
        // this.form.password = ''
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Enterprise Design Variables */
:root {
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --secondary-color: #64748b;
  --error-color: #dc2626;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --border-focus: #2563eb;
  --background-primary: #ffffff;
  --background-secondary: #f8fafc;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--background-secondary);
}

.auth-content {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 40px;
  border: 1px solid var(--border-color);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--background-primary);
  border-radius: 50%;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.auth-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.auth-title {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 13px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.label-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 400;
  color: var(--text-primary);
  background: var(--background-primary);
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.form-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.form-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.form-input.error {
  border-color: var(--error-color);
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: var(--text-primary);
  background: var(--background-secondary);
}

.password-toggle:focus {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.error-message {
  color: var(--error-color);
  font-size: 13px;
  font-weight: 500;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.general-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: 12px;
  margin: 16px 0;
  font-size: 13px;
  font-weight: 400;
  color: var(--error-color);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-icon {
  flex-shrink: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.forgot-link:hover {
  color: var(--primary-dark);
  background: rgba(59, 130, 246, 0.05);
  text-decoration: none;
}

.auth-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.auth-button:hover:not(:disabled) {
  background: var(--primary-dark);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.footer-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}

.auth-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.auth-link:hover {
  color: var(--primary-dark);
  background: rgba(59, 130, 246, 0.05);
  text-decoration: none;
}

/* Responsive Design */
@media (max-width: 640px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 32px 24px;
  }
  
  .auth-title {
    font-size: 20px;
  }
  
  .auth-subtitle {
    font-size: 13px;
  }
  
  .logo-wrapper {
    width: 70px;
    height: 70px;
    margin-bottom: 20px;
  }
  
  .auth-logo {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
  }
  
  .form-input {
    padding: 12px 14px;
    font-size: 14px;
  }
  
  .auth-button {
    padding: 12px 20px;
    min-height: 44px;
  }
}



/* Focus visible for accessibility */
.auth-button:focus-visible,
.form-input:focus-visible,
.forgot-link:focus-visible,
.auth-link:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  * {
    transition: none !important;
  }
}
</style>