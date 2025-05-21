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
                    <button class="btn btn-outline-primary" title="View">
                    <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-secondary" title="Edit">
                    <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" title="Delete">
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
      isCreateModalOpen: controller.isCreateModalOpen,
      newSale: controller.newSale,
      sellersDropdown: controller.sellersDropdown,
      
      // Métodos
      fetchSales: controller.fetchSales.bind(controller),
      createSale: controller.createSale.bind(controller),
      openCreateModal,
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
</style>