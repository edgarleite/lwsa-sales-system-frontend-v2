<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Sellers List</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Create Seller
      </button>
    </div>

    <!-- Modal de Criação -->
    <div class="modal fade" :class="{ show: isCreateModalOpen, 'd-block': isCreateModalOpen }" tabindex="-1" v-if="isCreateModalOpen">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Seller</h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createSeller">
              <div class="mb-3">
                <label for="sellerName" class="form-label">Name</label>
                <input type="text" class="form-control" id="sellerName" v-model="newSeller.name" required>
              </div>
              <div class="mb-3">
                <label for="sellerEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="sellerEmail" v-model="newSeller.email" required>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeCreateModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Create Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isCreateModalOpen }" v-if="isCreateModalOpen"></div>

    <!-- Modal de Edição -->
    <div class="modal fade" :class="{ show: isEditModalOpen, 'd-block': isEditModalOpen }" tabindex="-1" v-if="isEditModalOpen && currentSeller">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Seller #{{ currentSeller.id }}</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateSeller">
              <div class="mb-3">
                <label for="editSellerName" class="form-label">Name</label>
                <input type="text" class="form-control" id="editSellerName" v-model="currentSeller.name" required>
              </div>
              <div class="mb-3">
                <label for="editSellerEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="editSellerEmail" v-model="currentSeller.email" required>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeEditModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Update Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isEditModalOpen }" v-if="isEditModalOpen"></div>

    <!-- Modal de Visualização -->
    <div class="modal fade" :class="{ show: isViewModalOpen, 'd-block': isViewModalOpen }" tabindex="-1" v-if="isViewModalOpen && selectedSeller">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Seller Details</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeViewModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-muted">Basic Information</h6>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <strong>ID:</strong> {{ selectedSeller.id }}
                  </li>
                  <li class="list-group-item">
                    <strong>Name:</strong> {{ selectedSeller.name }}
                  </li>
                  <li class="list-group-item">
                    <strong>Email:</strong> {{ selectedSeller.email }}
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Timestamps</h6>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <strong>Created At:</strong> {{ formatDate(selectedSeller.created_at) }}
                  </li>
                  <li class="list-group-item">
                    <strong>Updated At:</strong> {{ formatDate(selectedSeller.updated_at) }}
                  </li>
                  <li class="list-group-item">
                    <strong>Updated At:</strong> {{ formatDate(selectedSeller.updated_at) }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-4" v-if="selectedSeller.links">
              <h6 class="text-muted">Quick Actions</h6>
              <div class="d-flex gap-2">
                <a :href="selectedSeller.links.self" target="_blank" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-link-45deg"></i> API Endpoint
                </a>
                <a :href="selectedSeller.links.sales" target="_blank" class="btn btn-outline-success btn-sm">
                  <i class="bi bi-cash-stack"></i> View Sales
                </a>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">Close</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="openEditModal(selectedSeller)"
            >
              <i class="bi bi-pencil"></i> Edit Seller
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isViewModalOpen }" v-if="isViewModalOpen"></div>

    <!-- Modal de Confirmação de Exclusão -->
    <div class="modal fade" :class="{ show: isDeleteModalOpen, 'd-block': isDeleteModalOpen }" tabindex="-1" v-if="isDeleteModalOpen && sellerToDelete">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete seller <strong>{{ sellerToDelete.name }}</strong> ({{ sellerToDelete.email }})?</p>
            <p class="text-danger">This action cannot be undone!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isDeleteModalOpen }" v-if="isDeleteModalOpen"></div>

    <!-- Modal sales per seller -->
    <div class="modal fade" :class="{ show: isSalesModalOpen, 'd-block': isSalesModalOpen }" 
        tabindex="-1" v-if="isSalesModalOpen && currentSalesSeller" 
        style="background-color: rgba(0,0,0,0.9)">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content" style="background-color: #f8f9fa;">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              Sales by {{ currentSalesSeller.name }} ({{ currentSalesSeller.email }})
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeSalesModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Sale ID</th>
                      <th>Date</th>
                      <th class="text-end">Amount</th>
                      <th class="text-end">Commission</th>
                      <th class="text-end">Net Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sale in sellerSales" :key="sale.id">
                      <td>{{ sale.id }}</td>
                      <td>{{ formatDate(sale.sale_date) }}</td>
                      <td class="text-end">{{ formatCurrency(sale.amount) }}</td>
                      <td class="text-end">{{ formatCurrency(sale.commission) }}</td>
                      <td class="text-end">{{ formatCurrency(calculateNetValue(sale)) }}</td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary" title="View Details">
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginação -->
              <div class="d-flex justify-content-center mt-4" v-if="salesPagination.last_page > 1">
                <nav aria-label="Sales pagination">
                  <ul class="pagination">
                    <li class="page-item" :class="{ disabled: salesPagination.current_page === 1 }">
                      <button class="page-link" @click="changeSalesPage(salesPagination.current_page - 1)">
                        &laquo;
                      </button>
                    </li>
                    <li class="page-item" v-for="page in salesPageNumbers" :key="page"
                        :class="{ active: page === salesPagination.current_page }">
                      <button class="page-link" @click="changeSalesPage(page)">
                        {{ page }}
                      </button>
                    </li>
                    <li class="page-item" :class="{ disabled: salesPagination.current_page === salesPagination.last_page }">
                      <button class="page-link" @click="changeSalesPage(salesPagination.current_page + 1)">
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeSalesModal">
              Close
            </button>
            <div class="ms-auto fw-bold">
              Total Sales: {{ formatCurrency(totalSalesAmount) }} | 
              Total Commission: {{ formatCurrency(totalCommission) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resend commission email modal-->
    <div class="modal fade" :class="{ show: isResendModalOpen, 'd-block': isResendModalOpen }" tabindex="-1" v-if="isResendModalOpen && sellerForResend">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning text-white">
            <h5 class="modal-title">Resend Commission Email</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeResendModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="resendCommission">
              <div class="mb-3">
                <label for="resendDate" class="form-label">Date</label>
                <input 
                  type="date" 
                  class="form-control" 
                  id="resendDate" 
                  v-model="resendDate" 
                  required
                  :max="new Date().toISOString().split('T')[0]"
                >
              </div>
              
              <div v-if="resendSuccess" class="alert alert-success mt-3">
                {{ resendSuccess }}
              </div>
              
              <div v-if="resendError" class="alert alert-danger mt-3">
                {{ resendError }}
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeResendModal">Cancel</button>
                <button type="submit" class="btn btn-warning" :disabled="isResending">
                  <span v-if="isResending" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Resend Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isResendModalOpen }" v-if="isResendModalOpen"></div>
    
    <!-- Estados da aplicação -->
    <div v-if="isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading sellers...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button @click="fetchSellers()" class="btn btn-sm btn-outline-danger ms-2">Retry</button>
    </div>
    
    <div v-else>
      <!-- Tabela de vendedores -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="seller in sellers" :key="seller.id">
              <td>{{ seller.id }}</td>
              <td>{{ seller.name }}</td>
              <td>{{ seller.email }}</td>
              <td>{{ formatDate(seller.created_at) }}</td>
              <td>{{ formatDate(seller.updated_at) }}</td>
              <td>
                <div class="btn-group btn-group-sm" role="group">
                  <!-- View button -->
                  <button 
                    @click="openViewModal(seller)" 
                    class="btn btn-outline-primary" 
                    title="View Details"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <!-- Edit button -->
                  <button 
                    @click="openEditModal(seller)" 
                    class="btn btn-outline-secondary" 
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>

                  <!-- Resend commission email -->
                  <button 
                    @click="openResendModal(seller)" 
                    class="btn btn-outline-warning" 
                    title="Resend Commission Email"
                  >
                    <i class="bi bi-envelope-arrow-up"></i>
                  </button>

                  <!-- Delete button -->
                  <button 
                    @click="openDeleteModal(seller)" 
                    class="btn btn-outline-danger" 
                    title="Delete"
                  >
                    <i class="bi bi-trash"></i>
                  </button>

                  <button @click="viewSales(seller)" class="btn btn-outline-info" title="Sales">
                    <i class="bi bi-graph-up"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Componente de paginação melhorado -->
      <div v-if="showPagination" class="mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: isFirstPage }">
              <button class="page-link" @click="goToPreviousPage">
                &laquo; Previous
              </button>
            </li>
            
            <li class="page-item" v-for="page in pageNumbers" :key="page"
                :class="{ active: isCurrentPage(page) }">
              <button class="page-link" @click="goToPage(page)">
                {{ page }}
              </button>
            </li>
            
            <li class="page-item" :class="{ disabled: isLastPage }">
              <button class="page-link" @click="goToNextPage">
                Next &raquo;
              </button>
            </li>
          </ul>
        </nav>
        
        <div class="text-muted text-center mt-2">
          Showing {{ pagination.meta.from }} to {{ pagination.meta.to }} of {{ pagination.meta.total }} entries
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, inject, defineComponent, onMounted, computed } from 'vue';
import { SellerController } from '../controllers/SellerController';

