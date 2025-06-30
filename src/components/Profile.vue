<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>Profil Pengguna</h1>
      <p>Kelola informasi profil Anda</p>
    </div>

    <div class="profile-content">
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-avatar-section">
          <div class="profile-avatar">
            <img v-if="userProfile.avatar" 
                 :src="userProfile.avatar" 
                 alt="Profile Avatar" 
                 class="avatar-image" />
            <span v-else class="avatar-text">{{ userInitials }}</span>
          </div>
          <div class="avatar-actions">
            <button class="change-avatar-btn" @click="changeAvatar" :disabled="uploading">
              <span v-if="uploading" class="loading-spinner">⏳</span>
              <span v-else class="icon">📷</span>
              {{ uploading ? 'Mengunggah...' : 'Ubah Foto' }}
            </button>
            <button v-if="userProfile.avatar" 
                    class="delete-avatar-btn" 
                    @click="deleteAvatar" 
                    :disabled="uploading">
              <span class="icon">🗑️</span>
              Hapus Foto
            </button>
          </div>
        </div>

        <div class="profile-info">
          <div class="info-group">
            <label>Nama Lengkap</label>
            <div class="info-field">
              <span>{{ userProfile.name }}</span>
            </div>
          </div>

          <div class="info-group">
            <label>Email</label>
            <div class="info-field">
              <span>{{ userProfile.email }}</span>
            </div>
          </div>

          <div class="info-group">
            <label>Nomor Telepon</label>
            <div class="info-field">
              <span>{{ userProfile.phone }}</span>
            </div>
          </div>

          <div class="info-group">
            <label>Bergabung Sejak</label>
            <div class="info-field">
              <span>{{ formatDate(userProfile.created_at) }}</span>
            </div>
          </div>


        </div>
      </div>

      <!-- Security Section -->
      <div class="security-card">
        <h3>Keamanan</h3>
        <div class="security-item">
          <div class="security-info">
            <h4>Ubah Password</h4>
            <p>Pastikan akun Anda menggunakan password yang kuat</p>
          </div>
          <button class="security-btn" @click="showChangePassword = true">
            <span class="icon">🔒</span>
            Ubah Password
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePassword" class="modal-overlay" @click="closeChangePassword">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Ubah Password</h3>
          <button class="close-btn" @click="closeChangePassword">✕</button>
        </div>
        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label>Password Lama</label>
            <input 
              v-model="passwordForm.currentPassword" 
              type="password" 
              class="form-input"
              placeholder="Masukkan password lama"
              required
            />
          </div>
          <div class="form-group">
            <label>Password Baru</label>
            <input 
              v-model="passwordForm.newPassword" 
              type="password" 
              class="form-input"
              placeholder="Masukkan password baru (minimal 8 karakter)"
              required
              minlength="8"
            />
          </div>
          <div class="form-group">
            <label>Konfirmasi Password Baru</label>
            <input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              class="form-input"
              placeholder="Konfirmasi password baru"
              required
            />
          </div>
          <div v-if="passwordErrors.general" class="error-message">
            {{ passwordErrors.general }}
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn" :disabled="passwordLoading">
              <span v-if="passwordLoading" class="loading-spinner">⏳</span>
              <span v-else class="icon">🔒</span>
              {{ passwordLoading ? 'Mengubah...' : 'Ubah Password' }}
            </button>
            <button type="button" class="cancel-btn" @click="closeChangePassword">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Hidden file input for avatar upload -->
    <input 
      ref="fileInput"
      type="file" 
      accept="image/*" 
      style="display: none"
      @change="handleAvatarUpload"
    />
  </div>
</template>

<script>
import authService from '../services/authService'

