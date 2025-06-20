import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Dashboard from '../components/Dashboard.vue'
import AddEmployee from '../components/AddEmployee.vue'
import ViewEmployee from '../components/ViewEmployee.vue'
import EditEmployee from '../components/EditEmployee.vue'
import EmployeeList from '../components/EmployeeList.vue'
import Attendance from '../components/Attendance.vue'
import WorkHoursSummary from '../components/WorkHoursSummary.vue'
import DashboardCuti from '../components/DashboardCuti.vue'
import LeaveDashboard from '../components/LeaveDashboard.vue'
import InputJatahCuti from '../components/InputJatahCuti.vue'
import PenerimaanPermohonanCuti from '../components/PenerimaanPermohonanCuti.vue'
import ManagerApproveLeave from '../components/ManagerApproveLeave.vue'
import Profile from '../components/Profile.vue'
import Settings from '../components/Settings.vue'
import EmployeeDashboard from '../components/EmployeeDashboard.vue'
import EmployeeRequestLeave from '../components/EmployeeRequestLeave.vue'

// Auth Components
import Login from '../components/auth/Login.vue'
import Register from '../components/auth/Register.vue'
import ForgotPassword from '../components/auth/ForgotPassword.vue'
import OTPVerification from '../components/auth/OTPVerification.vue'

const routes = [
  // Auth Routes (tanpa Layout)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/otp-verification',
    name: 'OTPVerification',
    component: OTPVerification,
    meta: { requiresGuest: true }
  },
  
  // Protected Routes (dengan Layout)
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'data-pegawai',
        name: 'EmployeeList',
        component: EmployeeList
      },
      {
        path: 'tambah-pegawai',
        name: 'AddEmployee',
        component: AddEmployee
      },
      {
        path: 'lihat-data-pegawai',
        name: 'ViewEmployeeData',
        component: EmployeeList
      },
      {
        path: 'tambah-pegawai-baru',
        name: 'AddNewEmployee',
        component: AddEmployee
      },
      {
        path: 'employee/:id',
        name: 'ViewEmployee',
        component: ViewEmployee
      },
      {
        path: 'edit-employee/:id',
        name: 'EditEmployee',
        component: EditEmployee
      },
      // FITUR 1: Absensi (masuk, izin, sakit, cuti, lembur)
      {
        path: 'absensi',
        name: 'Attendance',
        component: Attendance
      },
      // FITUR 2: Rekapitulasi jam kerja
      {
        path: 'rekapitulasi',
        name: 'WorkHoursSummary',
        component: WorkHoursSummary
      },
      // FITUR 3: Dashboard cuti & absensi
      {
        path: 'dashboard-cuti',
        name: 'DashboardCuti',
        component: DashboardCuti
      },
      {
        path: 'leave-dashboard',
        name: 'LeaveDashboard',
        component: LeaveDashboard
      },
      // MANAJEMEN CUTI
      {
        path: 'cuti/input-jatah',
        name: 'InputJatahCuti',
        component: InputJatahCuti
      },
      {        path: 'cuti/permohonan',        name: 'PenerimaanPermohonanCuti',        component: PenerimaanPermohonanCuti      },      {        path: 'cuti/bawahan',        name: 'CutiBawahan',        component: ManagerApproveLeave      },
      // USER PROFILE & SETTINGS
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings
      },
      // EMPLOYEE DASHBOARD
      {
        path: 'employee-dashboard',
        name: 'EmployeeDashboard',
        component: EmployeeDashboard
      },
      // EMPLOYEE LEAVE REQUEST
      {
        path: 'employee/request-leave',
        name: 'EmployeeRequestLeave',
        component: EmployeeRequestLeave
      },
      // MANAGER APPROVE LEAVE
      {
        path: 'manager/approve-leave',
        name: 'ManagerApproveLeave',
        component: PenerimaanPermohonanCuti
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router
