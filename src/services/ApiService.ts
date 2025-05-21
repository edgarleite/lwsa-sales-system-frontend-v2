import { ref } from 'vue';
import axios, { type AxiosInstance } from 'axios';
import { type SellerListResponse } from '../models/Seller';
import { type SaleListResponse } from '../models/Sale';
import { type LoginData, type AuthResponse } from '../models/Auth';

export class ApiService {
  public token = ref<string | null>(null);
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL });
    this.loadToken();
  }

  private loadToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.setAuthToken(token);
    }
  }

  public setAuthToken(token: string) {
    this.token.value = token;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }

  public clearAuthToken() {
    this.token.value = null;
    delete this.axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post('/api/v1/login', loginData);
      this.setAuthToken(response.data.access_token);
      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  }
  
  // Sellers
  async createSeller(sellerData: { name: string; email: string }): Promise<void> {
    try {
      await this.axiosInstance.post('/api/v1/sellers', sellerData);
    } catch (error) {
      throw new Error('Failed to create seller');
    }
  }

  async updateSeller(id: number, sellerData: { name: string; email: string }): Promise<void> {
    try {
      await this.axiosInstance.put(`/api/v1/sellers/${id}`, sellerData);
    } catch (error) {
      throw new Error('Failed to update seller');
    }
  }

  async getSellers(page: number = 1): Promise<SellerListResponse> {
    try {
      const response = await this.axiosInstance.get('/api/v1/sellers', {
        params: { page, per_page: 5 },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sellers');
    }
  }

  async deleteSeller(id: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/v1/sellers/${id}`);
    } catch (error) {
      throw new Error('Failed to delete seller');
    }
  }

  async getSellerSales(sellerId: number, page: number = 1): Promise<SellerSalesResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/v1/sellers/${sellerId}/sales`, {
        params: {
          page,
          per_page: 20 // 20 itens por página
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sales');
    }
  }

  // Sales
  async getSales(page: number = 1): Promise<SaleListResponse> {
    try {
      const response = await this.axiosInstance.get('/api/v1/sales', {
        params: {
          page,
          per_page: 10 // Ajustando para 10 itens por página conforme o mock
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sales');
    }
  }

  async createSale(saleData: {
    seller_id: number;
    amount: number;
    sale_date: string;
  }): Promise<void> {
    try {
      await this.axiosInstance.post('/api/v1/sales', saleData);
    } catch (error) {
      throw new Error('Failed to create sale');
    }
  }

  async getSellersForDropdown(page: number = 1): Promise<{data: Seller[], meta: any}> {
    try {
      const response = await this.axiosInstance.get('/api/v1/sellers', {
        params: {
          page,
          per_page: 1000 // Número alto para trazer todos de uma vez
        }
      });
      return {
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      throw new Error('Failed to fetch sellers');
    }
  }

  async resendCommissionEmail(sellerId: number, date: string): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.post(
        `/api/v1/reports/resend/${sellerId}`,
        { date }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to resend commission email');
    }
  }
}

