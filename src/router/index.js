import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import AddEmployee from '../components/AddEmployee.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/add-employee',
    name: 'AddEmployee',
    component: AddEmployee,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;