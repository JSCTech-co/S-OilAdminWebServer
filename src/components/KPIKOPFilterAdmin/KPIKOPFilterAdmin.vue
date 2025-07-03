
<template>
  <div class="container">
    <h2>KPI/KOP Filter Admin</h2>
    <div class="search-bar">
      <div class="search-left">
        <select v-model="searchColumn" class="search-select">
          <option value="compId">Comp ID</option>
          <option value="compType">Comp TYPE</option>
          <option value="compName">Comp NAME</option>
          <option value="compNameKorean">Comp NAME KOR</option>
          <option value="FilterType">Filter Type</option>
          <option value="FilterName">Filter Name</option>
        </select>
        <input v-model="searchKeyword" class="search-input" placeholder="검색어 입력" />
        <button @click="search">검색</button>
        <button @click="resetSearch">초기화</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="comp-table">
        <thead>
          <tr>
            <th>Comp ID</th>
            <th>Comp Type</th>
            <th>Comp Name</th>
            <th>Comp Name KOR</th>
            <th>FilterCount</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in kpis" :key="item.compId">
            <tr @click="toggleAccordion(index)">
              <td>{{ item.compId }}</td>
              <td>{{ item.compType }}</td>
              <td>{{ item.compName }}</td>
              <td>{{ item.compNameKorean }}</td>
              <td>{{ item.filterCount }}</td>
            </tr>
            <tr v-if="openedIndex === index">
              <td colspan="5">
                <div class="filter-section">
                  <div v-if="item.filterCount === 0" class="filter-empty">
                    <div class="filter-header">
                      <span>등록된 필터가 없습니다.</span>
                      <button @click.stop="openCreateFilterModal(item)">Filter 등록</button>
                    </div>
                  </div>
                  <div v-else>
                    <div class="filter-header">
                      <span></span>
                      <button @click.stop="openCreateFilterModal(item)">Filter 등록</button>
                    </div>
                    <table class="filter-table">
                      <thead>
                        <tr>
                          <th>Filter ID</th>
                          <th>Type</th>
                          <th>Filter Name</th>
                          <th>Label</th>
                          <th>Field Name</th>
                          <th>Widget ID</th>
                          <th>VarOption ID</th>
                          <th>ObjId</th>
                          <th>QlikId</th>
                          <th>Page name</th>
                          <th>Seq</th>
                          <th>수정</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="filter in item.filters" :key="filter.filterId">
                          <td>{{ filter.filterId }}</td>
                          <td>{{ filter.filterType }}</td>
                          <td>{{ filter.filterName }}</td>
                          <td>{{ filter.filterLabel }}</td>
                          <td>{{ filter.fieldName }}</td>
                          <td>{{ filter.widgetObjectId }}</td>
                          <td>{{ filter.filterVariableOptionId }}</td>
                          <td>{{ filter.filterObjId }}</td>
                          <td>{{ filter.filterQlikId }}</td>
                          <td>{{ filter.pageName }}</td>
                          <td>{{ filter.filterSequence }}</td>
                          <td><button @click.stop="openEditFilterModal(filter, item)">수정</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button :disabled="page === 1" @click="prevPage">이전</button>
      <button
        v-for="n in visiblePages"
        :key="n"
        @click="goToPage(n)"
        :style="{ fontWeight: page === n ? 'bold' : 'normal' }"
      >
        {{ n }}
      </button>
      <button :disabled="page + 1 > totalPages" @click="nextPage">다음</button>
      <span>페이지 {{ page  }} / {{ totalPages }}</span>
    </div>

    <KPIKOPFilterAdminModal
      v-if="showModal"
      :mode="formMode"
      :initialData="selectedData"
      :compData="selectedComp"
      @close="showModal = false"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import KPIKOPFilterAdminModal from './KPIKOPFilterAdminModal.vue'

const kpis = ref([])
const page = ref(1)
const size = ref(10)
const totalPages = ref(0)
const openedIndex = ref(null)

const searchColumn = ref('compId')
const searchKeyword = ref('')
const isSearching = ref(false)

const showModal = ref(false)
const formMode = ref('insert')
const selectedData = ref({})
const selectedComp = ref(null)

const fetchList = async () => {
  try {
    const url = `http://localhost:8123/kpikopfilter/select?pageNo=${page.value}&pageSize=${size.value}`
    const res = await fetch(url)
    const data = await res.json()
    kpis.value = data.content
    totalPages.value = data.totalPages
    openedIndex.value = null
  } catch (err) {
    console.error('기본 목록 호출 실패', err)
  }
}

const fetchSearch = async () => {
  try {
    const url = `http://localhost:8123/kpikopfilter/select?pageNo=${page.value}&pageSize=${size.value}&searchType=${searchColumn.value}&searchKeyword=${searchKeyword.value}`
    const res = await fetch(url)
    const data = await res.json()
    kpis.value = data.content
    totalPages.value = data.totalPages
    openedIndex.value = null
  } catch (err) {
    console.error('검색 호출 실패', err)
  }
}

const search = () => {
  page.value = 1
  isSearching.value = true
  fetchSearch()
}

const resetSearch = () => {
  page.value = 1
  isSearching.value = false
  searchKeyword.value = ''
  searchColumn.value = 'compId'
  openedIndex.value = null
  fetchList()
}

const prevPage = () => {
  if (page.value > 1) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}
const goToPage = (n) => {
  if (n >= 1 && n <= totalPages.value) page.value = n
}
const visiblePages = computed(() => {
  const currentGroup = Math.floor((page.value-1) / 10)
  const start = currentGroup * 10 + 1
  const end = Math.min(start + 9, totalPages.value)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

watch(page, () => {
  isSearching.value ? fetchSearch() : fetchList()
  openedIndex.value = null;
})

const handleSaved = () => {
  showModal.value = false
  isSearching.value ? fetchSearch() : fetchList()
}

function toggleAccordion(index) {
  openedIndex.value = openedIndex.value === index ? null : index
}

function openCreateFilterModal(comp) {
  formMode.value = 'insert'
  selectedData.value = {}
  selectedComp.value = comp
  showModal.value = true
}

function openEditFilterModal(filter, comp) {
  formMode.value = 'edit'
  selectedData.value = { ...filter }
  selectedComp.value = comp
  showModal.value = true
}

fetchList()
</script>


<style scoped>
.container {
  max-width: 100vw;
  padding: 16px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: nowrap;
}

.search-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.search-select {
  width: 150px;
}

.search-input {
  width: 200px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
  word-break: break-all;
}

table th, table td {
  border: 1px solid #999;
  padding: 8px 12px;
  text-align: center;
  vertical-align: middle;
}
.comp-table tr:hover{
  cursor: pointer;
}
button {
  font-size: 13px;
  padding: 4px 8px;
  white-space: nowrap;
}

.pagination {
  margin-top: 12px;
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}
/* 라디오 버튼 */
.radio-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}
.radio-label {
  margin-right: 4px;
  font-weight: 500;
}

.radio-inline {
  display: flex;
  align-items: center;
  gap: 2px;
}
.filter-header {
  display: flex;
  justify-content: space-between; /* 우측 정렬 */
  align-items: center;
  margin-bottom: 8px;
}
</style>
