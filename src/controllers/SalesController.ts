import { ref } from 'vue';
import { type Sale, type SaleListResponse } from '../models/Sale';
import { ApiService } from '../services/ApiService';

export class SalesController {
  private apiService: ApiService;
  
  public sales = ref<Sale[]>([]);
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

  public isCreateModalOpen = ref(false);
  public isViewModalOpen = ref(false);
  public isEditModalOpen = ref(false);
  public isDeleteModalOpen = ref(false);
  public isLoading = ref(false);
  public isLoadingSellers = ref(false);
  public isDeleting = ref(false);
  public isUpdating = ref(false);
  public newSale = ref({
    seller_id: 0,
    amount: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });
  public selectedSale = ref<Sale | null>(null);
  public saleToDelete = ref<Sale | null>(null);
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
    this.isLoadingSellers.value = true;
    try {
      const response = await this.apiService.getSellersForDropdown();
      this.sellersDropdown.value = response.data.map(seller => ({
        id: seller.id,
        name: seller.name
      }));
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
      this.sellersDropdown.value = [];
    } finally {
      this.isLoadingSellers.value = false;
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

  shouldShowPagination(): boolean {
    return this.pagination.value.meta.total > this.pagination.value.meta.per_page;
  }

  openViewModal(sale: Sale) {
    this.selectedSale.value = sale;
    this.isViewModalOpen.value = true;
  }

  closeViewModal() {
    this.isViewModalOpen.value = false;
    this.selectedSale.value = null;
  }

  async openEditModal(sale: Sale) {
    this.selectedSale.value = JSON.parse(JSON.stringify(sale));
    this.isEditModalOpen.value = true;
    await this.fetchSellersForDropdown(); // Adicione await aqui
  }

  closeEditModal() {
    this.isEditModalOpen.value = false;
    this.selectedSale.value = null;
  }

  openDeleteModal(sale: Sale) {
    this.saleToDelete.value = sale;
    this.isDeleteModalOpen.value = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.value = false;
    this.saleToDelete.value = null;
  }

  async updateSale(): Promise<void> {
    if (!this.selectedSale.value) return;
    
    this.isUpdating.value = true;
    this.error.value = null;
    
    try {
      await this.apiService.updateSale(
        this.selectedSale.value.id,
        this.selectedSale.value
      );
      this.closeEditModal();
      this.fetchSales(); // Atualiza a lista
    } catch (error) {
      this.error.value = 'Failed to update sale';
    } finally {
      this.isUpdating.value = false;
    }
  }

  async deleteSale(): Promise<void> {
    if (!this.saleToDelete.value) return;
    
    this.isDeleting.value = true;
    this.error.value = null;
    
    try {
      await this.apiService.deleteSale(this.saleToDelete.value.id);
      this.closeDeleteModal();
      this.fetchSales(); // Atualiza a lista
    } catch (error) {
      this.error.value = 'Failed to delete sale';
    } finally {
      this.isDeleting.value = false;
    }
  }
}