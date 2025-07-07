<template>
  <div class="container">
    <h2 class="table-title">App Master</h2>

    <!-- 검색 필터 -->
    <div class="search-bar">
      <div class="search-left">
        <select v-model="searchField">
          <option value="appName">App Name</option>
          <option value="appType">App Type</option>
        </select>
        <input v-model="searchKeyword" placeholder="검색어 입력" @keydown.enter="applySearch"/>
        <button @click="applySearch">검색</button>
        <button @click="resetFilters">초기화</button>
      </div>
      <div class="search-right">
        <button @click="openInsertModal">+ 등록</button>
      </div>
    </div>

    <!-- 테이블 -->
    <table class="mapping-table">
      <thead>
        <tr>
          <th>AID</th>
          <th>App Name</th>
          <th>App Type</th>
          <th>App ID</th>
          <th>Comp Count</th>
          <th>Edit</th>
          <th>Comp Mapping</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedAppList" :key="item.appId">
          <td>{{ item.aid    }}</td>
          <td>{{ item.appName  }}</td>
          <td>{{ item.appType  }}</td>
          <td>{{ item.appId  }}</td>
          <td>{{ item.compCount  }}</td>
          <td>
            <button class="edit-button" @click="openEditModal(item)">Edit</button>
          </td>
          <td>  
            <button class="edit-button" @click="openMappingModal(item)">Mapping</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="table-pagination">
      <button @click="goToPrevPage" :disabled="currentPage === 1">Prev</button>
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="{ 'active-page': page === currentPage }"
      >
        {{ page }}
      </button>
      <button @click="goToNextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>

  <AppMasterModal
    v-if="showModal"
    :mode="formMode"
    :initialData="selectedItem"
    @close="showModal = false"
    @saved="handleSaved"
  />

  <AppMasterMappingModal
    v-if="showMappingModal"
    :item="selectedItem"
    :availableList="availableItems"
    :selectedList="selectedMapped"
    @close="showMappingModal = false"
    @submit="handleMappingSubmit"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppMasterModal from './AppMasterModal.vue'
import AppMasterMappingModal from './AppMasterMappingModal.vue'

const searchField = ref('appName')
const orderBy = ref('appName')
const searchKeyword = ref('')
const showModal = ref(false)
const selectedItem = ref(null)
const formMode = ref('insert')

const showMappingModal = ref(false)
const availableItems = ref([])
const selectedMapped = ref([])

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

const pagedAppList = ref([])

const fetchAppData = async () => {
  try {
    let url = `http://localhost:8123/appmapping/appList?pageNo=${currentPage.value}&pageSize=${pageSize.value}`

    if (searchKeyword.value.trim()) {
      url += `&searchType=${searchField.value}&searchKeyword=${encodeURIComponent(searchKeyword.value)}`
    }

    const response = await fetch(url)
    const data = await response.json()
    pagedAppList.value = data.content
    totalPages.value = data.totalPages
  } catch (err) {
    console.error('API 호출 실패', err)
  }
}

onMounted(fetchAppData)
watch(currentPage, fetchAppData)
watch(orderBy, fetchAppData)
const applySearch = () => {
  currentPage.value = 1
  fetchAppData()
}

const resetFilters = () => {
  searchKeyword.value = ''
  searchField.value = 'appName'
  currentPage.value = 1
  fetchAppData()
}

const goToPage = (page) => {
  if (page !== currentPage.value) currentPage.value = page
}

const goToPrevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const visiblePages = computed(() => {
  const pages = []
  const maxButtons = 10
  const half = Math.floor(maxButtons / 2)
  const total = totalPages.value
  const current = currentPage.value

  let start = Math.max(1, current - half)
  let end = start + maxButtons - 1
  if (end > total) end = total
  start = Math.max(1, end - maxButtons + 1)

  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const openInsertModal = () => {
  formMode.value = 'insert'
  selectedItem.value = {}
  showModal.value = true
}

const openEditModal = (item) => {
  formMode.value = 'edit'
  selectedItem.value = { ...item }
  showModal.value = true
}

const openMappingModal = async (item) => {
  try {
    selectedItem.value = item

    const response = await fetch(`http://localhost:8123/appmapping/AppToCompList?aid=${item.aid}`)
    const data = await response.json()

    selectedMapped.value = data.mappedList
    availableItems.value = data.unmappedList

    showMappingModal.value = true
  } catch (error) {
    console.error('팝업 데이터 요청 실패:', error)
  }
}

const handleMappingSubmit = async ({ aid, addedList, removedList }) => {
  const payload = {
    aid,
    addList: addedList.map(item => item.cid),
    removeList: removedList.map(item => item.cid)
  }
  console.log(payload);
  try {
    const res = await fetch('http://localhost:8123/appmapping/AppToCompModify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(`서버 오류: ${res.status}`)

    alert('저장되었습니다')
    showMappingModal.value = false
    fetchAppData()
  } catch (err) {
    console.error('저장 실패:', err)
    alert('저장 실패: ' + err.message)
  }
}

const handleSaved = () => {
  showModal.value = false
  fetchAppData()
}
</script>

<style scoped>
.container {
  padding: 24px;
  max-width: 1200px;
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
