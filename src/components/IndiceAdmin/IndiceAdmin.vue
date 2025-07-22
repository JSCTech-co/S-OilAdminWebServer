<template>
    <div class="container">
        <h2 class="table-title">Indice Admin</h2>

        <!-- 검색 필터 -->
        <div class="search-bar">
            <div class="search-left">
                <select v-model="searchField">
                    <option value="compId">compId</option>
                    <option value="nameKor">Name_Kor</option>
                    <option value="nameEng">Name_Eng</option>
                </select>
                <input v-model="searchKeyword" placeholder="검색어 입력" @keydown.enter="applySearch" />
                <button @click="applySearch">검색</button>
                <button @click="resetFilters">초기화</button>
                <div class="radio-group">
                    <label class="radio-label">isActive:</label>
                    <label class="radio-inline">
                        <input type="radio" value="Y" v-model="searchActive" /> Y
                    </label>
                    <label class="radio-inline">
                        <input type="radio" value="N" v-model="searchActive" /> N
                    </label>
                </div>
            </div>
            <div class="search-right">
                <button @click="openInsertModal">+ 등록</button>
            </div>
        </div>

        <!-- 테이블 -->
        <table class="mapping-table">
            <thead>
                <tr>
                    <th>Comp ID</th>
                    <th>Comp Type</th>
                    <th>Name(KOR)</th>
                    <th>Name(ENG)</th>
                    <th>CurrentMonth</th>
                    <th>Flag</th>
                    <th>SecondaryName</th>
                    <th>SecondaryValue</th>
                    <th>UOM</th>
                    <th>UOM(KOR)</th>
                    <th>ETLJobName</th>
                    <th>isActive</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in indiceList" :key="item.cid">
                    <td>{{ item.compId }}</td>
                    <td>{{ item.compType }}</td>
                    <td>{{ item.nameKor }}</td>
                    <td>{{ item.nameEng }}</td>
                    <td>
                        <div class="long-text-cell">
                            <span class="long-text-content">{{ item.currentMonth }}</span>
                            <button v-if="item.currentMonth" class="btn-view-more" @click="openTextModal('CurrentMonth', item.currentMonth)">...</button>
                        </div>
                    </td>
                    <td>
                        <div class="long-text-cell">
                            <span class="long-text-content">{{ item.flag }}</span>
                            <button v-if="item.flag" class="btn-view-more" @click="openTextModal('Flag', item.flag)">...</button>
                        </div>
                    </td>
                    <td>{{ item.secondaryName }}</td>
                    <td>
                        <div class="long-text-cell">
                            <span class="long-text-content">{{ item.secondaryValue }}</span>
                            <button v-if="item.secondaryValue" class="btn-view-more" @click="openTextModal('SecondaryValue', item.secondaryValue)">...</button>
                        </div>
                    </td>
                    <td>{{ item.uom }}</td>
                    <td>{{ item.uomKorean }}</td>
                    <td class="indice-etlJobName">{{ item.etljobName }}</td>
                    <td>{{ item.isActive }}</td>
                    <td>
                        <button class="edit-button" @click="openEditModal(item)">Edit</button>
                    </td>
                    
                </tr>
            </tbody>
        </table>

        <!-- 페이지네이션 -->
        <div class="table-pagination">
            <button @click="goToPrevPage" :disabled="currentPage === 1">Prev</button>
            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                :class="{ 'active-page': page === currentPage }">
                {{ page }}
            </button>
            <button @click="goToNextPage" :disabled="currentPage === totalPages">Next</button>
        </div>

        <IndiceAdminTextModal
            :visible="isTextModalVisible"
            :title="modalTitle"
            :content="modalContent"
            @close="closeTextModal"
        />

        <IndiceAdminModal
            v-if="showModal"
            :mode="formMode"
            :initial-data="selectedItem"
            @close="closeModal"
            @saved="handleSave"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import IndiceAdminTextModal from './IndiceAdminTextModal.vue'
import IndiceAdminModal from './IndiceAdminModal.vue'

const isTextModalVisible = ref(false)
const modalTitle = ref('')
const modalContent = ref('')
const searchActive = ref('Y')

const openTextModal = (title, content) => {
  modalTitle.value = title
  modalContent.value = content
  isTextModalVisible.value = true
}

const closeTextModal = () => {
  isTextModalVisible.value = false
}

const searchField = ref('compId')
const orderBy = ref('compId')
const searchKeyword = ref('')

const applySearch = () => {
  currentPage.value = 1;
  fetchData();
};

const resetFilters = () => {
  searchField.value = 'compId';
  searchKeyword.value = '';
  searchActive.value = 'Y';
  currentPage.value = 1;
  fetchData();
};
const showModal = ref(false)
const formMode = ref('insert')
const selectedItem = ref(null)

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

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

const indiceList = ref([])

const fetchData = async () => {
    try{
        let url = `http://localhost:8123/indice/select?pageNo=${currentPage.value}&pageSize=${pageSize.value}&isActive=${searchActive.value}`

        if (searchKeyword.value.trim()) {
        url += `&searchType=${searchField.value}&searchKeyword=${encodeURIComponent(searchKeyword.value)}`
        }

        const response = await fetch(url)
        const data = await response.json()
        indiceList.value = data.content
        totalPages.value = data.totalPages
    }catch (err) {
        console.error('API 호출 실패', err)
    }
}

onMounted(fetchData)

const openInsertModal = () => {
  formMode.value = 'insert'
  selectedItem.value = null
  showModal.value = true
}

const openEditModal = (item) => {
  formMode.value = 'edit'
  selectedItem.value = item
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = () => {
  fetchData()
  closeModal()
}
</script>
<style scope>
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
  justify-content: space-between;
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
  border-collapse: collapse;
  margin-bottom: 12px;
}
.mapping-table th,
.mapping-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
  font-size: 11px;
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
.long-text-cell {
    display: flex;
    align-items: center;
    max-width: 200px;
}
.long-text-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-grow: 1;
}
.btn-view-more {
    padding: 0 5px;
    margin-left: 5px;
    height: 20px;
    line-height: 1;
    font-size: 12px;
}
.indice-currentMonth, .indice-secondaryValue{
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.indice-etlJobName{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
}
.radio-group{
    display: inline-flex;
    margin-left : 15px;
}
</style>