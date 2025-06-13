import { createRouter, createWebHistory } from 'vue-router'
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

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/data-pegawai',
    name: 'EmployeeList',
    component: EmployeeList
  },
  {
    path: '/tambah-pegawai',
    name: 'AddEmployee',
    component: AddEmployee
  },
  {
    path: '/lihat-data-pegawai',
    name: 'ViewEmployeeData',
    component: EmployeeList
  },
  {
    path: '/tambah-pegawai-baru',
    name: 'AddNewEmployee',
    component: AddEmployee
  },
  {
    path: '/employee/:id',
    name: 'ViewEmployee',
    component: ViewEmployee
  },
  {
    path: '/edit-employee/:id',
    name: 'EditEmployee',
    component: EditEmployee
  },
  // FITUR 1: Absensi (masuk, izin, sakit, cuti, lembur)
  {
    path: '/absensi',
    name: 'Attendance',
    component: Attendance
  },
  // FITUR 2: Rekapitulasi jam kerja
  {
    path: '/rekapitulasi',
    name: 'WorkHoursSummary',
    component: WorkHoursSummary
  },
  // FITUR 3: Dashboard cuti & absensi
  {
    path: '/dashboard-cuti',
    name: 'DashboardCuti',
    component: DashboardCuti
  },
  {
    path: '/leave-dashboard',
    name: 'LeaveDashboard',
    component: LeaveDashboard
  },
  // MANAJEMEN CUTI
  {
    path: '/cuti/input-jatah',
    name: 'InputJatahCuti',
    component: InputJatahCuti
  },
  {
    path: '/cuti/permohonan',
    name: 'PenerimaanPermohonanCuti',
    component: PenerimaanPermohonanCuti
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
