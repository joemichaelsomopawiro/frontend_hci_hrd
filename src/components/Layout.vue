<template>
  <div class="app-layout" :class="{ 'dark-mode': isDarkMode, 'mobile-menu-open': isMobileMenuOpen }">
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="toggleMobileMenu"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="sidebar"
      :class="{ 'sidebar-open': isMobileMenuOpen }"
    >
      <div class="sidebar-header">
        <div class="logo-section">
          <div class="logo-container">
            <img src="/hopechannel.jpg" alt="Hope Channel" class="logo" />
          </div>
          <div class="title-section">
            <h2>Enterprise System</h2>
          </div>
        </div>
        <button 
          class="close-btn mobile-only"
          @click="toggleMobileMenu"
        >
          ✕
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard - Available for all roles -->
          <li class="nav-item">
            <router-link :to="getDashboardRoute()" class="nav-link" @click="closeAllDropdowns">
              <div class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>
          
          <!-- Morning Reflection - Available for all roles -->
            <li class="nav-item">
              <router-link to="/morning-reflection" class="nav-link" @click="closeAllDropdowns">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <!-- Seventh-day Adventist Logo: Bible and Cross -->
                    <!-- Open Bible -->
                    <path d="M4 4h7v12H4z" fill="currentColor" opacity="0.8" stroke="currentColor" stroke-width="0.5"/>
                    <path d="M13 4h7v12h-7z" fill="currentColor" opacity="0.8" stroke="currentColor" stroke-width="0.5"/>
                    <path d="M5 6h5M5 8h4M5 10h5M5 12h3" stroke="currentColor" stroke-width="0.3" opacity="0.6"/>
                    <path d="M14 6h5M14 8h4M14 10h5M14 12h3" stroke="currentColor" stroke-width="0.3" opacity="0.6"/>
                    <!-- Cross rising from Bible -->
                    <path d="M12 16v6M10 18h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <!-- Flame/Light above -->
                    <ellipse cx="12" cy="2.5" rx="1" ry="1.5" fill="#FFD700" opacity="0.9"/>
                  </svg>
                </div>
                <span class="nav-text">Renungan Pagi</span>
              </router-link>
            </li>
          
          <!-- Office Attendance - Available for all roles -->
          <li class="nav-item">
            <router-link to="/absensi-kantor" class="nav-link" :class="{ 'active': $route.name === 'AttendanceOffice' }" @click="closeMobileMenu">
              <div class="nav-icon">
                <i class="fas fa-building"></i>
              </div>
              <span class="nav-text">Absensi Kantor</span>
            </router-link>
          </li>
          
          <!-- HRD Menu - Full Access -->
          <template v-if="isHRD">
            <li class="nav-item has-submenu">
              <a href="#" class="nav-link" @click.prevent="toggleSubmenu('dataPegawai')">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <span class="nav-text">Data Pegawai</span>
                <div class="nav-arrow" :class="{ 'nav-arrow-open': submenuOpen.dataPegawai }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </div>
              </a>
              <ul class="submenu" :class="{ 'submenu-open': submenuOpen.dataPegawai }">
                <li><router-link to="/lihat-data-pegawai" class="submenu-link" @click="closeAllDropdowns">Lihat Data Pegawai</router-link></li>
                <li><router-link to="/tambah-pegawai-baru" class="submenu-link" @click="closeAllDropdowns">Tambah Pegawai</router-link></li>
              </ul>
            </li>
            <li class="nav-item has-submenu">
              <a href="#" class="nav-link" @click.prevent="toggleSubmenu('manajemenCuti')">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <span class="nav-text">Manajemen Cuti</span>
                <div class="nav-arrow" :class="{ 'nav-arrow-open': submenuOpen.manajemenCuti }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </div>
              </a>
              <ul class="submenu" :class="{ 'submenu-open': submenuOpen.manajemenCuti }">
                <li><router-link to="/cuti/input-jatah" class="submenu-link" @click="closeAllDropdowns">Input Jatah Cuti</router-link></li>
                <li><router-link to="/cuti/permohonan" class="submenu-link" @click="closeAllDropdowns">Penerimaan Permohonan Cuti</router-link></li>
                <li><router-link to="/cuti/bawahan" class="submenu-link" @click="closeAllDropdowns">Riwayat Permohonan Cuti</router-link></li>
                <li><router-link to="/absensi" class="submenu-link" @click="closeAllDropdowns">Absensi</router-link></li>
                <li><router-link to="/rekapitulasi" class="submenu-link" @click="closeAllDropdowns">Rekapitulasi Jam Kerja</router-link></li>
                <li><router-link to="/dashboard-cuti" class="submenu-link" @click="closeAllDropdowns">Dashboard Cuti & Absensi</router-link></li>
              </ul>
            </li>
          </template>
          
          <!-- Manager Menu - Approve Cuti + Paket Pegawai -->
          <template v-else-if="isManager">
            <li class="nav-item has-submenu">
              <a href="#" class="nav-link" @click.prevent="toggleSubmenu('manajemenCuti')">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <span class="nav-text">Manajemen Cuti</span>
                <div class="nav-arrow" :class="{ 'nav-arrow-open': submenuOpen.manajemenCuti }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </div>
              </a>
              <ul class="submenu" :class="{ 'submenu-open': submenuOpen.manajemenCuti }">
                <li><router-link to="/cuti/permohonan" class="submenu-link" @click="closeAllDropdowns">Penerimaan Permohonan Cuti</router-link></li>
                <li><router-link to="/cuti/bawahan" class="submenu-link" @click="closeAllDropdowns">Riwayat Permohonan Cuti</router-link></li>
                <li><router-link to="/absensi" class="submenu-link" @click="closeAllDropdowns">Absensi</router-link></li>
                <li><router-link to="/dashboard-cuti" class="submenu-link" @click="closeAllDropdowns">Dashboard Cuti & Absensi</router-link></li>
              </ul>
            </li>
          </template>
          
          <!-- GA Menu - General Affairs (Only for GA role) -->
          <template v-if="isGeneralAffairs">
            <li class="nav-item has-submenu">
              <a href="#" class="nav-link" @click.prevent="toggleSubmenu('generalAffairs')">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span class="nav-text">General Affairs</span>
                <div class="nav-arrow" :class="{ 'nav-arrow-open': submenuOpen.generalAffairs }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </div>
              </a>
              <ul class="submenu" :class="{ 'submenu-open': submenuOpen.generalAffairs }">
                <li><router-link to="/ga-dashboard" class="submenu-link" @click="closeAllDropdowns">GA Dashboard</router-link></li>
                <li><router-link to="/ga-attendance" class="submenu-link" @click="closeAllDropdowns">Absensi Renungan</router-link></li>
                <li><router-link to="/employee/request-leave" class="submenu-link" @click="closeAllDropdowns">Paket Pegawai</router-link></li>
              </ul>
            </li>
          </template>

          <!-- Employee Menu - Paket Pegawai Only -->
          <template v-else-if="isEmployee">
            <li class="nav-item has-submenu">
              <a href="#" class="nav-link" @click.prevent="toggleSubmenu('paketPegawai')">
                <div class="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <span class="nav-text">Permohonan Cuti</span>
                <div class="nav-arrow" :class="{ 'nav-arrow-open': submenuOpen.paketPegawai }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </div>
              </a>
              <ul class="submenu" :class="{ 'submenu-open': submenuOpen.paketPegawai }">
                <li><router-link to="/employee/request-leave" class="submenu-link" @click="closeAllDropdowns">Permohonan Cuti</router-link></li>
                <li><router-link to="/absensi" class="submenu-link" @click="closeAllDropdowns">Tampilan Absensi</router-link></li>
              </ul>
            </li>
          </template>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="userAvatar" 
                 :src="userAvatar" 
                 alt="User Avatar" 
                 class="avatar-image" />
            <span v-else>👤</span>
          </div>
          <div class="user-details">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <span class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span class="nav-text">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-wrapper">
      <!-- Top Navbar -->
      <header class="navbar">
        <div class="navbar-content">
          <button 
            class="menu-toggle"
            @click="toggleMobileMenu"
            aria-label="Toggle mobile menu"
          >
            <span class="hamburger"></span>
            <span class="hamburger"></span>
            <span class="hamburger"></span>
          </button>

          <div class="navbar-title">
            <h1>{{ pageTitle }}</h1>
          </div>

          <div class="navbar-actions">
            <!-- Morning Reflection Status -->
            <MorningReflection />
            
            <!-- Dark Mode Toggle Button -->
            <button 
              class="theme-toggle-btn" 
              @click="toggleDarkMode"
              :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <svg v-if="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
              </svg>
            </button>
            
            <button v-if="canViewNotifications" class="notification-btn" @click="toggleNotificationDropdown" ref="notificationBtn">
              <span class="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.8"/>
                </svg>
              </span>
              <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
              
              <!-- Notification Dropdown -->
              <div class="notification-dropdown" :class="{ 'notification-dropdown-open': isNotificationDropdownOpen }">
                <div class="notification-header">
                  <h4>Notifikasi Permohonan Cuti</h4>
                  <span class="notification-count">{{ notificationCount }} permohonan baru</span>
                </div>
                
                <div v-if="loading" class="notification-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Memuat notifikasi...</span>
                </div>
                
                <div v-else-if="notifications.length === 0" class="notification-empty">
                  <i class="fas fa-check-circle"></i>
                  <span>Tidak ada permohonan cuti baru</span>
                </div>
                
                <div v-else class="notification-list">
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id" 
                    class="notification-item"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="notification-avatar">
                      <span>{{ getInitials(notification.employee_name) }}</span>
                    </div>
                    <div class="notification-content">
                      <div class="notification-title">
                        {{ notification.employee_name }}
                      </div>
                      <div class="notification-message">
                        Mengajukan {{ getLeaveTypeText(notification.leave_type) }}
                      </div>
                      <div class="notification-date">
                        {{ formatDate(notification.start_date) }} - {{ formatDate(notification.end_date) }}
                      </div>
                      <div class="notification-time">
                        {{ getTimeAgo(notification.created_at) }}
                      </div>
                    </div>
                    <div class="notification-status">
                      <span class="status-badge pending">Pending</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="notifications.length > 0" class="notification-footer">
                  <button @click="viewAllRequests" class="btn-view-all">
                    Lihat Semua Permohonan
                  </button>
                </div>
              </div>
            </button>
            <div class="user-menu" @click="toggleUserDropdown" ref="userMenu">
              <div class="user-avatar-small">
                <img v-if="userAvatar" 
                     :src="userAvatar" 
                     alt="User Avatar" 
                     class="avatar-image-small" />
                <span v-else>👤</span>
              </div>
              <span class="welcome-text">{{ userName }}</span>
              <div class="dropdown-arrow" :class="{ 'dropdown-arrow-open': isUserDropdownOpen }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </div>
              
              <!-- User Dropdown Menu -->
              <div class="user-dropdown" :class="{ 'user-dropdown-open': isUserDropdownOpen }">
                <div class="dropdown-header">
                  <div class="user-avatar-large">
                    <img v-if="userAvatar" 
                         :src="userAvatar" 
                         alt="User Avatar" 
                         class="avatar-image" />
                    <span v-else>👤</span>
                  </div>
                  <div class="user-info-dropdown">
                    <h4>{{ userName }}</h4>
                    <p class="user-role-dropdown">{{ userRole }}</p>
                    <p class="user-email-dropdown">{{ userEmail }}</p>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <ul class="dropdown-menu">
                  <li>
                    <a href="#" @click.prevent="viewProfile" class="dropdown-item">
                      <span class="dropdown-icon">👤</span>
                      <span>Lihat Profil</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" @click.prevent="openSettings" class="dropdown-item">
                      <span class="dropdown-icon">⚙️</span>
                      <span>Pengaturan</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" @click.prevent="handleLogout" class="dropdown-item logout-item">
                      <span class="dropdown-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16,17 21,12 16,7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                      </span>
                      <span>Logout</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService'