export default {
  name: 'Profile',
  data() {
    return {
      uploading: false,
      passwordLoading: false,
      showChangePassword: false,
      passwordErrors: {},
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // Reactive user data untuk auto-update
      userProfileData: null,
      profileUpdateKey: 0 // Key untuk force re-render
    }
  },
  async mounted() {
    // Load initial user data
    this.loadUserData()
    
    // Refresh user data saat komponen dimount
    await this.refreshUserData()
    
    // Listen for storage changes
    window.addEventListener('storage', this.handleStorageChange)
    
    // Listen for profile updates from other components
    window.addEventListener('profile-updated', this.handleProfileUpdate)
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('profile-updated', this.handleProfileUpdate)
  },
  computed: {
    userProfile() {
      // Force reactivity dengan profileUpdateKey
      this.profileUpdateKey
      
      // Gunakan reactive data jika tersedia
      if (this.userProfileData) {
        return this.userProfileData
      }
      
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          return this.getDefaultProfile()
        }
        
        const user = JSON.parse(userStr)
        
        // Pastikan menggunakan data terbaru dari database
        const profile = {
          name: user.name || user.fullName || user.username || 'Admin',
          email: user.email || 'admin@example.com',
          phone: user.phone || user.phoneNumber || '-',
          created_at: user.created_at || user.createdAt || new Date().toISOString(),
          avatar: user.profile_picture ? `http://127.0.0.1:8000/storage/${user.profile_picture}` : null
        }
        
        // Update reactive data
        this.userProfileData = profile
        return profile
      } catch (error) {
        console.warn('Error parsing user data:', error)
        return this.getDefaultProfile()
      }
    },
    userInitials() {
      const name = this.userProfile.name || 'Admin'
      return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
    }
  },
  methods: {
    getDefaultProfile() {
      return {
        name: 'Admin',
        email: 'admin@example.com',
        phone: '-',
        created_at: new Date().toISOString(),
        avatar: null
      }
    },
    loadUserData() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          const user = JSON.parse(userStr)
          this.userProfileData = {
            name: user.name || user.fullName || user.username || 'Admin',
            email: user.email || 'admin@example.com',
            phone: user.phone || user.phoneNumber || '-',
            created_at: user.created_at || user.createdAt || new Date().toISOString(),
            avatar: user.profile_picture ? `http://127.0.0.1:8000/storage/${user.profile_picture}` : null
          }
        }
      } catch (error) {
        console.warn('Error loading user data:', error)
        this.userProfileData = this.getDefaultProfile()
      }
    },
    
    async refreshUserData() {
      try {
        const result = await authService.refreshUserData()
        if (result.success) {
          this.loadUserData()
          this.profileUpdateKey++
        }
      } catch (error) {
        console.warn('Failed to refresh user data:', error)
      }
    },
    
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.loadUserData()
        this.profileUpdateKey++
      }
    },
    
    handleProfileUpdate(event) {
      // Handle custom profile update events
      this.loadUserData()
      this.profileUpdateKey++
    },
    

    
    changeAvatar() {
      this.$refs.fileInput.click()
    },
    
    async handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB.')
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar.')
        return
      }
      
      this.uploading = true
      
      try {
        const result = await authService.uploadProfilePicture(file)
        
        if (result.success) {
          // Update reactive data immediately
          this.loadUserData()
          this.profileUpdateKey++
          
          // Force update komponen
          this.$forceUpdate()
          
          // Dispatch custom event untuk komponen lain
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: result.data
          }))
          
          // Emit event untuk komponen parent jika ada
          this.$emit('profile-updated', result.data)
          
          // Show success message setelah update
          this.$nextTick(() => {
            alert('Foto profil berhasil diubah!')
          })
          
        } else {
          alert(result.message || 'Gagal mengunggah foto profil')
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        alert('Gagal mengunggah foto profil. Silakan coba lagi.')
      } finally {
        this.uploading = false
        // Reset file input
        event.target.value = ''
      }
    },
    
    async deleteAvatar() {
      if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) {
        return
      }
      
      this.uploading = true
      
      try {
        const result = await authService.deleteProfilePicture()
        
        if (result.success) {
          // Update reactive data immediately
          this.loadUserData()
          this.profileUpdateKey++
          
          // Force update komponen
          this.$forceUpdate()
          
          // Dispatch custom event untuk komponen lain
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: result.data
          }))
          
          // Emit event untuk komponen parent jika ada
          this.$emit('profile-updated', result.data)
          
          // Show success message setelah update
          this.$nextTick(() => {
            alert('Foto profil berhasil dihapus!')
          })
          
        } else {
          alert(result.message || 'Gagal menghapus foto profil')
        }
      } catch (error) {
        console.error('Error deleting avatar:', error)
        alert('Gagal menghapus foto profil. Silakan coba lagi.')
      } finally {
        this.uploading = false
      }
    },
    
    closeChangePassword() {
      this.showChangePassword = false
      this.passwordErrors = {}
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    
    async changePassword() {
      this.passwordErrors = {}
      
      // Validate passwords
      if (this.passwordForm.newPassword.length < 8) {
        this.passwordErrors.general = 'Password baru minimal 8 karakter'
        return
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordErrors.general = 'Password baru dan konfirmasi password tidak cocok!'
        return
      }
      
      this.passwordLoading = true
      
      try {
        // Simulate API call for changing password
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        alert('Password berhasil diubah!')
        this.closeChangePassword()
      } catch (error) {
        console.error('Error changing password:', error)
        this.passwordErrors.general = 'Gagal mengubah password. Silakan coba lagi.'
      } finally {
        this.passwordLoading = false
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        return '-'
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.profile-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card, .security-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  overflow: hidden;
}

.avatar-text {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.change-avatar-btn, .delete-avatar-btn {
  background: var(--bg-tertiary);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.change-avatar-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.delete-avatar-btn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.delete-avatar-btn:hover:not(:disabled) {
  background: #fee2e2;
}

.change-avatar-btn:disabled, .delete-avatar-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.info-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-field span {
  color: #1e3a8a;
  font-weight: 500;
}



.security-card h3 {
  margin-bottom: 1.5rem;
  color: #1e3a8a;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Perbaiki security item */
.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-tertiary); /* Ganti dari #f8fafc */
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.security-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary); /* Ganti dari #374151 */
  font-size: 1rem;
  font-weight: 600;
}

.security-info p {
  margin: 0;
  color: var(--text-secondary); /* Ganti dari #64748b */
  font-size: 0.875rem;
}

/* Perbaiki form input */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Perbaiki info field */
.info-field span {
  color: var(--text-primary);
  font-weight: 500;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.edit-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.edit-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.save-btn {
  background: #3b82f6;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2563eb;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f3f4f6;
  color: var(--text-primary);
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.security-card h3 {
  margin-bottom: 1.5rem;
  color: #1e3a8a;
  font-size: 1.25rem;
  font-weight: 600;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.security-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.security-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.security-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.security-btn:hover {
  background: #b91c1c;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
}

.close-btn:hover {
  color: var(--text-primary);
}

.password-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.icon {
  font-size: 1rem;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
  
  .profile-card, .security-card {
    padding: 1.5rem;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  

  
  .modal-actions {
    flex-direction: column;
  }
  
  .avatar-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .change-avatar-btn, .delete-avatar-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
