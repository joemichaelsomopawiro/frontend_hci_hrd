<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-section">
          <img src="/hopechannel.jpg" alt="Hope Channel" class="auth-logo" />
          <h2>Masuk ke Akun Anda</h2>
          <p>Silakan masuk dengan email atau nomor handphone</p>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="identifier">Email atau Nomor Handphone</label>
          <input
            id="identifier"
            v-model="form.identifier"
            type="text"
            placeholder="Masukkan email atau nomor handphone"
            :class="{ 'error': errors.identifier }"
            required
          />
          <span v-if="errors.identifier" class="error-message">{{ errors.identifier }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password"
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
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>

        <div class="auth-footer">
          <p>
            Belum punya akun?
            <router-link to="/register" class="auth-link">Daftar di sini</router-link>
          </p>
        </div>
      </form>
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
    
    async handleLogin() {
      if (!this.validateForm()) return
      
      this.loading = true
      
      try {
        const result = await authService.login(this.form.identifier, this.form.password)
        
        if (result.success) {
          // Redirect ke dashboard
          this.$router.push('/')
        } else {
          // Handle error
          if (result.message.includes('tidak ditemukan') || result.message.includes('salah')) {
            this.errors.password = 'Email/nomor handphone atau password salah'
          } else {
            this.errors.general = result.message || 'Terjadi kesalahan. Silakan coba lagi.'
          }
        }
      } catch (error) {
        this.errors.general = 'Terjadi kesalahan. Silakan coba lagi.'
      } finally {
        this.loading = false
      }
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
  max-width: 400px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
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
}
</style>