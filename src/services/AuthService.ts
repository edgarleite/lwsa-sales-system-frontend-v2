import { ref } from 'vue';
import { ApiService } from './ApiService';
import { type LoginData, type AuthResponse } from '../models/Auth';

export class AuthService {
  private apiService: ApiService;
  public isAuthenticated = ref(false);
  public user = ref<any>(null);
  public authError = ref<string | null>(null);

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.initializeAuth();
  }

  private initializeAuth() {
    this.isAuthenticated.value = !!this.apiService.token.value;
    
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.user.value = JSON.parse(userData);
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const authData = await this.apiService.login(loginData);
      localStorage.setItem('user_data', JSON.stringify(authData.user));
      
      this.isAuthenticated.value = true;
      this.user.value = authData.user;
      this.authError.value = null;
      
      return authData;
    } catch (err) {
      this.authError.value = 'Invalid email or password';
      throw err;
    }
  }

  logout() {
    this.apiService.clearAuthToken();
    localStorage.removeItem('user_data');
    this.isAuthenticated.value = false;
    this.user.value = null;
  }
}