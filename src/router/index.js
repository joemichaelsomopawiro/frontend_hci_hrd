import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import AddEmployee from '../components/AddEmployee.vue'
import ViewEmployee from '../components/ViewEmployee.vue'
import EditEmployee from '../components/EditEmployee.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/add-employee',
    name: 'AddEmployee',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
