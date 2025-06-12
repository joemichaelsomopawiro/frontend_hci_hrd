<template>
  <div class="app-layout">
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
          <li class="nav-item">
            <router-link to="/" class="nav-link" @click="closeMobileMenu">
              <div class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <span class="nav-text">Dashboard</span>
            </router-link>
          </li>
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
              <li><router-link to="/employees" class="submenu-link" @click="closeMobileMenu">Lihat Data Pegawai</router-link></li>
              <li><router-link to="/add-employee" class="submenu-link" @click="closeMobileMenu">Tambah Pegawai Baru</router-link></li>
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
              <li><router-link to="/cuti/input-jatah" class="submenu-link" @click="closeMobileMenu">Input Jatah Cuti</router-link></li>
              <li><router-link to="/cuti/permohonan" class="submenu-link" @click="closeMobileMenu">Penerimaan Permohonan Cuti</router-link></li>
              <li><router-link to="/absensi" class="submenu-link" @click="closeMobileMenu">Absensi: Masuk, Izin, Sakit, Cuti, Lembur</router-link></li>
              <li><router-link to="/rekapitulasi" class="submenu-link" @click="closeMobileMenu">Rekapitulasi Jam Kerja</router-link></li>
              <li><router-link to="/dashboard-cuti" class="submenu-link" @click="closeMobileMenu">Dashboard Cuti & Absensi</router-link></li>
            </ul>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <div class="user-details">
            <p class="user-name">Admin User</p>
            <p class="user-role">Administrator</p>
          </div>
        </div>
        <button class="logout-btn">
          <span class="nav-icon">🚪</span>
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
          >
            <span class="hamburger"></span>
            <span class="hamburger"></span>
            <span class="hamburger"></span>
          </button>

          <div class="navbar-title">
            <h1>{{ pageTitle }}</h1>
          </div>

          <div class="navbar-actions">
            <button class="notification-btn">
              <span class="notification-icon">🔔</span>
              <span class="notification-badge">3</span>
            </button>
            <div class="user-menu">
              <div class="user-avatar-small">👤</div>
              <span class="welcome-text">Selamat datang, Admin</span>
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
export default {
  name: 'Layout',
  data() {
    return {
      isMobileMenuOpen: false,
      submenuOpen: {
        dataPegawai: false,
        manajemenCuti: false
      }
    }
  },
  computed: {
    pageTitle() {
      const routeNames = {
        'Dashboard': 'Dashboard',
        'AddEmployee': 'Tambah Karyawan',
        'ViewEmployee': 'Detail Karyawan',
        'EditEmployee': 'Edit Karyawan',
        'employees': 'Data Karyawan',
        'reports': 'Laporan',
        'settings': 'Pengaturan'
      }
      return routeNames[this.$route.name] || 'HR Management System'
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },
    toggleSubmenu(menuName) {
      this.submenuOpen[menuName] = !this.submenuOpen[menuName]
    }
  },
  mounted() {
    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isMobileMenuOpen = false
      }
    })
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--gray-50);
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
  z-index: 999;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Hide scrollbar */
.sidebar-nav {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.sidebar-nav::-webkit-scrollbar {
  display: none; /* WebKit */
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
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
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
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

/* Navbar */
.navbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e3f2fd;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  max-width: none;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
}

.menu-toggle:hover {
  background: linear-gradient(135deg, #29B6F6, #03A9F4);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.4);
}

.hamburger {
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s;
}

.navbar-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #03A9F4, #0288D1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  position: relative;
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}

.notification-btn:hover {
  background: linear-gradient(135deg, #29B6F6, #03A9F4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 195, 247, 0.4);
}

.notification-icon {
  font-size: 1.25rem;
  color: white;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(135deg, #FF5722, #F44336);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(79, 195, 247, 0.1);
  border-radius: 25px;
  border: 1px solid rgba(79, 195, 247, 0.2);
  transition: all 0.3s ease;
}

.user-menu:hover {
  background: rgba(79, 195, 247, 0.15);
  border-color: rgba(79, 195, 247, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.2);
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4FC3F7, #29B6F6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
}

.welcome-text {
  font-weight: 600;
  background: linear-gradient(135deg, #0288D1, #0277BD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 0.9rem;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Desktop Styles */
@media (min-width: 769px) {
  .sidebar {
    position: static;
    transform: translateX(0);
  }
  
  .main-wrapper {
    margin-left: 0;
  }
  
  .menu-toggle {
    display: none;
  }
  
  .mobile-overlay {
    display: none !important;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-overlay {
    display: block;
  }
  
  .mobile-only {
    display: block;
  }
  
  .navbar-title h1 {
    font-size: 1.25rem;
  }
  
  .welcome-text {
    display: none;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .navbar-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
  }
  
  .navbar-title h1 {
    font-size: 1.125rem;
  }
  
  .main-content {
    padding: 0.75rem;
  }
}
</style>