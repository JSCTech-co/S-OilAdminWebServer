<template>
    <div class="container">
    <h2 class="table-title">Overview Dashboard Management</h2>

    <!-- 검색 필터 -->
    <div class="search-bar">
      <select v-model="searchField">
        <option value="roleName">Role Name</option>
        <option value="roleId">Role ID</option>
      </select>
      <input v-model="searchKeyword" placeholder="검색어 입력" @keydown.enter="applySearch"/>
      <button @click="applySearch">검색</button>
      <button @click="resetFilters">초기화</button>
      <div class="order-by">
        <label style="margin-right:5px;">정렬</label>
        <select v-model="orderBy">
          <option value="roleName">Name</option>
          <option value="roleId">ID</option>
        </select>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="mapping-table">
        <thead>
          <tr>
            <th>Role ID</th>
            <th>Role Name</th>
            <th>Indice 1</th>
            <th>Indice 2</th>
            <th>Indice 3</th>
            <th>Indice 4</th>
            <th>Widget 1</th>
            <th>Widget 2</th>
            <th>Widget 3</th>
            <th>Widget 4</th>
            <th>Widget 5</th>
            <th>Widget 6</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in overviewList" :key="item.roleId">
            <td>{{ item.roleId }}</td>
            <td>{{ item.roleName }}</td>
            <td>{{ getIndiceName(item.indices, 1) }}</td>
            <td>{{ getIndiceName(item.indices, 2) }}</td>
            <td>{{ getIndiceName(item.indices, 3) }}</td>
            <td>{{ getIndiceName(item.indices, 4) }}</td>
            <td>{{ getWidgetName(item.widgets, 1) }}</td>
            <td>{{ getWidgetName(item.widgets, 2) }}</td>
            <td>{{ getWidgetName(item.widgets, 3) }}</td>
            <td>{{ getWidgetName(item.widgets, 4) }}</td>
            <td>{{ getWidgetName(item.widgets, 5) }}</td>
            <td>{{ getWidgetName(item.widgets, 6) }}</td>
            <td><button @click="openEditModal(item)">수정</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 페이지네이션 -->
    <div class="table-pagination">
        <button @click="goToPrevPage" :disabled="currentPage === 1">Prev</button>
        <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
            :class="{ 'active-page': page === currentPage }">
            {{ page }}
        </button>
        <button @click="goToNextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
    
    <OverviewModal 
      v-if="isModalOpen"
      :initial-data="selectedItem"
      @close="closeModal"
      @saved="handleSave"
    />
</div>
</template>
<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import OverviewModal from './OverviewModal.vue'

const searchField = ref('roleName')
const orderBy = ref('roleName')
const searchKeyword = ref('')
const appliedSearchKeyword = ref('')
const appliedSearchField = ref('roleId')

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const overviewList = ref([])

const isModalOpen = ref(false)
const selectedItem = ref(null)

const openEditModal = (item) => {
  selectedItem.value = item
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedItem.value = null
}

const applySearch = () => {
  currentPage.value = 1;
  appliedSearchKeyword.value = searchKeyword.value;
  appliedSearchField.value = searchField.value;
  fetchData();
};

const resetFilters = () => {
  searchField.value = 'roleId';
  searchKeyword.value = '';
  appliedSearchField.value = 'roleId';
  appliedSearchKeyword.value = '';
  orderBy.value = 'roleName';
  currentPage.value = 1;
  fetchData();
};

const handleSave = async () => {
  await fetchData(); // Refresh data after save
  const updatedItem = overviewList.value.find(item => item.roleId === selectedItem.value.roleId);
  if (updatedItem) {
    selectedItem.value = updatedItem;
  }
}


const getIndiceName = (indices, order) => {
  if (!indices) return ''
  const indice = indices.find(i => i.widgetOrder === order)
  return indice ? indice.compNameKorean : ''
}

const getWidgetName = (widgets, order) => {
  if (!widgets) return ''
  const widget = widgets.find(w => w.widgetOrder === order)
  return widget ? widget.compNameKorean : ''
}

const fetchData = async () => {
    try{
        let url = `http://localhost:8123/overview/select?pageNo=${currentPage.value}&pageSize=${pageSize.value}&orderBy=${orderBy.value}`

        if (appliedSearchKeyword.value.trim()) {
        url += `&searchType=${appliedSearchField.value}&searchKeyword=${encodeURIComponent(appliedSearchKeyword.value)}`
        }

        const response = await fetch(url)
        const data = await response.json()
        overviewList.value = data.content
        totalPages.value = data.totalPages
    }catch (err) {
        console.error('API 호출 실패', err)
    }
}
onMounted(fetchData)

const visiblePages = computed(() => {
  const pages = []
  let startPage = Math.max(1, currentPage.value - 2)
  let endPage = Math.min(totalPages.value, currentPage.value + 2)

  if (startPage === 1) {
    endPage = Math.min(totalPages.value, 5)
  }
  if (endPage === totalPages.value) {
    startPage = Math.max(1, totalPages.value - 4)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})
const goToPage = (page) => {
  currentPage.value = page
  fetchData()
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

watch(orderBy, () => {
    fetchData();
});

watch(isModalOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
    document.body.style.overflow = '';
});

</script>
<style scoped>
.container {
  padding: 24px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.search-bar select,
.search-bar input,
.search-bar button {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.mapping-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
  margin-bottom: 12px;
}
.mapping-table th,
.mapping-table td {
  border: 1px solid #ddd;
  padding: 4px 8px;
  text-align: left;
}
.edit-button {
  color: #1d4ed8;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
}
.table-pagination {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin: 16px 0;
}
.table-pagination button {
  padding: 0.3em 0.9em;
}
.table-pagination button.active-page {
  background-color: #7f7f7f;
  color: white;
  font-weight: bold;
  border-radius: 4px;
}
.order-by{
  margin-left: auto;
}
</style>