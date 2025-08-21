<template>
    <div class="container">
        <h2 class="table-title">Role Admin</h2>
        <!-- 검색 필터 -->
        <div class="search-bar">
            <select v-model="searchField">
                <option value="roleId">Role ID</option>
                <option value="roleName">Role Name</option>
            </select>
            <input v-model="searchKeyword" placeholder="검색어 입력" @keydown.enter="applySearch"/>
            <button @click="applySearch">검색</button>
            <button @click="resetFilters">초기화</button>
            <div class="order-by">
                <div class="right-btn-div">
                    <button @click="gotoSharepoint">User Role Mapping</button>
                    <button @click="synchronization">Sharepoint 동기화</button>
                </div>
                <div class="right-order-div">
                    <label>정렬</label>
                    <select v-model="orderBy">
                        <option value="roleName">Name</option>
                        <option value="roleId">ID</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 테이블 -->
        <table class="mapping-table">
            <thead>
            <tr>
                <th>Role ID</th>
                <th>Sharepoint ID</th>
                <th>Role Name</th>
                <th>Management</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in pagedRoleList" :key="item.roleId">
                <td>{{ item.roleId    }}</td>
                <td>{{ item.sharepointId }}</td>
                <td>{{ item.roleName  }}</td>
                <td>
                  <button class="edit-button" @click="openEdit(item)">Edit</button>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
//검색바
const searchField = ref('roleName')
const orderBy = ref('roleName')
const searchKeyword = ref('')

//테이블
const showModal = ref(false)
const selectedItem = ref(null)
const pagedRoleList = ref([])

//페이지네이션
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

//
const fetchRoleData = async () => {
  try {
    let url = `http://localhost:8123/roleadmin/select?pageNo=${currentPage.value}&pageSize=${pageSize.value}&orderBy=${orderBy.value}`

    if (searchKeyword.value.trim()) {
      url += `&searchType=${searchField.value}&searchKeyword=${encodeURIComponent(searchKeyword.value)}`
    }

    const response = await fetch(url)
    const data = await response.json()
    pagedRoleList.value = data.content.map(role => ({
      roleId: role.roleId,
      roleName: role.roleName,
      sharepointId: role.sharepointId,
      compCount: role.componentCount,
    }))
    totalPages.value = data.totalPages
  } catch (err) {
    console.error('API 호출 실패', err)
  }
}
onMounted(fetchRoleData);
watch(currentPage, fetchRoleData)
watch(orderBy, fetchRoleData)

//검색
const applySearch = () => {
  currentPage.value = 1
  fetchRoleData()
}
const resetFilters = () => {
  searchKeyword.value = ''
  searchField.value = 'roleId'
  currentPage.value = 1
  fetchRoleData()
}

//페이지네이션
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

const gotoSharepoint = () => {
    window.open('https://dsvsp-d.s-oil.com/_layouts/15/user.aspx');
}

const synchronization = () => {
    alert('구현중');
}
const openEdit = (item) => {
  window.open('https://dsvsp-d.s-oil.com/_layouts/15/people.aspx?MembershipGroupId='+item.sharepointId);
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
.right-btn-div{
    display: inline-block;
}
.right-btn-div button{
    margin-left: 5px;
}
.right-order-div{
    display: inline-block;
    margin-left: 5px;
}
.edit-button {
  color: #1d4ed8;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
}
</style>