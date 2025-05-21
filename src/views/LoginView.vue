<template>
  <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="card" style="width: 400px;">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">Login</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" v-model="loginData.email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="loginData.password" required>
          </div>
          <div v-if="authError" class="alert alert-danger">
            {{ authError }}
          </div>
          <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
            Login
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import type { AuthService } from '../services/AuthService';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const auth = inject<AuthService>('auth'); // Acessando o AuthService via inject
    
    const loginData = ref({
      email: 'admin@empresa.com',
      password: '123456'
    });
    const isLoading = ref(false);

    const handleLogin = async () => {
      if (!auth) return;
      
      isLoading.value = true;
      try {
        await auth.login(loginData.value);
        router.push('/sellers');
      } catch (err) {
        console.error('Login failed:', err);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      loginData,
      isLoading,
      handleLogin,
      authError: auth?.authError || ref(null)
    };
  }
});
</script>