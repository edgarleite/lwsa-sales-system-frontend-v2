<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Sales List</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> New Sale
      </button>
    </div>

    <!-- Modal de Criação -->
    <div class="modal fade" :class="{ show: isCreateModalOpen, 'd-block': isCreateModalOpen }" tabindex="-1" v-if="isCreateModalOpen">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Register New Sale</h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createSale">
              <div class="mb-3">
                <label for="sellerSelect" class="form-label">Seller</label>
                <select class="form-select" id="sellerSelect" v-model="newSale.seller_id" required>
                  <option value="" disabled selected>Select a seller</option>
                  <option v-for="seller in sellersDropdown" 
                          :key="seller.id" 
                          :value="seller.id">
                    {{ seller.name }} (ID: {{ seller.id }})
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="saleAmount" class="form-label">Amount (R$)</label>
                <input type="number" step="0.01" class="form-control" id="saleAmount" 
                       v-model="newSale.amount" required min="0.01">
              </div>
              <div class="mb-3">
                <label for="saleDate" class="form-label">Date</label>
                <input type="date" class="form-control" id="saleDate" 
                       v-model="newSale.sale_date" required>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeCreateModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Register Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: isCreateModalOpen }" v-if="isCreateModalOpen"></div>

    <!-- Estados da aplicação -->
    <div v-if="isLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading sales...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button @click="fetchSales()" class="btn btn-sm btn-outline-danger ms-2">Retry</button>
    </div>

    <!-- Modal de Visualização -->
    <div class="modal fade" :class="{ show: isViewModalOpen, 'd-block': isViewModalOpen }" tabindex="-1" v-if="isViewModalOpen && selectedSale">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Sale Details #{{ selectedSale.id }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeViewModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6 class="text-muted">Sale Information</h6>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <strong>ID:</strong> {{ selectedSale.id }}
                  </li>
                  <li class="list-group-item">
                    <strong>Seller ID:</strong> {{ selectedSale.seller_id }}
                  </li>
                  <li class="list-group-item">
                    <strong>Amount:</strong> {{ formatCurrency(selectedSale.amount) }}
                  </li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Financial Details</h6>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <strong>Commission:</strong> {{ formatCurrency(selectedSale.commission) }}
                  </li>
                  <li class="list-group-item">
                    <strong>Net Value:</strong> {{ formatCurrency(calculateNetValue(selectedSale)) }}
                  </li>
                  <li class="list-group-item">
                    <strong>Sale Date:</strong> {{ formatDate(selectedSale.sale_date) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">Close</button>
            <button type="button" class="btn btn-primary" @click="openEditModal(selectedSale)">
              <i class="bi bi-pencil"></i> Edit Sale
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edição -->
    <div class="modal fade" :class="{ show: isEditModalOpen, 'd-block': isEditModalOpen }" tabindex="-1" v-if="isEditModalOpen && selectedSale">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Sale #{{ selectedSale.id }}</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateSale">
              <div class="mb-3">
                <label for="editSellerId" class="form-label">Seller</label>
                <select class="form-select" id="editSellerId" v-model="selectedSale.seller_id" required>
                  <option v-if="isLoadingSellers" value="" disabled>Loading sellers...</option>
                  <option 
                    v-for="seller in sellersDropdown" 
                    :key="seller.id" 
                    :value="seller.id"
                    :selected="seller.id === selectedSale.seller_id"
                  >
                    {{ seller.name }} (ID: {{ seller.id }})
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="editAmount" class="form-label">Amount (R$)</label>
                <input type="number" step="0.01" class="form-control" id="editAmount" 
                       v-model="selectedSale.amount" required min="0.01">
              </div>
              <div class="mb-3">
                <label for="editSaleDate" class="form-label">Date</label>
                <input type="date" class="form-control" id="editSaleDate" 
                       v-model="selectedSale.sale_date" required>
              </div>
              <div v-if="error" class="alert alert-danger mt-3">
                {{ error }}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeEditModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                  <span v-if="isUpdating" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Update Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Exclusão -->
    <div class="modal fade" :class="{ show: isDeleteModalOpen, 'd-block': isDeleteModalOpen }" tabindex="-1" v-if="isDeleteModalOpen && saleToDelete">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete sale <strong>#{{ saleToDelete.id }}</strong>?</p>
            <p class="text-danger">This action cannot be undone!</p>
            <div v-if="error" class="alert alert-danger mt-3">
              {{ error }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteSale" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrops -->
    <div class="modal-backdrop fade" :class="{ show: isViewModalOpen }" v-if="isViewModalOpen"></div>
    <div class="modal-backdrop fade" :class="{ show: isEditModalOpen }" v-if="isEditModalOpen"></div>
    <div class="modal-backdrop fade" :class="{ show: isDeleteModalOpen }" v-if="isDeleteModalOpen"></div>

    <div v-else>
      <!-- Tabela de vendas -->
      <div class="table-responsive">
        <table class="table table-striped table-hover">
            <thead class="table-dark">
            <tr>
                <th>ID</th>
                <th>Seller ID</th>
                <th class="text-end">Amount</th>
                <th class="text-end">Commission</th>
                <th class="text-end">Net Value</th>
                <th>Sale Date</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="sale in sales" :key="sale.id">
                <td>{{ sale.id }}</td>
                <td>{{ sale.seller_id }}</td>
                <td class="text-end currency-cell">{{ formatCurrency(sale.amount) }}</td>
                <td class="text-end currency-cell">{{ formatCurrency(sale.commission) }}</td>
                <td class="text-end currency-cell">{{ formatCurrency(calculateNetValue(sale)) }}</td>
                <td>{{ formatDate(sale.sale_date) }}</td>
                <td>
                <div class="btn-group btn-group-sm" role="group">
                  <!-- View button -->
                  <button 
                    @click="openViewModal(sale)" 
                    class="btn btn-outline-primary" 
                    title="View Details"
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <!-- Edit button -->
                  <button 
                    @click="openEditModal(sale)" 
                    class="btn btn-outline-secondary" 
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>

                  <!-- Delete button -->
                  <button 
                    @click="openDeleteModal(sale)" 
                    class="btn btn-outline-danger" 
                    title="Delete"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                </td>
            </tr>
            </tbody>
        </table>
    </div>

      <!-- Paginação -->
      <div v-if="shouldShowPagination" class="mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: !pagination.links.prev }">
              <button class="page-link" @click="goToPage(pagination.meta.current_page - 1)">
                &laquo; Previous
              </button>
            </li>
            
            <li class="page-item" v-for="page in pageNumbers" :key="page"
                :class="{ active: page === pagination.meta.current_page }">
              <button class="page-link" @click="goToPage(page)">
                {{ page }}
              </button>
            </li>
            
            <li class="page-item" :class="{ disabled: !pagination.links.next }">
              <button class="page-link" @click="goToPage(pagination.meta.current_page + 1)">
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
import { inject, defineComponent, onMounted, computed } from 'vue';
import { SalesController } from '../controllers/SalesController';
import { formatCurrency, formatDate } from '../helpers/formatters';

export default defineComponent({
  name: 'SellerListView',
  setup() {
    // Acessando o authService via inject
    const authService = inject('auth');
    const apiService = authService.apiService; // Acessando o ApiService do authService
    
    const controller = new SalesController(apiService);

    const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
    };
    
    const calculateNetValue = (sale: Sale) => {
      return Number(sale.amount) - Number(sale.commission);
    };

    const openCreateModal = async () => {
      await controller.fetchSellersForDropdown();
      controller.isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
      controller.isCreateModalOpen.value = false;
    };

    const goToPage = (page: number) => {
      if (page >= 1 && page <= controller.pagination.value.meta.last_page) {
        controller.fetchSales(page);
      }
    };

    // Adicione estes métodos
    const openViewModal = (sale: Sale) => {
      controller.openViewModal(sale);
    };

    const closeViewModal = () => {
      controller.closeViewModal();
    };

    const openEditModal = (sale: Sale) => {
      controller.openEditModal(sale);
    };

    const closeEditModal = () => {
      controller.closeEditModal();
    };

    const openDeleteModal = (sale: Sale) => {
      controller.openDeleteModal(sale);
    };

    const closeDeleteModal = () => {
      controller.closeDeleteModal();
    };

    const updateSale = async () => {
      await controller.updateSale();
    };

    const deleteSale = async () => {
      await controller.deleteSale();
    };

    // Carrega dados iniciais
    onMounted(() => {
      controller.fetchSales();
    });

    // Computed properties
    const shouldShowPagination = computed(() => {
      return controller.shouldShowPagination();
    });

    const pageNumbers = computed(() => {
      const pages = [];
      const current = controller.pagination.value.meta.current_page;
      const last = controller.pagination.value.meta.last_page;
      
      for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
        pages.push(i);
      }
      return pages;
    });

    return {
      // Dados
      sales: controller.sales,
      isLoading: controller.isLoading,
      error: controller.error,
      pagination: controller.pagination,
      isLoadingSellers: controller.isLoadingSellers, 
      isCreateModalOpen: controller.isCreateModalOpen,
      isViewModalOpen: controller.isViewModalOpen,
      isEditModalOpen: controller.isEditModalOpen,
      isDeleteModalOpen: controller.isDeleteModalOpen,
      isUpdating: controller.isUpdating,
      isDeleting: controller.isDeleting,
      newSale: controller.newSale,
      selectedSale: controller.selectedSale,
      saleToDelete: controller.saleToDelete,
      sellersDropdown: controller.sellersDropdown,
      updateSale,
      deleteSale,
      
      // Métodos
      fetchSales: controller.fetchSales.bind(controller),
      createSale: controller.createSale.bind(controller),
      openCreateModal,
      openViewModal,
      closeViewModal,
      openEditModal,
      closeEditModal,
      openDeleteModal,
      closeDeleteModal,
      closeCreateModal,
      goToPage,
      formatCurrency,
      formatDate,
      calculateNetValue,
      
      // Computed
      shouldShowPagination,
      pageNumbers
    };
  }
});
</script>

<style scoped>
.currency-cell {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}
.table-responsive {
  margin-bottom: 20px;
}
.page-item.disabled .page-link {
  opacity: 0.5;
  pointer-events: none;
}
.btn-group {
  flex-wrap: nowrap;
}
</style>