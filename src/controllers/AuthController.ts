import { ref } from 'vue';
import { ApiService } from '../services/ApiService';
import { type LoginData, type AuthResponse } from '../models/Auth';

export class AuthController {
  private apiService: ApiService;
  public isAuthenticated = ref(false);
  public user = ref<any>(null);
  public authError = ref<string | null>(null);

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.checkAuth();
  }

  async login(loginData: LoginData) {
    try {
      const authData = await this.apiService.login(loginData);
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
    this.apiService.logout();
    this.isAuthenticated.value = false;
    this.user.value = null;
  }

  checkAuth() {
    this.isAuthenticated.value = !!this.apiService.token.value;
  }
}