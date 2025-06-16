# Implementasi Sistem Autentikasi Vue.js dengan OTP

## Overview
Sistem autentikasi lengkap untuk aplikasi HRD dengan fitur:
- Login dengan email atau nomor handphone
- Registrasi dengan verifikasi OTP via Fonnte
- Forgot Password dengan verifikasi OTP
- Navigation Guards untuk proteksi route

## Komponen yang Dibuat

### 1. Komponen Autentikasi

#### `src/components/auth/Login.vue`
- Form login dengan email/nomor handphone dan password
- Validasi input dan error handling
- Integrasi dengan authService
- Responsive design dengan gradient background

#### `src/components/auth/Register.vue`
- Proses registrasi 3 langkah:
  1. Input nomor handphone
  2. Verifikasi OTP
  3. Input data lengkap (nama, email, password)
- Step indicator visual
- Cooldown timer untuk resend OTP
- Validasi komprehensif

#### `src/components/auth/ForgotPassword.vue`
- Proses reset password 3 langkah:
  1. Input nomor handphone
  2. Verifikasi OTP
  3. Input password baru
- Konfirmasi password
- Success page dengan redirect ke login

#### `src/components/auth/OTPVerification.vue`
- Komponen reusable untuk verifikasi OTP
- 6 input field untuk digit OTP
- Auto-focus dan navigation dengan keyboard
- Support paste 6 digit sekaligus
- Auto-verify ketika semua digit terisi

### 2. Service Layer

#### `src/services/authService.js`
- Centralized API calls untuk autentikasi
- Axios interceptors untuk token management
- Error handling yang konsisten
- Methods:
  - `login(identifier, password)`
  - `sendRegistrationOTP(phone)`
  - `verifyRegistrationOTP(phone, otp, token)`
  - `resendRegistrationOTP(phone)`
  - `register(userData)`
  - `sendResetPasswordOTP(phone)`
  - `verifyResetPasswordOTP(phone, otp, token)`
  - `resendResetPasswordOTP(phone)`
  - `resetPassword(phone, newPassword, token)`
  - `logout()`
  - `isAuthenticated()`
  - `getCurrentUser()`
  - `getToken()`
  - `refreshToken()`

### 3. Router Configuration

#### `src/router/index.js`
- Route definitions untuk semua komponen auth
- Navigation guards:
  - `requiresAuth`: Proteksi route yang memerlukan login
  - `requiresGuest`: Redirect ke dashboard jika sudah login
- Auto-redirect ke login jika tidak authenticated
- Auto-redirect ke dashboard jika sudah authenticated

### 4. Layout Updates

#### `src/components/Layout.vue`
- Fungsi logout dengan konfirmasi
- Display nama user dari localStorage
- Clear token dan redirect ke login saat logout

## Integrasi dengan Backend

### API Endpoints yang Dibutuhkan

```javascript
// Authentication
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token

// Registration
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/resend-otp
POST /api/auth/register

// Password Reset
POST /api/auth/forgot-password
POST /api/auth/verify-reset-otp
POST /api/auth/resend-reset-otp
POST /api/auth/reset-password
```

### Integrasi Fonnte untuk OTP

Backend harus mengintegrasikan dengan Fonnte API untuk mengirim OTP:

```javascript
// Contoh implementasi backend (Node.js)
const axios = require('axios');

const sendOTP = async (phone, otp) => {
  try {
    const response = await axios.post('https://api.fonnte.com/send', {
      target: phone,
      message: `Kode OTP Anda: ${otp}. Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`,
      countryCode: '62'
    }, {
      headers: {
        'Authorization': process.env.FONNTE_TOKEN
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error('Gagal mengirim OTP');
  }
};
```

## Environment Variables

Tambahkan di `.env`:

```env
VUE_APP_API_URL=http://localhost:3000/api
```

## Fitur Keamanan

### 1. Token Management
- JWT token disimpan di localStorage
- Auto-refresh token sebelum expired
- Auto-logout jika token invalid

### 2. Input Validation
- Validasi format nomor handphone Indonesia
- Validasi format email
- Password minimal 6 karakter
- Sanitasi input untuk mencegah XSS

### 3. OTP Security
- OTP 6 digit random
- Expired dalam 5 menit
- Rate limiting untuk prevent spam
- Token sekali pakai untuk setiap OTP session

### 4. Route Protection
- Navigation guards untuk semua protected routes
- Auto-redirect berdasarkan authentication status
- Prevent access ke auth pages jika sudah login

## Styling dan UX

### 1. Design System
- Gradient background yang konsisten
- Card-based layout dengan shadow
- Color scheme: Blue (#667eea) to Purple (#764ba2)
- Responsive design untuk mobile dan desktop

### 2. User Experience
- Loading states untuk semua async operations
- Error messages yang jelas dan helpful
- Success feedback untuk completed actions
- Step indicators untuk multi-step processes
- Auto-focus dan keyboard navigation

### 3. Accessibility
- Proper form labels
- Error messages dengan ARIA attributes
- Keyboard navigation support
- High contrast colors

## Testing

### Manual Testing Checklist

#### Login
- [ ] Login dengan email valid
- [ ] Login dengan nomor handphone valid
- [ ] Error handling untuk credentials salah
- [ ] Redirect ke dashboard setelah login sukses
- [ ] Remember login state setelah refresh

#### Register
- [ ] Input nomor handphone dan kirim OTP
- [ ] Verifikasi OTP yang benar
- [ ] Error handling untuk OTP salah/expired
- [ ] Resend OTP dengan cooldown
- [ ] Complete registration dengan data valid
- [ ] Error handling untuk email/phone sudah terdaftar

#### Forgot Password
- [ ] Input nomor handphone terdaftar
- [ ] Verifikasi OTP reset password
- [ ] Set password baru
- [ ] Success page dan redirect ke login
- [ ] Error handling untuk nomor tidak terdaftar

#### Navigation
- [ ] Protected routes redirect ke login jika tidak auth
- [ ] Auth pages redirect ke dashboard jika sudah login
- [ ] Logout clear session dan redirect ke login

## Deployment Notes

1. **Environment Setup**
   - Set `VUE_APP_API_URL` untuk production API
   - Configure CORS di backend untuk frontend domain

2. **Backend Requirements**
   - Implement semua API endpoints
   - Setup Fonnte integration
   - Database schema untuk users dan OTP sessions
   - Rate limiting untuk OTP endpoints

3. **Security Considerations**
   - HTTPS untuk production
   - Secure token storage (consider httpOnly cookies)
   - Input sanitization di backend
   - Rate limiting untuk login attempts

## Future Enhancements

1. **Two-Factor Authentication**
   - Optional 2FA dengan authenticator apps
   - Backup codes untuk recovery

2. **Social Login**
   - Google OAuth integration
   - Facebook login

3. **Enhanced Security**
   - Device fingerprinting
   - Suspicious activity detection
   - Account lockout policies

4. **User Experience**
   - Remember device untuk skip OTP
   - Biometric authentication support
   - Progressive Web App features

## Support

Untuk pertanyaan atau issues, silakan hubungi tim development atau buat issue di repository project.