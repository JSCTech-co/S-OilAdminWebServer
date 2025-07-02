<template>
  <div class="modal">
    <div class="modal-content">
      <h3>Component Mapping <br> < {{ item.roleName }} > </h3>

      <div class="table-container">
        <!-- Available -->
        <div class="list-box">
          <h4 class="table-header-title">Available Components</h4>
          <div class="list-controls">
            <select v-model="searchField.available" class="filter-select">
              <option value="compId">CompID</option>
              <option value="compType">Type</option>
              <option value="compName">Name</option>
            </select>
            <input v-model="searchTerm.available" placeholder="Search..." />
            <button @click="toggleSelectAll('available')" class="select-btn">Select All</button>
          </div>
          <div class="table-wrapper">
            <table class="component-table">
              <thead><tr><th>CompID</th><th>Type</th><th>Name</th><th>NameKor</th></tr></thead>
              <tbody>
                <tr v-for="comp in filteredAvailable" :key="comp.compId"
                    @click="toggleSelection(comp.compId, 'available')"
                    :class="[
                      { selected: selectedAvailable.includes(comp.compId) },
                      { 'removed-row': isRemoved(comp) }
                    ]">
                  <td :title="comp.compId">{{ comp.compId }}</td>
                  <td>{{ comp.compType }}</td>
                  <td>{{ comp.compName }}</td>
                  <td>{{ comp.compNameKorean }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 이동 버튼 -->
        <div class="button-column">
          <button @click="moveToSelected"> &gt;&gt; </button>
          <button @click="moveToAvailable"> &lt;&lt; </button>
        </div>

        <!-- Selected -->
        <div class="list-box">
          <h4 class="table-header-title">Selected Components</h4>
          <div class="list-controls">
            <select v-model="searchField.selected" class="filter-select">
              <option value="compId">CompID</option>
              <option value="compType">Type</option>
              <option value="compName">Name</option>
            </select>
            <input v-model="searchTerm.selected" placeholder="Search..." />
            <button @click="toggleSelectAll('selected')" class="select-btn">Select All</button>
          </div>
          <div class="table-wrapper">
            <table class="component-table">
              <thead><tr><th>CompID</th><th>Type</th><th>Name</th><th>NameKor</th></tr></thead>
              <tbody>
                <tr v-for="comp in filteredSelected" :key="comp.compId"
                    @click="toggleSelection(comp.compId, 'selected')"
                    :class="[
                      { selected: selectedSelected.includes(comp.compId) },
                      { 'added-row': isAdded(comp) }
                    ]">
                  <td>{{ comp.compId }}</td>
                  <td>{{ comp.compType }}</td>
                  <td>{{ comp.compName }}</td>
                  <td>{{ comp.compNameKorean }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')">Cancel</button>
        <button @click="submit">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: Object,
  availableList: Array,
  selectedList: Array
})
const emit = defineEmits(['close', 'submit'])

const available = ref([...props.availableList])
const selected = ref([...props.selectedList])
const added = ref([])
const removed = ref([])

const selectedAvailable = ref([])
const selectedSelected = ref([])

const searchTerm = ref({ available: '', selected: '' })
const searchField = ref({ available: 'compId', selected: 'compId' })

const toggleSelection = (id, target) => {
  const list = target === 'available' ? selectedAvailable : selectedSelected
  const idx = list.value.indexOf(id)
  if (idx >= 0) list.value.splice(idx, 1)
  else list.value.push(id)
}

const toggleSelectAll = (target) => {
  if (target === 'available') {
    selectedAvailable.value =
      selectedAvailable.value.length ? [] : filteredAvailable.value.map(c => c.compId)
  } else {
    selectedSelected.value =
      selectedSelected.value.length ? [] : filteredSelected.value.map(c => c.compId)
  }
}

const isAdded = comp => added.value.some(c => c.compId === comp.compId)
const isRemoved = comp => removed.value.some(c => c.compId === comp.compId)

const sortById = list => [...list].sort((a, b) => a.compId.localeCompare(b.compId))
const dedup = list => [...new Map(list.map(i => [i.compId, i])).values()]

