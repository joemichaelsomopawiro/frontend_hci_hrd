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
            <img v-if="avatarPreview || userProfile.avatar" 
                 :src="avatarPreview || userProfile.avatar" 
                 alt="Profile Avatar" 
                 class="avatar-image" />
            <span v-else class="avatar-text">{{ userInitials }}</span>
          </div>
          <button class="change-avatar-btn" @click="changeAvatar">
            <span class="icon">📷</span>
            Ubah Foto
          </button>
        </div>

        <div class="profile-info">
          <div class="info-group">
            <label>Nama Lengkap</label>
            <div class="info-field" v-if="!isEditing">
              <span>{{ userProfile.name }}</span>
              <button class="edit-btn" @click="startEditing">
                <span class="icon">✏️</span>
              </button>
            </div>
            <input 
              v-else
              v-model="editForm.name" 
              type="text" 
              class="edit-input"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div class="info-group">
            <label>Email</label>
            <div class="info-field" v-if="!isEditing">
              <span>{{ userProfile.email }}</span>
              <button class="edit-btn" @click="startEditing">
                <span class="icon">✏️</span>
              </button>
            </div>
            <input 
              v-else
              v-model="editForm.email" 
              type="email" 
              class="edit-input"
              placeholder="Masukkan email"
            />
          </div>

          <div class="info-group">
            <label>Nomor Telepon</label>
            <div class="info-field" v-if="!isEditing">
              <span>{{ userProfile.phone }}</span>
              <button class="edit-btn" @click="startEditing">
                <span class="icon">✏️</span>
              </button>
            </div>
            <input 
              v-else
              v-model="editForm.phone" 
              type="tel" 
              class="edit-input"
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <div class="info-group">
            <label>Bergabung Sejak</label>
            <div class="info-field">
              <span>{{ formatDate(userProfile.created_at) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons" v-if="isEditing">
            <button class="save-btn" @click="saveProfile" :disabled="loading">
              <span v-if="loading" class="loading-spinner">⏳</span>
              <span v-else class="icon">💾</span>
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
            <button class="cancel-btn" @click="cancelEditing">
              <span class="icon">❌</span>
              Batal
            </button>
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
              placeholder="Masukkan password baru"
              required
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
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      isEditing: false,
      loading: false,
      passwordLoading: false,
      showChangePassword: false,
      avatarPreview: null,
      editForm: {
        name: '',
        email: '',
        phone: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  mounted() {
    // Initialize avatar preview from localStorage
    try {
      const userStr = localStorage.getItem('user')
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        const user = JSON.parse(userStr)
        if (user.avatar) {
          this.avatarPreview = user.avatar
        }
      }
    } catch (error) {
      console.warn('Error loading avatar:', error)
    }
  },
  computed: {
    userProfile() {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          return {
            name: 'Admin',
            email: 'admin@example.com',
            phone: '-',
            created_at: new Date().toISOString()
          }
        }
        const user = JSON.parse(userStr)
        console.log('Profile user data:', user) // Debug log
        
        // Normalize user data structure
        return {
          name: user.name || user.fullName || user.username || 'Admin',
          email: user.email || 'admin@example.com',
          phone: user.phone || user.phoneNumber || user.telephone || '-',
          created_at: user.created_at || user.createdAt || user.joinDate || new Date().toISOString(),
          avatar: user.avatar || null
        }
      } catch (error) {
        console.warn('Error parsing user data:', error)
        return {
          name: 'Admin',
          email: 'admin@example.com',
          phone: '-',
          created_at: new Date().toISOString()
        }
      }
    },
    userInitials() {
      const name = this.userProfile.name || 'Admin'
      return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
    }
  },
  methods: {
    startEditing() {
      this.isEditing = true
      this.editForm = {
        name: this.userProfile.name || '',
        email: this.userProfile.email || '',
        phone: this.userProfile.phone || ''
      }
    },
    cancelEditing() {
      this.isEditing = false
      this.editForm = {
        name: '',
        email: '',
        phone: ''
      }
    },
    async saveProfile() {
      this.loading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get current user data from localStorage
        const userStr = localStorage.getItem('user')
        let currentUser = {}
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          currentUser = JSON.parse(userStr)
        }
        
        // Update user data while preserving existing fields
        const updatedUser = {
          ...currentUser,
          name: this.editForm.name,
          email: this.editForm.email,
          phone: this.editForm.phone
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        this.isEditing = false
        alert('Profil berhasil diperbarui!')
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Gagal memperbarui profil. Silakan coba lagi.')
      } finally {
        this.loading = false
      }
    },
    changeAvatar() {
      // Create file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (event) => {
        const file = event.target.files[0]
        if (file) {
          this.handleAvatarUpload(file)
        }
      }
      input.click()
    },
    handleAvatarUpload(file) {
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
      
      const reader = new FileReader()
      reader.onload = (e) => {
        // Update avatar preview
        this.avatarPreview = e.target.result
        
        // Save to localStorage (in real app, upload to server)
        try {
          const userStr = localStorage.getItem('user')
          let userData = {}
          if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            userData = JSON.parse(userStr)
          }
          userData.avatar = e.target.result
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          console.error('Error saving avatar:', error)
          alert('Gagal menyimpan foto profil.')
          return
        }
        
        alert('Foto profil berhasil diubah!')
      }
      reader.readAsDataURL(file)
    },
    closeChangePassword() {
      this.showChangePassword = false
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },
    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('Password baru dan konfirmasi password tidak cocok!')
        return
      }
      
      this.passwordLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        alert('Password berhasil diubah!')
        this.closeChangePassword()
      } catch (error) {
        console.error('Error changing password:', error)
        alert('Gagal mengubah password. Silakan coba lagi.')
      } finally {
        this.passwordLoading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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
  color: #64748b;
  font-size: 1rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card, .security-card {
  background: white;
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

.change-avatar-btn {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.change-avatar-btn:hover {
  background: #e5e7eb;
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
  color: #374151;
  font-size: 0.875rem;
}

.info-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-field span {
  color: #1e3a8a;
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
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #e5e7eb;
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
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.security-info h4 {
  margin: 0 0 0.25rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.security-info p {
  margin: 0;
  color: #64748b;
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
  background: white;
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
  color: #374151;
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
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
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
  
  .action-buttons {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>