import MorningReflection from './MorningReflection.vue'

export default {
  name: 'Layout',
  components: {
    MorningReflection
  },
  data() {
    return {
      isMobileMenuOpen: false,
      isUserDropdownOpen: false,
      isNotificationDropdownOpen: false,
      isDarkMode: false,
      submenuOpen: {
        dataPegawai: false,
        manajemenCuti: false,
        paketPegawai: false,
        generalAffairs: false
      },
      notifications: [],
      loading: false,
      notificationInterval: null,
      // Reactive user data untuk auto-update
      userProfileData: null,
      profileUpdateKey: 0 // Key untuk force re-render
    }
  },
  computed: {
    pageTitle() {
      const routeNames = {
        'Dashboard': 'Dashboard',
        'AddEmployee': 'Tambah Karyawan',
        'ViewEmployee': 'Detail Karyawan',
        'EditEmployee': 'Edit Karyawan',
        'EmployeeList': 'Data Karyawan',
        'Attendance': 'Absensi',
        'WorkHoursSummary': 'Rekapitulasi Jam Kerja',
        'DashboardCuti': 'Dashboard Cuti',
        'LeaveDashboard': 'Dashboard Cuti',
        'InputJatahCuti': 'Input Jatah Cuti',
        'PenerimaanPermohonanCuti': 'Penerimaan Permohonan Cuti',
        'AttendanceOffice': 'Absensi Kantor',
        'Profile': 'Profil Pengguna',
        'Settings': 'Pengaturan'
      }
      return routeNames[this.$route.name] || 'Sistem Manajemen SDM'
    },
    userName() {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          return 'Admin'
        }
        const user = JSON.parse(userStr)
        return user.name || user.fullName || user.username || 'Admin'
      } catch (error) {
        console.warn('Error parsing user data:', error)
        return 'Admin'
      }
    },
    userEmail() {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          return 'admin@example.com'
        }
        const user = JSON.parse(userStr)
        return user.email || user.phone || 'admin@example.com'
      } catch (error) {
        console.warn('Error parsing user data:', error)
        return 'admin@example.com'
      }
    },
    userRole() {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          return 'Administrator'
        }
        const user = JSON.parse(userStr)
        return user.role || user.position || 'Administrator'
      } catch (error) {
        console.warn('Error parsing user data:', error)
        return 'Administrator'
      }
    },
    userAvatar() {
      // Force reactivity dengan profileUpdateKey
      this.profileUpdateKey
      
      // Gunakan reactive data jika tersedia
      if (this.userProfileData && this.userProfileData.avatar) {
        return this.userProfileData.avatar
      }
      
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
          return null
        }
        const user = JSON.parse(userStr)
        const avatar = user.profile_picture ? `http://127.0.0.1:8000/storage/${user.profile_picture}` : null
        
        // Update reactive data
        if (!this.userProfileData) {
          this.userProfileData = { avatar }
        } else {
          this.userProfileData.avatar = avatar
        }
        
        return avatar
      } catch (error) {
        console.warn('Error parsing user data:', error)
        return null
      }
    },
    isHRD() {
      return this.userRole === 'HR Manager' || this.userRole === 'HR' || this.userRole === 'HRD'
    },
    isManager() {
      return ['Program Manager', 'Distribution Manager'].includes(this.userRole)
    },
    isGeneralAffairs() {
      return this.userRole === 'General Affairs'
    },
    isEmployee() {
      const employeeRoles = [
        'Employee', 'Finance', 'Office Assistant',
        'Producer', 'Creative', 'Production', 'Editor',
        'Social Media', 'Promotion', 'Graphic Design', 'Hopeline Care'
      ]
      return employeeRoles.includes(this.userRole)
    },
    notificationCount() {
      return this.notifications.length
    },
    canViewNotifications() {
      return this.isHRD || this.isManager
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
      
      // Update overlay class
      const overlay = document.querySelector('.mobile-overlay')
      if (overlay) {
        if (this.isMobileMenuOpen) {
          overlay.classList.add('active')
        } else {
          overlay.classList.remove('active')
        }
      }
      
      // Prevent body scroll when menu is open
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden'
        document.body.classList.add('menu-open')
      } else {
        document.body.style.overflow = ''
        document.body.classList.remove('menu-open')
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
      
      // Update overlay class
      const overlay = document.querySelector('.mobile-overlay')
      if (overlay) {
        overlay.classList.remove('active')
      }
      
      document.body.style.overflow = ''
      document.body.classList.remove('menu-open')
    },
    toggleSubmenu(menuName) {
      this.submenuOpen[menuName] = !this.submenuOpen[menuName]
    },
    toggleUserDropdown() {
      this.isUserDropdownOpen = !this.isUserDropdownOpen
    },
    closeUserDropdown() {
      this.isUserDropdownOpen = false
    },
    closeAllDropdowns() {
      this.isUserDropdownOpen = false
      this.isNotificationDropdownOpen = false
      
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false
        
        // Update overlay class
        const overlay = document.querySelector('.mobile-overlay')
        if (overlay) {
          overlay.classList.remove('active')
        }
        
        document.body.style.overflow = ''
        document.body.classList.remove('menu-open')
      }
    },
    viewProfile() {
      this.closeAllDropdowns()
      this.$router.push('/profile')
    },
    openSettings() {
      this.closeAllDropdowns()
      this.$router.push('/settings')
    },
    async handleLogout() {
      this.closeAllDropdowns()
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        await authService.logout()
        this.$router.push('/login')
      }
    },
    getDashboardRoute() {
      // Semua role termasuk HR akan ke dashboard utama
      return '/'
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('darkMode', this.isDarkMode.toString())
      this.applyTheme()
    },
    applyTheme() {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    },
    loadThemePreference() {
      const savedTheme = localStorage.getItem('darkMode')
      if (savedTheme !== null) {
        this.isDarkMode = savedTheme === 'true'
      } else {
        // Default to system preference
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      this.applyTheme()
    },
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.loadUserData()
        this.profileUpdateKey++
        this.$forceUpdate()
      }
    },
    handleProfileUpdate(event) {
      // Handle profile updates from Profile component
      this.loadUserData()
      this.profileUpdateKey++
      this.$forceUpdate()
    },
    loadUserData() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          const user = JSON.parse(userStr)
          this.userProfileData = {
            avatar: user.profile_picture ? `http://127.0.0.1:8000/storage/${user.profile_picture}` : null
          }
        } else {
          this.userProfileData = { avatar: null }
        }
      } catch (error) {
        console.warn('Error loading user data:', error)
        this.userProfileData = { avatar: null }
      }
    },
    async refreshUserData() {
      try {
        const result = await authService.fetchUserProfile()
        if (result.success) {
          localStorage.setItem('user', JSON.stringify(result.data))
          this.$forceUpdate()
        }
      } catch (error) {
        console.warn('Failed to refresh user data:', error)
      }
    },
    toggleNotificationDropdown() {
      if (!this.canViewNotifications) return
      this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen
      if (this.isNotificationDropdownOpen) {
        this.fetchNotifications()
      }
    },
    closeNotificationDropdown() {
      this.isNotificationDropdownOpen = false
    },
    async fetchNotifications() {
      if (!this.canViewNotifications) return
      
      this.loading = true
      try {
        const response = await fetch('http://127.0.0.1:8000/api/leave-requests?status=pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          this.notifications = data.data || []
        } else {
          console.error('Failed to fetch notifications')
          this.notifications = []
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        this.notifications = []
      } finally {
        this.loading = false
      }
    },
    handleNotificationClick(notification) {
      this.closeAllDropdowns()
      this.$router.push('/cuti/permohonan')
    },
    viewAllRequests() {
      this.closeAllDropdowns()
      this.$router.push('/cuti/permohonan')
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
    },
    getLeaveTypeText(type) {
      const types = {
        'annual': 'Cuti Tahunan',
        'sick': 'Cuti Sakit',
        'emergency': 'Cuti Darurat',
        'maternity': 'Cuti Melahirkan',
        'paternity': 'Cuti Ayah'
      }
      return types[type] || 'Cuti'
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    getTimeAgo(dateString) {
      if (!dateString) return ''
      const now = new Date()
      const date = new Date(dateString)
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Baru saja'
      if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours} jam yang lalu`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays} hari yang lalu`
      
      return this.formatDate(dateString)
    },
    startNotificationPolling() {
      if (!this.canViewNotifications) return
      
      // Fetch immediately
      this.fetchNotifications()
      
      // Then fetch every 30 seconds
      this.notificationInterval = setInterval(() => {
        this.fetchNotifications()
      }, 30000)
    },
    stopNotificationPolling() {
      if (this.notificationInterval) {
        clearInterval(this.notificationInterval)
        this.notificationInterval = null
      }
    }
  },
  async mounted() {
    // Load theme preference
    this.loadThemePreference()
    
    // Load initial user data
    this.loadUserData()
    
    // Refresh user data saat komponen dimount
    await this.refreshUserData()
    
    // Start notification polling for HR and Manager
    this.startNotificationPolling()
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMobileMenuOpen) {
        this.closeMobileMenu()
      }
    })
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (this.$refs.userMenu && !this.$refs.userMenu.contains(event.target)) {
        this.isUserDropdownOpen = false
      }
      if (this.$refs.notificationBtn && !this.$refs.notificationBtn.contains(event.target)) {
        this.isNotificationDropdownOpen = false
      }
      // Close mobile menu when clicking outside on mobile
      if (this.isMobileMenuOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-toggle')) {
        this.closeMobileMenu()
      }
    })
    
    // Add click event listener to mobile overlay
    this.$nextTick(() => {
      const overlay = document.querySelector('.mobile-overlay')
      if (overlay) {
        overlay.addEventListener('click', this.closeMobileMenu)
      }
    })
    
    // Listen for storage changes to update user data
    window.addEventListener('storage', this.handleStorageChange)
    
    // Listen for profile updates from Profile component
    window.addEventListener('profile-updated', this.handleProfileUpdate)
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('storage', this.handleStorageChange)
    window.removeEventListener('profile-updated', this.handleProfileUpdate)
    
    // Remove overlay event listener
    const overlay = document.querySelector('.mobile-overlay')
    if (overlay) {
      overlay.removeEventListener('click', this.closeMobileMenu)
    }
    
    // Stop notification polling
    this.stopNotificationPolling()
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary, #f8fafc);
  transition: background-color 0.3s ease;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  pointer-events: none;
}

