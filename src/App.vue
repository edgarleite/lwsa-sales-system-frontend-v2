<template>
  <div id="app">
    <!-- Navbar só aparece quando autenticado -->
    <nav v-if="isAuthenticated" class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container">
        <router-link to="/" class="navbar-brand">Sales System App</router-link>
        <div class="navbar-nav">
          <router-link to="/sellers" class="nav-link">Sellers</router-link>
          <router-link to="/sales" class="nav-link">Sales</router-link>
          <button @click="handleLogout" class="btn btn-link nav-link">Logout</button>
        </div>
      </div>
    </nav>

    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<script lang="ts">
import { inject,defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'App',
  setup() {
    const router = useRouter();
    
    // Acessando o AuthService via inject
    const auth = inject('auth');
    
    const isAuthenticated = computed(() => auth?.isAuthenticated.value || false);
    
    const handleLogout = () => {
      auth?.logout();
      router.push('/login');
    };

    return {
      isAuthenticated,
      handleLogout
    };
  }
});
</script>
<style>
/* Import Bootstrap CSS - FORMA CORRETA para Vite */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';
</style>