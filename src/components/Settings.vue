<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>Pengaturan</h1>
      <p>Kelola preferensi dan konfigurasi aplikasi Anda</p>
    </div>

    <div class="settings-content">
      <!-- Appearance Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>🎨 Tampilan</h3>
          <p>Sesuaikan tampilan aplikasi sesuai preferensi Anda</p>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Tema</h4>
              <p>Pilih tema yang Anda sukai</p>
            </div>
            <select v-model="settings.theme" @change="updateSetting('theme', settings.theme)" class="setting-select">
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
              <option value="auto">Otomatis</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Bahasa</h4>
              <p>Pilih bahasa interface</p>
            </div>
            <select v-model="settings.language" @change="updateSetting('language', settings.language)" class="setting-select">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Ukuran Font</h4>
              <p>Sesuaikan ukuran teks</p>
            </div>
            <select v-model="settings.fontSize" @change="updateSetting('fontSize', settings.fontSize)" class="setting-select">
              <option value="small">Kecil</option>
              <option value="medium">Sedang</option>
              <option value="large">Besar</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-card">
        <div class="card-header">
          <h3>🔔 Notifikasi</h3>
          <p>Atur preferensi notifikasi Anda</p>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Notifikasi Email</h4>
              <p>Terima notifikasi melalui email</p>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="settings.emailNotifications" 
                @change="updateSetting('emailNotifications', settings.emailNotifications)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Notifikasi Push</h4>
              <p>Terima notifikasi push di browser</p>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="settings.pushNotifications" 
                @change="updateSetting('pushNotifications', settings.pushNotifications)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Suara Notifikasi</h4>
              <p>Putar suara saat ada notifikasi</p>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="settings.soundNotifications" 
                @change="updateSetting('soundNotifications', settings.soundNotifications)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Privacy & Security -->
      <div class="settings-card">
        <div class="card-header">
          <h3>🔒 Privasi & Keamanan</h3>
          <p>Kelola pengaturan keamanan akun Anda</p>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Sesi Otomatis Logout</h4>
              <p>Logout otomatis setelah tidak aktif</p>
            </div>
            <select v-model="settings.autoLogout" @change="updateSetting('autoLogout', settings.autoLogout)" class="setting-select">
              <option value="15">15 menit</option>
              <option value="30">30 menit</option>
              <option value="60">1 jam</option>
              <option value="120">2 jam</option>
              <option value="0">Tidak pernah</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Verifikasi Dua Faktor</h4>
              <p>Tambahkan lapisan keamanan ekstra</p>
            </div>
            <button class="security-btn" @click="setup2FA">
              <span class="icon">🔐</span>
              {{ settings.twoFactorEnabled ? 'Kelola 2FA' : 'Aktifkan 2FA' }}
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Riwayat Login</h4>
              <p>Lihat aktivitas login terbaru</p>
            </div>
            <button class="info-btn" @click="viewLoginHistory">
              <span class="icon">📋</span>
              Lihat Riwayat
            </button>
          </div>
        </div>
      </div>

      <!-- Data & Storage -->
      <div class="settings-card">
        <div class="card-header">
          <h3>💾 Data & Penyimpanan</h3>
          <p>Kelola data dan cache aplikasi</p>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Cache Browser</h4>
              <p>Hapus data cache untuk meningkatkan performa</p>
            </div>
            <button class="warning-btn" @click="clearCache">
              <span class="icon">🗑️</span>
              Hapus Cache
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Ekspor Data</h4>
              <p>Unduh data Anda dalam format JSON</p>
            </div>
            <button class="info-btn" @click="exportData">
              <span class="icon">📥</span>
              Ekspor Data
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Backup Otomatis</h4>
              <p>Backup data secara otomatis</p>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="settings.autoBackup" 
                @change="updateSetting('autoBackup', settings.autoBackup)"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-card">
        <div class="card-header">
          <h3>ℹ️ Tentang Aplikasi</h3>
          <p>Informasi aplikasi dan dukungan</p>
        </div>
        
        <div class="settings-group">
          <div class="setting-item">
            <div class="setting-info">
              <h4>Versi Aplikasi</h4>
              <p>{{ appVersion }}</p>
            </div>
            <button class="info-btn" @click="checkUpdates">
              <span class="icon">🔄</span>
              Cek Update
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Bantuan & Dukungan</h4>
              <p>Dapatkan bantuan atau laporkan masalah</p>
            </div>
            <button class="info-btn" @click="openSupport">
              <span class="icon">❓</span>
              Bantuan
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>Kebijakan Privasi</h4>
              <p>Baca kebijakan privasi kami</p>
            </div>
            <button class="info-btn" @click="openPrivacyPolicy">
              <span class="icon">📄</span>
              Baca Kebijakan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      settings: {
        theme: 'light',
        language: 'id',
        fontSize: 'medium',
        emailNotifications: true,
        pushNotifications: true,
        soundNotifications: false,
        autoLogout: '30',
        twoFactorEnabled: false,
        autoBackup: true
      },
      appVersion: '1.0.0'
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    loadSettings() {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
        } catch (error) {
          console.warn('Error loading settings:', error)
        }
      }
    },
    updateSetting(key, value) {
      this.settings[key] = value
      this.saveSettings()
      
      // Apply setting immediately if needed
      this.applySettings(key, value)
    },
    saveSettings() {
      try {
        localStorage.setItem('appSettings', JSON.stringify(this.settings))
      } catch (error) {
        console.error('Error saving settings:', error)
      }
    },
    applySettings(key, value) {
      switch (key) {
        case 'theme':
          this.applyTheme(value)
          break
        case 'fontSize':
          this.applyFontSize(value)
          break
        case 'language':
          this.applyLanguage(value)
          break
      }
    },
    applyTheme(theme) {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme)
      alert(`Tema berhasil diubah ke: ${theme === 'light' ? 'Terang' : theme === 'dark' ? 'Gelap' : 'Otomatis'}`)
    },
    applyFontSize(size) {
      // Apply font size to document
      const sizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px'
      }
      document.documentElement.style.fontSize = sizeMap[size]
      alert(`Ukuran font berhasil diubah ke: ${size === 'small' ? 'Kecil' : size === 'medium' ? 'Sedang' : 'Besar'}`)
    },
    applyLanguage(language) {
      // Apply language
      alert(`Bahasa berhasil diubah ke: ${language === 'id' ? 'Bahasa Indonesia' : 'English'}`)
    },
    setup2FA() {
      alert('Fitur Verifikasi Dua Faktor akan segera tersedia!')
    },
    viewLoginHistory() {
      alert('Fitur Riwayat Login akan segera tersedia!')
    },
    clearCache() {
      if (confirm('Apakah Anda yakin ingin menghapus cache? Ini akan me-refresh halaman.')) {
        // Clear various caches
        localStorage.removeItem('cache')
        sessionStorage.clear()
        
        // Clear service worker cache if available
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name)
            })
          })
        }
        
        alert('Cache berhasil dihapus!')
        window.location.reload()
      }
    },
    exportData() {
      try {
        const userData = {
          user: JSON.parse(localStorage.getItem('user') || '{}'),
          settings: this.settings,
          exportDate: new Date().toISOString()
        }
        
        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        
        alert('Data berhasil diekspor!')
      } catch (error) {
        console.error('Error exporting data:', error)
        alert('Gagal mengekspor data. Silakan coba lagi.')
      }
    },
    checkUpdates() {
      alert('Anda menggunakan versi terbaru!')
    },
    openSupport() {
      alert('Fitur Bantuan & Dukungan akan segera tersedia!')
    },
    openPrivacyPolicy() {
      alert('Fitur Kebijakan Privasi akan segera tersedia!')
    }
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.settings-header p {
  color: #64748b;
  font-size: 1rem;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.card-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.setting-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.setting-info {
  flex: 1;
}

.setting-info h4 {
  margin: 0 0 0.25rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.setting-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.setting-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 120px;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Buttons */
.security-btn, .warning-btn, .info-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  font-size: 0.875rem;
}

.security-btn {
  background: #dc2626;
  color: white;
}

.security-btn:hover {
  background: #b91c1c;
}

.warning-btn {
  background: #f59e0b;
  color: white;
}

.warning-btn:hover {
  background: #d97706;
}

.info-btn {
  background: #3b82f6;
  color: white;
}

.info-btn:hover {
  background: #2563eb;
}

.icon {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    padding: 1rem;
  }
  
  .settings-card {
    padding: 1.5rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-select {
    width: 100%;
  }
  
  .security-btn, .warning-btn, .info-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Dark theme support */
[data-theme="dark"] .settings-card {
  background: #1f2937;
  border-color: #374151;
}

[data-theme="dark"] .setting-item {
  background: #111827;
  border-color: #374151;
}

[data-theme="dark"] .setting-item:hover {
  background: #1f2937;
  border-color: #4b5563;
}

[data-theme="dark"] .card-header h3,
[data-theme="dark"] .setting-info h4 {
  color: #f9fafb;
}

[data-theme="dark"] .card-header p,
[data-theme="dark"] .setting-info p {
  color: #9ca3af;
}

[data-theme="dark"] .setting-select {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}
</style>