.mobile-overlay.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #4FC3F7 0%, #29B6F6 50%, #03A9F4 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.sidebar-nav {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container {
  width: 50px;
  height: 50px;
  background: #FFD54F;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logo {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  object-fit: cover;
}

.title-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-only {
  display: none;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0.25rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin: 0.125rem 0;
  margin-right: 1rem;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-text {
  font-weight: 500;
  font-size: 0.95rem;
}

/* Submenu Styles */
.has-submenu .nav-link {
  justify-content: space-between;
}

.nav-arrow {
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow-open {
  transform: rotate(180deg);
}

.submenu {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: rgba(0, 0, 0, 0.1);
}

.submenu-open {
  max-height: 300px;
}

.submenu-link {
  display: block;
  padding: 0.75rem 1.5rem 0.75rem 4rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.submenu-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding-left: 4.5rem;
}

.submenu-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
}

.avatar-image-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  aspect-ratio: 1 / 1;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

/* Main Wrapper */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  min-height: 100vh;
  width: calc(100% - 280px);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 1rem;
  padding-top: 80px;
  overflow-y: auto;
  width: 100%;
  min-height: calc(100vh - 80px);
  background-color: var(--bg-primary, #f8fafc);
  transition: background-color 0.3s ease;
}

/* Navbar Styles */
.navbar {
  background-color: var(--bg-secondary, #ffffff);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transition: all 0.3s ease;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-title {
  flex: 1;
  text-align: center;
}

.navbar-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1e3a8a);
  margin: 0;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;
  padding-bottom: 4px;
}

