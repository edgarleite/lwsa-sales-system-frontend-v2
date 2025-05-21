import { ref, defineComponent, onMounted, computed } from 'vue';
import { type Seller, type SellerListResponse, type PaginationLinks, type PaginationMeta } from '../models/Seller';
import { ApiService } from '../services/ApiService';

export class SellerController {
  // Serviço para chamadas API
  private apiService: ApiService;
  
  // Lista de vendedores (reactive com ref)
  public sellers = ref<Seller[]>([]);
  
  // Estado de carregamento
  public isLoading = ref<boolean>(false);
  
  // Mensagem de erro (se houver)
  public error = ref<string | null>(null);

  public isCreateModalOpen = ref(false);

  public isEditModalOpen = ref(false);

  public currentSeller = ref<Seller | null>(null);

  public newSeller = ref({
    name: '',
    email: ''
  });

  // Dados de paginação
  public pagination = ref<{
    links: PaginationLinks;
    meta: PaginationMeta;
  }>({
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
      per_page: 10, // 10 itens por página (padrão)
      to: 1,
      total: 1,
    },
  });

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  openEditModal(seller: Seller) {
    this.currentSeller.value = { ...seller };
    this.isEditModalOpen.value = true;
  }

  closeEditModal() {
    this.isEditModalOpen.value = false;
    this.currentSeller.value = null;
  }

  async updateSeller() {
    if (!this.currentSeller.value) return;
    
    this.isLoading.value = true;
    try {
      await this.apiService.updateSeller(
        this.currentSeller.value.id,
        {
          name: this.currentSeller.value.name,
          email: this.currentSeller.value.email
        }
      );
      
      this.closeEditModal();
      await this.fetchSellers(this.pagination.value.meta.current_page);
      
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to update seller';
    } finally {
      this.isLoading.value = false;
    }
  }

  async createSeller() {
    this.isLoading.value = true;
    try {
      await this.apiService.createSeller({
        name: this.newSeller.value.name,
        email: this.newSeller.value.email
      });
      
      // Fecha o modal e reseta o formulário
      this.isCreateModalOpen.value = false;
      this.newSeller.value = { name: '', email: '' };
      
      // Recarrega a lista atual
      await this.fetchSellers(this.pagination.value.meta.current_page);
      
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to create seller';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Busca vendedores da API com paginação
   * @param page Número da página a ser carregada (default: 1)
   */
  async fetchSellers(page: number = 1) {
    this.isLoading.value = true;
    this.error.value = null;
    
    try {
      // Chama a API para obter os vendedores
      const response: SellerListResponse = await this.apiService.getSellers(page);
      
      // Atualiza a lista de vendedores
      this.sellers.value = response.data;
      
      // Atualiza os dados de paginação
      this.pagination.value = {
        links: response.links,
        meta: response.meta,
      };
      
    } catch (err) {
      // Trata erros
      this.error.value = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching sellers:', err);
    } finally {
      this.isLoading.value = false;
    }
  }

  // VIEW
  public isViewModalOpen = ref(false);
  public selectedSeller = ref<Seller | null>(null);

  openViewModal(seller: Seller) {
    this.selectedSeller.value = { ...seller };
    this.isViewModalOpen.value = true;
  }

  closeViewModal() {
    this.isViewModalOpen.value = false;
    this.selectedSeller.value = null;
  }
 
  // DELETE
  public isDeleteModalOpen = ref(false);
  public sellerToDelete = ref<Seller | null>(null);

  openDeleteModal(seller: Seller) {
    this.sellerToDelete.value = seller;
    this.isDeleteModalOpen.value = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.value = false;
    this.sellerToDelete.value = null;
  }

  async confirmDelete() {
    if (!this.sellerToDelete.value) return;
    
    this.isLoading.value = true;
    try {
      await this.apiService.deleteSeller(this.sellerToDelete.value.id);
      
      this.closeDeleteModal();
      // Recarrega a página atual ou vai para anterior se deletar último item da página
      const currentPage = this.pagination.value.meta.current_page;
      const shouldGoToPrevPage = this.sellers.value.length === 1 && currentPage > 1;
      
      await this.fetchSellers(shouldGoToPrevPage ? currentPage - 1 : currentPage);
      
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to delete seller';
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * Verifica se deve mostrar a paginação
   */
  public shouldShowPagination(): boolean {
    return this.pagination.value.meta.total > this.pagination.value.meta.per_page;
  }

  /**
   * Vai para uma página específica
   * @param page Número da página
   */
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.pagination.value.meta.last_page) {
      this.fetchSellers(page);
    }
  }

  // Métodos de ação básicos (apenas logs por enquanto)
  viewSeller(id: number): void {
    console.log(`View seller with ID: ${id}`);
    // Aqui você pode adicionar navegação para detalhes do vendedor
  }

  editSeller(id: number): void {
    console.log(`Edit seller with ID: ${id}`);
    // Aqui você pode adicionar lógica de edição
  }

  deleteSeller(id: number): void {
    console.log(`Delete seller with ID: ${id}`);
    // Aqui você pode adicionar lógica de exclusão
  }

  viewSales = async (seller: Seller) => {
    await this.openSalesModal(seller);
  }

  public isSalesModalOpen = ref(false);
  public sellerSales = ref<Sale[]>([]);
  public currentSalesSeller = ref<Seller | null>(null);
  public salesPagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  async openSalesModal(seller: Seller) {
    this.isSalesModalOpen.value = true;
    this.currentSalesSeller.value = seller;
    await this.fetchSellerSales(seller.id);
  }

  closeSalesModal() {
    this.isSalesModalOpen.value = false;
    this.currentSalesSeller.value = null;
    this.sellerSales.value = [];
  }

  async fetchSellerSales(sellerId: number, page: number = 1) {
    this.isLoading.value = true;
    try {
      const response = await this.apiService.getSellerSales(sellerId, page);
      this.sellerSales.value = response.data[0].sales;
      // Atualize a paginação conforme a API retornar
      // this.salesPagination.value = response.meta; // Descomente se a API retornar paginação
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : 'Failed to load sales';
    } finally {
      this.isLoading.value = false;
    }
  }

  // Resend commission email
  public isResending = ref(false);
  public resendError = ref<string | null>(null);
  public resendSuccess = ref<string | null>(null);

  async resendCommissionEmail(sellerId: number, date: string): Promise<void> {
    this.isResending.value = true;
    this.resendError.value = null;
    this.resendSuccess.value = null;
    
    try {
      const response = await this.apiService.resendCommissionEmail(sellerId, date);
      this.resendSuccess.value = response.message;
    } catch (error) {
      this.resendError.value = 'Failed to resend commission email';
      throw error;
    } finally {
      this.isResending.value = false;
    }
  }
}