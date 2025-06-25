<template>
  <div class="container">
    <h2 class="table-title">Comp to Role Mapping</h2>

    <!-- 검색 필터 -->
    <div class="search-bar">
      <select v-model="searchField">
        <option value="compId">Comp ID</option>
        <option value="compType">Comp Type</option>
        <option value="compName">Comp Name</option>
      </select>
      <input v-model="searchKeyword" placeholder="검색어 입력" @keydown.enter="applySearch"/>
      <button @click="applySearch">검색</button>
      <button @click="resetFilters">초기화</button>
      <div class="order-by">
        <label>정렬</label>
        <select v-model="orderBy">
          <option value="compId">ID</option>
          <option value="compType">Type</option>
          <option value="compName">Name</option>
        </select>
      </div>
    </div>

    <!-- 테이블 -->
    <table class="mapping-table">
      <thead>
        <tr>
          <th>Comp ID</th>
          <th>Comp Type</th>
          <th>Comp Name</th>
          <th>Role Count</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedCompList" :key="item.compId">
          <td>{{ item.compId    }}</td>
          <td>{{ item.compType  }}</td>
          <td>{{ item.compName  }}</td>
          <td>{{ item.roleCount }}</td>
          <td>
            <button class="edit-button" @click="openEditModal(item)">Edit</button>
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

  <CompRoleMappingModal
    v-if="showModal"
    :item="selectedItem"
    :availableList="availableItems"
    :selectedList="selectedMapped"
    @close="showModal = false"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import CompRoleMappingModal from './CompRoleMappingModal.vue'

const searchField = ref('compId')
const orderBy = ref('compId')
const searchKeyword = ref('')
const showModal = ref(false)
const selectedItem = ref(null)
const selectedMapped = ref([])
const availableItems = ref([])

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

const pagedCompList = ref([])

const fetchCompData = async () => {
  try {
    let url = `http://localhost:8123/roles/CompToRoleCompList?pageNo=${currentPage.value}&pageSize=${pageSize.value}&orderBy=${orderBy.value}`

    if (searchKeyword.value.trim()) {
      url += `&searchType=${searchField.value}&searchKeyword=${encodeURIComponent(searchKeyword.value)}`
    }

    const response = await fetch(url)
    const data = await response.json()
    pagedCompList.value = data.content.map(comp => ({
      compId: comp.compId,
      compType: comp.compType,
      compName: comp.compName,
      roleCount: comp.roleCount,
    }))
    totalPages.value = data.totalPages
  } catch (err) {
    console.error('API 호출 실패', err)
  }
}

onMounted(fetchCompData)
watch(currentPage, fetchCompData)
watch(orderBy, fetchCompData)
const applySearch = () => {
  currentPage.value = 1
  fetchCompData()
}

const resetFilters = () => {
  searchKeyword.value = ''
  searchField.value = 'compId'
  currentPage.value = 1
  fetchCompData()
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

const openEditModal = async (item) => {
  try {
    selectedItem.value = item

    const response = await fetch(`http://localhost:8123/roles/CompToRoleMappingList?compId=${item.compId}`)
    const data = await response.json()

    selectedMapped.value = data.mappedList
    availableItems.value = data.unmappedList

    showModal.value = true
  } catch (error) {
    console.error('팝업 데이터 요청 실패:', error)
  }
}

const groupByCompType = (list) => {
  return list.reduce((acc, curr) => {
    const { compType, compId } = curr
    if (!acc[compType]) acc[compType] = []
    acc[compType].push(compId)
    return acc
  }, { KPI: [], KOP: [], Report: [] })
}

const handleSubmit = async ({ compId, compType, addedList, removedList }) => {
  const payload = {
    compId,
    compType,
    addedRole: addedList.map(item => item.roleId),
    removedRole: removedList.map(item => item.roleId)
  }
  console.log(payload);
  try {
    const res = await fetch('http://localhost:8123/roles/CompToRoleModify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error(`서버 오류: ${res.status}`)

    alert('저장되었습니다')
    showModal.value = false
    fetchCompData()
  } catch (err) {
    console.error('저장 실패:', err)
    alert('저장 실패: ' + err.message)
  }
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
