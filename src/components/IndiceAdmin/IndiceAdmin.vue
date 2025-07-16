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
                    <th>SecondaryName</th>
                    <th>SecondaryValue</th>
                    <th>UOM</th>
                    <th>UOM(KOR)</th>
                    <th>ETLJobName</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in indiceList" :key="item.cid">
                    <td>{{ item.compId }}</td>
                    <td>{{ item.compType }}</td>
                    <td>{{ item.nameKOR }}</td>
                    <td>{{ item.nameENG }}</td>
                    <td>
                        <div class="long-text-cell">
                            <span class="long-text-content">{{ item.currentMonth }}</span>
                            <button v-if="item.currentMonth" class="btn-view-more" @click="openTextModal('CurrentMonth', item.currentMonth)">...</button>
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import IndiceAdminTextModal from './IndiceAdminTextModal.vue'

const isTextModalVisible = ref(false)
const modalTitle = ref('')
const modalContent = ref('')

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
const showModal = ref(false)
const formMode = ref('insert')

const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

const indiceList = ref([])

const fetchData = async () => {
    try{
        let url = `http://localhost:8123/indice/select?pageNo=${currentPage.value}&pageSize=${pageSize.value}`

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
  font-size: 13px;
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
</style>