.navbar-title h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 2px;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border-radius: 1px;
  opacity: 0.5;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 48px;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 1001;
}

.menu-toggle:hover {
  background-color: rgba(30, 58, 138, 0.1);
  transform: scale(1.05);
}

.menu-toggle:active {
  transform: scale(0.95);
}

.menu-toggle:focus {
  outline: 2px solid rgba(30, 58, 138, 0.3);
  outline-offset: 2px;
}

.hamburger {
  width: 26px;
  height: 3px;
  background-color: #1e3a8a;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  display: block;
}

/* Hamburger Animation when menu is open */
.app-layout.mobile-menu-open .menu-toggle .hamburger:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
  background-color: #dc2626;
}

.app-layout.mobile-menu-open .menu-toggle .hamburger:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.app-layout.mobile-menu-open .menu-toggle .hamburger:nth-child(3) {
  transform: rotate(-45deg) translate(8px, -8px);
  background-color: #dc2626;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.notification-icon {
  font-size: 1.25rem;
  color: #1e3a8a;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Notification Dropdown Styles */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary, #ffffff);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 380px;
  max-width: 420px;
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  overflow: hidden;
  max-height: 500px;
}

.notification-dropdown-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.notification-header {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a8a;
}

.notification-count {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
  display: block;
}

