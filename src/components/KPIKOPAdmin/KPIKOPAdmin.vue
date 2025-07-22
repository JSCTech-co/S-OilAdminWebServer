<template>
  <div class="container">
    <h2>KPI/KOP Admin</h2>
    <div class="search-bar">
      <div class="search-left">
        <select v-model="searchColumn" class="search-select">
          <option value="compid">Comp ID</option>
          <option value="namekor">Name (KOR)</option>
          <option value="nameeng">Name (ENG)</option>
        </select>
        <input v-model="searchKeyword" class="search-input" placeholder="검색어 입력" />
        <button @click="search">검색</button>
        <button @click="resetSearch">초기화</button>
        <!-- isActive 필터 -->
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

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>CID</th>
            <th>Comp ID</th>
            <th>Comp Type</th>
            <th>Name (ENG)</th>
            <th>Name (KOR)</th>
            <th>WidgetObjectId</th>
            <th>OverviewWidgetID</th>
            <th>UOM</th>
            <th>UOM (KOR)</th>
            <th>ETL Job Name</th>
            <th>isActive?</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in kpis" :key="item.cid">
            <td>{{ item.cid }}</td>
            <td>{{ item.compId }}</td>
            <td>{{ item.compType }}</td>
            <td>{{ item.nameENG }}</td>
            <td>{{ item.nameKOR }}</td>
            <td>{{ item.widgetObjectId}}</td>
            <td>{{ item.overviewWidgetId}}</td>
            <td>{{ item.uom}}</td>
            <td>{{ item.uomKorean}}</td>
            <td>{{ item.etljobName }}</td>
            <td>{{ item.isActive }}</td>
            <td><button @click="openEditModal(item)">수정</button></td>
          </tr>
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
      <button :disabled="page >= totalPages" @click="nextPage">다음</button>
      <span>페이지 {{ page  }} / {{ totalPages }}</span>
    </div>

    <KPIKOPAdminModal
      v-if="showModal"
      :mode="formMode"
      :initialData="selectedData"
      @close="showModal = false"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import KPIKOPAdminModal from './KPIKOPAdminModal.vue'

const kpis = ref([])
const page = ref(1)
const size = ref(10)
const totalPages = ref(0)

const searchColumn = ref('compid')
const searchKeyword = ref('')
const isSearching = ref(false)

const showModal = ref(false)
const formMode = ref('insert')
const selectedData = ref({})
const searchActive = ref('Y')

const fetchList = async () => {
  try {
    //const url = `http://localhost:8123/KpiKopAdmin/getAllList?page=${page.value}&size=${size.value}&isActive=${searchActive.value}`
    const url = `http://localhost:8123/KpiKopAdmin/select?pageNo=${page.value}&pageSize=${size.value}&isActive=${searchActive.value}`
    const res = await fetch(url)
    const data = await res.json()
    kpis.value = data.content
    totalPages.value = data.totalPages
  } catch (err) {
    console.error('기본 목록 호출 실패', err)
  }
}

const fetchSearch = async () => {
  try {
    const col = searchColumn.value
    const kwd = encodeURIComponent(searchKeyword.value)
    //const url = `http://localhost:8123/KpiKopAdmin/searchList?column=${col}&keyword=${kwd}&page=${page.value}&size=${size.value}&isActive=${searchActive.value}`
    let url = `http://localhost:8123/KpiKopAdmin/select?pageNo=${page.value}&pageSize=${size.value}&isActive=${searchActive.value}`
    if(col && kwd){
      url += `&searchType=${searchColumn.value}&searchKeyword=${searchKeyword.value}`;
    }
    const res = await fetch(url)
    const data = await res.json()
    kpis.value = data.content
    totalPages.value = data.totalPages
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
  searchActive.value = 'Y' 
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
})

const openInsertModal = () => {
  formMode.value = 'insert'
  selectedData.value = {}
  showModal.value = true
}
const openEditModal = (row) => {
  formMode.value = 'edit'
  selectedData.value = { ...row }
  showModal.value = true
}
const handleSaved = () => {
  showModal.value = false
  isSearching.value ? fetchSearch() : fetchList()
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
  font-size: 11px;
  table-layout: fixed;
  word-break: break-all;
}

table th, table td {
  border: 1px solid #999;
  padding: 4px 8px;
  text-align: center;
  vertical-align: middle;
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
</style>
