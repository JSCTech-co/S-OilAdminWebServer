<template>
  <div class="modal">
    <div class="modal-content">
      <h3>Component Mapping - {{ item.roleId }}</h3>

      <div class="table-container">
        <!-- Available -->
        <div class="list-box">
          <h4>Available Components</h4>
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
              <thead><tr><th>CompID</th><th>Type</th><th>Name</th></tr></thead>
              <tbody>
                <tr v-for="comp in filteredAvailable" :key="comp.compId"
                    @click="toggleSelection(comp.compId, 'available')"
                    :class="[
                      { selected: selectedAvailable.includes(comp.compId) },
                      { 'removed-row': isRemoved(comp) }
                    ]">
                  <td>{{ comp.compId }}</td>
                  <td>{{ comp.compType }}</td>
                  <td>{{ comp.compName }}</td>
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
          <h4>Selected Components</h4>
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
              <thead><tr><th>CompID</th><th>Type</th><th>Name</th></tr></thead>
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
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-color: rgba(0,0,0,0.4);
  display: flex; justify-content: center; align-items: center;
}
.modal-content {
  background: white;
  padding: 12px;
  border-radius: 8px;
  width: 1400px;
  height: 800px;
}
.table-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.list-box {
  flex: 1;
  border: 1px solid #ddd;
  padding: 12px;
  display: flex;
  flex-direction: column;
  height: 600px;
}
.table-wrapper {
  flex: 1;
  overflow-y: auto;
}
.component-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.component-table th,
.component-table td {
  padding: 6px 8px;
  border: 1px solid #ccc;
  text-align: left;
}
.component-table thead {
  background-color: #f0f0f0;
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
.button-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
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
</style>
