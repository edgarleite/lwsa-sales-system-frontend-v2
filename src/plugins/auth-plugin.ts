import { type App } from 'vue';
import { AuthService } from '../services/AuthService';
import { ApiService } from '../services/ApiService';

export default {
  install: (app: App) => {
    const apiService = new ApiService('http://localhost:8080');
    const authService = new AuthService(apiService);
    
    // Tornar disponível globalmente
    app.config.globalProperties.$auth = authService;
    app.config.globalProperties.$api = apiService;
    
    // Fornecer para uso com inject()
    app.provide('auth', authService);
    app.provide('api', apiService);
  }
};