export default defineComponent({
  name: 'SellerListView',
  setup() {
    // Acessando o authService via inject
    const authService = inject('auth');
    const apiService = authService.apiService; // Acessando o ApiService do authService
    
    const controller = new SellerController(apiService);

    const openCreateModal = () => {
      controller.isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
      controller.isCreateModalOpen.value = false;
      controller.newSeller.value = { name: '', email: '' };
    };

    const createSeller = async () => {
      await controller.createSeller();
    };

    const openEditModal = (seller: Seller) => {
      controller.openEditModal(seller);
    };

    const closeEditModal = () => {
      controller.closeEditModal();
    };

    const updateSeller = async () => {
      await controller.updateSeller();
    };

    const formatTimeSince = (dateString: string) => {
      const now = new Date();
      const updatedAt = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const formatDateTime = (dateString: string) => {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const openViewModal = (seller: Seller) => {
      controller.openViewModal(seller);
    };

    const closeViewModal = () => {
      controller.closeViewModal();
    };
    
    const openDeleteModal = (seller: Seller) => {
      controller.openDeleteModal(seller);
    };

    const closeDeleteModal = () => {
      controller.closeDeleteModal();
    };

    const confirmDelete = async () => {
      await controller.confirmDelete();
    };

    // Cria uma referência para o método fetchSellers
    const fetchSellers = (page?: number) => {
      return controller.fetchSellers(page || 1);
    };

    // Carrega dados iniciais
    onMounted(() => {
      fetchSellers(1);
    });

    // Formatação de data
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Métodos de paginação
    const goToPage = (page: number) => {
      if (page >= 1 && page <= controller.pagination.value.meta.last_page) {
        controller.fetchSellers(page);
      }
    };

    const goToPreviousPage = () => {
      if (!isFirstPage.value) {
        goToPage(controller.pagination.value.meta.current_page - 1);
      }
    };

    const goToNextPage = () => {
      if (!isLastPage.value) {
        goToPage(controller.pagination.value.meta.current_page + 1);
      }
    };

    // Computed properties
    const showPagination = computed(() => {
      return controller.pagination.value.meta.total > controller.pagination.value.meta.per_page;
    });

    const isFirstPage = computed(() => {
      return controller.pagination.value.meta.current_page === 1;
    });

    const isLastPage = computed(() => {
      return controller.pagination.value.meta.current_page === controller.pagination.value.meta.last_page;
    });

    const pageNumbers = computed(() => {
      const pages = [];
      const current = controller.pagination.value.meta.current_page;
      const last = controller.pagination.value.meta.last_page;
      
      // Mostra até 5 páginas ao redor da atual
      for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
        pages.push(i);
      }
      
      return pages;
    });

    const isCurrentPage = (page: number) => {
      return page === controller.pagination.value.meta.current_page;
    };

    const formatCurrency = (value: string | number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value));
    };

    const calculateNetValue = (sale: Sale) => {
      return Number(sale.amount) - Number(sale.commission);
    };

    const changeSalesPage = async (page: number) => {
      if (page >= 1 && page <= controller.salesPagination.value.last_page) {
        await controller.fetchSellerSales(controller.currentSalesSeller.value?.id || 0, page);
      }
    };

    // Computed properties para vendas
    const salesPageNumbers = computed(() => {
      const pages = [];
      const current = controller.salesPagination.value.current_page;
      const last = controller.salesPagination.value.last_page;
      
      for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
        pages.push(i);
      }
      return pages;
    });

    const totalSalesAmount = computed(() => {
      return controller.sellerSales.value.reduce(
        (sum, sale) => sum + Number(sale.amount), 0
      );
    });

    const totalCommission = computed(() => {
      return controller.sellerSales.value.reduce(
        (sum, sale) => sum + Number(sale.commission), 0
      );
    });

    const isResendModalOpen = ref(false);
    const sellerForResend = ref<Seller | null>(null);
    const resendDate = ref(new Date().toISOString().split('T')[0]);
    const isResending = computed(() => controller.isResending.value);
    const resendError = computed(() => controller.resendError.value);
    const resendSuccess = computed(() => controller.resendSuccess.value);
    
    const openResendModal = (seller: Seller) => {
      sellerForResend.value = seller;
      isResendModalOpen.value = true;
      controller.resendError.value = null;
      controller.resendSuccess.value = null;
    };

    const closeResendModal = () => {
      isResendModalOpen.value = false;
      sellerForResend.value = null;
    };

    const resendCommission = async () => {
      if (sellerForResend.value) {
        await controller.resendCommissionEmail(
          sellerForResend.value.id, 
          resendDate.value
        );
        // Fecha automaticamente após 3 segundos se sucesso
        if (controller.resendSuccess.value) {
          setTimeout(() => {
            closeResendModal();
          }, 3000);
        }
      }
    };

    // Expõe para o template
    return {
      // Dados
      sellers: controller.sellers,
      isLoading: controller.isLoading,
      error: controller.error,
      pagination: controller.pagination,
      
      // Métodos
      fetchSellers, // Usando nossa referência local
      viewSeller: controller.viewSeller.bind(controller),
      editSeller: controller.editSeller.bind(controller),
      deleteSeller: controller.deleteSeller.bind(controller),
      viewSales: controller.viewSales.bind(controller),
      formatDate,
      goToPage,
      goToPreviousPage,
      goToNextPage,
      isCreateModalOpen: controller.isCreateModalOpen,
      newSeller: controller.newSeller,
      openCreateModal,
      closeCreateModal,
      createSeller, 
      isEditModalOpen: controller.isEditModalOpen,
      currentSeller: controller.currentSeller,
      openEditModal,
      closeEditModal,
      updateSeller, 
      isDeleteModalOpen: controller.isDeleteModalOpen,
      sellerToDelete: controller.sellerToDelete,
      isViewModalOpen: controller.isViewModalOpen,
      selectedSeller: controller.selectedSeller,
      openViewModal,
      closeViewModal,
      formatTimeSince, 
      formatDateTime, 
      openDeleteModal,
      closeDeleteModal,
      confirmDelete, 
      isSalesModalOpen: controller.isSalesModalOpen,
      sellerSales: controller.sellerSales,
      currentSalesSeller: controller.currentSalesSeller,
      salesPagination: controller.salesPagination,
      openSalesModal: controller.openSalesModal.bind(controller),
      closeSalesModal: controller.closeSalesModal.bind(controller),
      changeSalesPage,
      formatCurrency,
      calculateNetValue,
      salesPageNumbers,
      totalSalesAmount,
      totalCommission, 
      isResendModalOpen,
      sellerForResend,
      resendDate,
      isResending,
      resendError,
      resendSuccess,
      openResendModal,
      closeResendModal,
      resendCommission, 
      
      // Computed
      showPagination,
      isFirstPage,
      isLastPage,
      pageNumbers,
      isCurrentPage
    };
  }
});
</script>

<style scoped>
.btn-group {
  flex-wrap: nowrap;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}

.table-responsive {
  margin-bottom: 20px;
}

/* Estilo para o modal */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-backdrop {
  opacity: 0.5;
}
.btn-outline-warning {
  color: #ffc107;
  border-color: #ffc107;
}
.btn-outline-warning:hover {
  color: #212529;
  background-color: #ffc107;
  border-color: #ffc107;
}
</style>