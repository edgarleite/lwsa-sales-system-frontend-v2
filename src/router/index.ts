import { createRouter, createWebHistory } from 'vue-router';
import SellerListView from '../views/SellerListView.vue';
import SalesListView from '../views/SalesListView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/sellers',
      name: 'sellers',
      component: SellerListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/sellers'
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.name === 'login' && isAuthenticated) {
    next('/sellers');
  } else {
    next();
  }
});

export default router;