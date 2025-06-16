<template>
  <div class="otp-container">
    <div class="otp-card">
      <div class="otp-header">
        <div class="otp-icon">📱</div>
        <h2>Verifikasi OTP</h2>
        <p>Masukkan kode 6 digit yang telah dikirim ke</p>
        <p class="phone-number">{{ phoneNumber }}</p>
      </div>

      <form @submit.prevent="handleVerifyOTP" class="otp-form">
        <div class="otp-input-group">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :ref="el => otpInputs[index] = el"
            v-model="otpDigits[index]"
            type="text"
            maxlength="1"
            class="otp-input"
            :class="{ 'error': hasError }"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="otp-actions">
          <button
            type="button"
            class="resend-button"
            @click="handleResendOTP"
            :disabled="resendCooldown > 0 || loading"
          >
            {{ resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : 'Kirim Ulang OTP' }}
          </button>
        </div>

        <button
          type="submit"
          class="verify-button"
          :disabled="!isOTPComplete || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Memverifikasi...' : 'Verifikasi' }}
        </button>

        <button
          type="button"
          class="back-button"
          @click="$emit('back')"
        >
          Kembali
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OTPVerification',
  props: {
    phoneNumber: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  emits: ['verify', 'resend', 'back'],
  data() {
    return {
      otpDigits: ['', '', '', '', '', ''],
      otpInputs: [],
      resendCooldown: 0,
      hasError: false
    }
  },
  computed: {
    isOTPComplete() {
      return this.otpDigits.every(digit => digit !== '')
    },
    otpCode() {
      return this.otpDigits.join('')
    }
  },
  watch: {
    errorMessage(newVal) {
      this.hasError = !!newVal
      if (newVal) {
        // Clear OTP when there's an error
        this.clearOTP()
      }
    }
  },
  mounted() {
    // Focus on first input
    this.$nextTick(() => {
      if (this.otpInputs[0]) {
        this.otpInputs[0].focus()
      }
    })
    
    // Start cooldown if needed
    this.startResendCooldown()
  },
  methods: {
    handleInput(index, event) {
      const value = event.target.value
      
      // Only allow numbers
      if (!/^[0-9]$/.test(value) && value !== '') {
        event.target.value = ''
        this.otpDigits[index] = ''
        return
      }
      
      this.otpDigits[index] = value
      this.hasError = false
      
      // Move to next input if current is filled
      if (value && index < 5) {
        this.$nextTick(() => {
          if (this.otpInputs[index + 1]) {
            this.otpInputs[index + 1].focus()
          }
        })
      }
      
      // Auto-verify when all digits are filled
      if (this.isOTPComplete) {
        this.$nextTick(() => {
          this.handleVerifyOTP()
        })
      }
    },
    
    handleKeydown(index, event) {
      // Handle backspace
      if (event.key === 'Backspace') {
        if (this.otpDigits[index] === '' && index > 0) {
          // Move to previous input if current is empty
          this.$nextTick(() => {
            if (this.otpInputs[index - 1]) {
              this.otpInputs[index - 1].focus()
            }
          })
        }
      }
      
      // Handle arrow keys
      if (event.key === 'ArrowLeft' && index > 0) {
        this.$nextTick(() => {
          if (this.otpInputs[index - 1]) {
            this.otpInputs[index - 1].focus()
          }
        })
      }
      
      if (event.key === 'ArrowRight' && index < 5) {
        this.$nextTick(() => {
          if (this.otpInputs[index + 1]) {
            this.otpInputs[index + 1].focus()
          }
        })
      }
    },
    
    handlePaste(event) {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')
      
      // Only process if it's 6 digits
      if (/^[0-9]{6}$/.test(pastedData)) {
        const digits = pastedData.split('')
        this.otpDigits = digits
        
        // Focus on last input
        this.$nextTick(() => {
          if (this.otpInputs[5]) {
            this.otpInputs[5].focus()
          }
          
          // Auto-verify
          this.handleVerifyOTP()
        })
      }
    },
    
    handleVerifyOTP() {
      if (!this.isOTPComplete) return
      
      this.$emit('verify', this.otpCode)
    },
    
    handleResendOTP() {
      this.clearOTP()
      this.startResendCooldown()
      this.$emit('resend')
    },
    
    clearOTP() {
      this.otpDigits = ['', '', '', '', '', '']
      this.$nextTick(() => {
        if (this.otpInputs[0]) {
          this.otpInputs[0].focus()
        }
      })
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
.otp-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.otp-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.otp-header {
  text-align: center;
  margin-bottom: 30px;
}

.otp-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.otp-header h2 {
  color: #1a202c;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.otp-header p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 4px;
}

.phone-number {
  color: #667eea !important;
  font-weight: 600 !important;
  font-size: 16px !important;
}

.otp-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.otp-input-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 10px;
}

.otp-input {
  width: 48px;
  height: 56px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  transition: all 0.2s;
}

.otp-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.otp-input.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  text-align: center;
  margin-top: -10px;
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
  padding: 8px 16px;
}

.resend-button:disabled {
  color: #718096;
  cursor: not-allowed;
  text-decoration: none;
}

.resend-button:hover:not(:disabled) {
  color: #5a67d8;
}

.verify-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.verify-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.verify-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

@media (max-width: 480px) {
  .otp-card {
    padding: 30px 20px;
  }
  
  .otp-input-group {
    gap: 8px;
  }
  
  .otp-input {
    width: 40px;
    height: 48px;
    font-size: 18px;
  }
  
  .otp-header h2 {
    font-size: 20px;
  }
}
</style>