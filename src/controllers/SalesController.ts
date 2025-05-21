import { ref } from 'vue';
import { type Sale, type SaleListResponse } from '../models/Sale';
import { ApiService } from '../services/ApiService';

export class SalesController {
  private apiService: ApiService;
  
  public sales = ref<Sale[]>([]);
  public isLoading = ref(false);
  public error = ref<string | null>(null);
  public pagination = ref({
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      links: [],
      path: '',
      per_page: 20,
      to: 1,
      total: 1,
    },
  });

  // Para o modal de criação
  public isCreateModalOpen = ref(false);
  public newSale = ref({
    seller_id: 0,
    amount: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });
  public sellersDropdown = ref<{id: number, name: string}[]>([]);

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  async fetchSales(page: number = 1) {
    this.isLoading.value = true;
    this.error.value = null;
    try {
      const response = await this.apiService.getSales(page);
      this.sales.value = response.data;
      this.pagination.value = {
        links: response.links,
        meta: response.meta
      };
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to fetch sales';
    } finally {
      this.isLoading.value = false;
    }
  }

  async fetchSellersForDropdown() {
    try {
      const response = await this.apiService.getSellersForDropdown(); // Página 1 com muitos itens
      this.sellersDropdown.value = response.data.map(seller => ({
        id: seller.id,
        name: seller.name
      }));
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
      this.sellersDropdown.value = [];
    }
  }

  async createSale() {
    this.isLoading.value = true;
    try {
      await this.apiService.createSale({
        seller_id: this.newSale.value.seller_id,
        amount: this.newSale.value.amount,
        sale_date: this.newSale.value.sale_date
      });
      
      this.isCreateModalOpen.value = false;
      this.newSale.value = {
        seller_id: 0,
        amount: 0,
        sale_date: new Date().toISOString().split('T')[0]
      };
      
      // Recarrega a página atual
      await this.fetchSales(this.pagination.value.meta.current_page);
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to create sale';
    } finally {
      this.isLoading.value = false;
    }
  }

  // Métodos auxiliares
  shouldShowPagination(): boolean {
    return this.pagination.value.meta.total > this.pagination.value.meta.per_page;
  }
}