.notification-loading,
.notification-empty {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.notification-loading i,
.notification-empty i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.notification-loading span,
.notification-empty span {
  font-size: 0.875rem;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #64748b;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.notification-date {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-bottom: 0.125rem;
}

.notification-time {
  color: #cbd5e1;
  font-size: 0.7rem;
}

.notification-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.notification-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f8fafc;
}

.btn-view-all {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view-all:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-menu:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  background-color: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #1e3a8a;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
}

.welcome-text {
  font-size: 0.875rem;
  color: #1e3a8a;
  font-weight: 500;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: #1e3a8a;
}

.dropdown-arrow-open {
  transform: rotate(180deg);
}

/* User Dropdown Styles */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  overflow: hidden;
}

.user-dropdown-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  background: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  overflow: hidden;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
}

.user-info-dropdown h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a8a;
}

.user-info-dropdown p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
}

.user-info-dropdown .user-role-dropdown {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: #3b82f6;
  font-weight: 600;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  display: inline-block;
}

.user-info-dropdown .user-email-dropdown {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0;
}

.dropdown-menu {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}

.dropdown-menu li {
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #1e3a8a;
}

.dropdown-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-icon svg {
  transition: all 0.3s ease;
  stroke: currentColor;
}

.dropdown-item:hover .dropdown-icon svg {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logout-item {
  color: #dc2626;
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  padding-top: 1rem;
  position: relative;
}

.logout-item:hover {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  box-shadow: inset 0 1px 3px rgba(220, 38, 38, 0.1);
}

.logout-item .dropdown-icon svg {
  stroke: #dc2626;
  filter: drop-shadow(0 1px 2px rgba(220, 38, 38, 0.2));
}

.logout-item:hover .dropdown-icon svg {
  transform: scale(1.15) rotate(-5deg);
  filter: drop-shadow(0 3px 6px rgba(220, 38, 38, 0.3));
  stroke: #b91c1c;
}

/* Tablet and Desktop Styles */
@media (min-width: 1025px) {
  .sidebar {
    transform: translateX(0);
  }
  
  .main-wrapper {
    margin-left: 280px;
    width: calc(100% - 280px);
  }
  
  .menu-toggle {
    display: none;
  }
  
  .mobile-overlay {
    display: none !important;
  }
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 1000;
    width: 280px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
  
  .menu-toggle {
    display: flex;
    z-index: 1001;
    position: relative;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .app-layout.mobile-menu-open .mobile-overlay {
    display: block !important;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 1000;
    width: 280px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .app-layout.mobile-menu-open .mobile-overlay {
    display: block !important;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  
  .mobile-only {
    display: block;
  }
  
  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }
  
  .menu-toggle {
    display: flex;
    z-index: 1001;
    position: relative;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  
  .navbar-content {
    padding: 0.75rem 1rem;
  }

  .navbar-title h1 {
    font-size: 1.25rem;
  }

  .navbar-title h1::after {
    width: 75%;
  }

  .welcome-text {
    display: none;
  }

  .notification-btn {
    padding: 0.25rem;
  }

  .notification-icon {
    font-size: 1.125rem;
  }

  .user-dropdown {
    min-width: 260px;
    right: -1rem;
  }

  .dropdown-header {
    padding: 1rem;
  }

  .dropdown-item {
    padding: 0.75rem 1rem;
  }

  .notification-badge {
    width: 1rem;
    height: 1rem;
    font-size: 0.6rem;
  }

  .main-content {
    padding: 80px 1rem 1rem 1rem;
  }
}

/* Theme Toggle Button */
.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  color: var(--text-secondary, #1e3a8a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-btn:hover {
  background-color: var(--gray-100, rgba(0, 0, 0, 0.05));
  color: var(--text-primary, #1e3a8a);
  transform: scale(1.05);
}

/* Dark Mode Styles */
.dark-mode {
  background-color: #1a1a1a;
  color: #e5e7eb;
}

.dark-mode .sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%);
}

.dark-mode .navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.dark-mode .navbar-title h1 {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .theme-toggle-btn {
  color: var(--text-secondary, #e5e7eb);
}

.dark-mode .theme-toggle-btn:hover {
  background-color: var(--gray-700, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, #e5e7eb);
}

.dark-mode .notification-btn {
  color: var(--text-secondary, #e5e7eb);
}

.dark-mode .notification-btn:hover {
  background-color: var(--gray-700, rgba(255, 255, 255, 0.1));
  color: var(--text-primary, #e5e7eb);
}

.dark-mode .notification-icon {
  color: #e5e7eb;
}

.dark-mode .hamburger {
  background-color: #e5e7eb;
}

.dark-mode .user-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .welcome-text {
  color: #e5e7eb;
}

.dark-mode .dropdown-arrow {
  color: #e5e7eb;
}

.dark-mode .user-dropdown {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.dark-mode .dropdown-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-bottom-color: #4a5568;
}

.dark-mode .user-info-dropdown h4 {
  color: #e5e7eb;
}

.dark-mode .user-info-dropdown p {
  color: #a0aec0;
}

.dark-mode .user-info-dropdown .user-role-dropdown {
  color: #60a5fa;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.dark-mode .user-info-dropdown .user-email-dropdown {
  color: #6b7280;
}

.dark-mode .dropdown-divider {
  background: #4a5568;
}

.dark-mode .dropdown-item {
  color: var(--text-primary);
}

.dark-mode .dropdown-item:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.dark-mode .logout-item {
  color: #fc8181;
  border-top-color: #4a5568;
}

.dark-mode .logout-item:hover {
  background-color: #742a2a;
  color: #fc8181;
}

.dark-mode .main-content {
  background-color: var(--bg-primary);
}

/* Dark Mode Notification Styles */
.dark-mode .notification-dropdown {
  background: var(--bg-secondary, #1f2937);
  border: 1px solid var(--border-color, #374151);
}

.dark-mode .notification-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-bottom-color: #4a5568;
}

.dark-mode .notification-header h4 {
  color: #e5e7eb;
}

.dark-mode .notification-count {
  color: #a0aec0;
}

.dark-mode .notification-loading,
.dark-mode .notification-empty {
  color: #a0aec0;
}

.dark-mode .notification-item:hover {
  background-color: #374151;
}

.dark-mode .notification-item {
  border-bottom-color: #374151;
}

.dark-mode .notification-title {
  color: #e5e7eb;
}

.dark-mode .notification-message {
  color: #a0aec0;
}

.dark-mode .notification-date {
  color: #6b7280;
}

.dark-mode .notification-time {
  color: #4b5563;
}

.dark-mode .notification-footer {
  background-color: #374151;
  border-top-color: #4a5568;
}

@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
  }
  
  .navbar-title h1 {
    font-size: 1rem;
  }

  .navbar-content {
    padding: 0.5rem 0.75rem;
  }

  .menu-toggle {
    padding: 0.25rem;
  }

  .hamburger {
    width: 20px;
  }

  .main-content {
    padding: 70px 0.75rem 0.75rem 0.75rem;
  }
  
  .notification-dropdown {
    min-width: 320px;
    max-width: 350px;
    right: -1rem;
  }
  
  .notification-item {
    padding: 0.75rem 1rem;
  }
  
  .notification-header {
    padding: 0.75rem 1rem;
  }
  
  .notification-footer {
    padding: 0.75rem 1rem;
  }
}
</style>