const sortedAvailable = computed(() => {
  const top = sortById(available.value.filter(isRemoved))
  const rest = sortById(available.value.filter(c => !isRemoved(c)))
  return [...top, ...rest]
})

const sortedSelected = computed(() => {
  const top = sortById(selected.value.filter(isAdded))
  const rest = sortById(selected.value.filter(c => !isAdded(c)))
  return [...top, ...rest]
})

const filterList = (list, keyword, field) => {
  const kw = keyword.toLowerCase()
  return list.filter(item =>
    !keyword || item[field]?.toLowerCase().includes(kw)
  )
}

const filteredAvailable = computed(() =>
  filterList(sortedAvailable.value, searchTerm.value.available, searchField.value.available)
)
const filteredSelected = computed(() =>
  filterList(sortedSelected.value, searchTerm.value.selected, searchField.value.selected)
)

const moveToSelected = () => {
  const fromRemoved = available.value.filter(c => selectedAvailable.value.includes(c.compId) && isRemoved(c))
  const fromAvailable = available.value.filter(c => selectedAvailable.value.includes(c.compId) && !isRemoved(c))

  // 복구
  removed.value = removed.value.filter(c => !selectedAvailable.value.includes(c.compId))
  selected.value.push(...fromRemoved)

  // 신규 추가
  added.value.push(...fromAvailable)
  selected.value.push(...fromAvailable)
  available.value = available.value.filter(c => !selectedAvailable.value.includes(c.compId))

  selected.value = dedup(selected.value)
  added.value = dedup(added.value)
  selectedAvailable.value = []
}

const moveToAvailable = () => {
  const fromAdded = selected.value.filter(c => selectedSelected.value.includes(c.compId) && isAdded(c))
  const fromSelected = selected.value.filter(c => selectedSelected.value.includes(c.compId) && !isAdded(c))

  // 실행 취소
  added.value = added.value.filter(c => !selectedSelected.value.includes(c.compId))
  available.value.push(...fromAdded)

  // 제거
  removed.value.push(...fromSelected)
  available.value.push(...fromSelected)
  selected.value = selected.value.filter(c => !selectedSelected.value.includes(c.compId))

  available.value = dedup(available.value)
  removed.value = dedup(removed.value)
  selectedSelected.value = []
}

const submit = () => {
  emit('submit', {
    roleId: props.item.roleId,
    addedList: added.value,
    removedList: removed.value
  })
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  display: flex;
  flex-direction: column;
  width: 90vw;
  height: 90vh;
  max-width: 1920px;
  max-height: 1080px;
  min-width: 800px;
  min-height: 600px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

/* 상단 h3 영역은 고정 */
.modal-content > h3 {
  margin: 0;
  font-size: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.table-container {
  flex: 1;
  display: flex;
  gap: 20px;
  margin-top: 16px;
  min-height: 0;
  overflow: hidden;
}

/* 리스트 박스들 */
.list-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  padding: 12px;
  min-height: 0;
  overflow: hidden;
}

/* 버튼 영역 */
.button-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

/* 테이블 래퍼: 스크롤 허용 */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 테이블 자체 스타일 */
.component-table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.component-table thead {
  background-color: #f0f0f0;
}

.component-table th,
.component-table td {
  padding: 6px 8px;
  border: 1px solid #ccc;
  text-align: left;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.component-table tr.selected {
  background-color: #d0ebff;
}

.added-row {
  background-color: #e6f7e6;
}

.removed-row {
  background-color: #ffecec;
}

/* 열 너비 지정 */
.component-table th:nth-child(1),
.component-table td:nth-child(1) {
  width: 20%; /* CompID */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.component-table th:nth-child(2),
.component-table td:nth-child(2) {
  width: 10%; /* Type */
}

.component-table th:nth-child(3),
.component-table td:nth-child(3) {
  width: 35%; /* Name */
}

.component-table th:nth-child(4),
.component-table td:nth-child(4) {
  width: 35%; /* NameKor */
}

/* 검색 필터 & 버튼 */
.list-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.filter-select {
  padding: 4px 6px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  width: 120px;
}

.select-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
}

/* 아래 버튼 (취소/저장) 고정 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  height: 48px;
  flex-shrink: 0;
}
.table-header-title{
  margin-top: 0px;
}
</style>
