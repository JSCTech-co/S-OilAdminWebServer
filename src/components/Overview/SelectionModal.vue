<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ title }} 선택</h3>

      <div class="search-container">
        <select v-model="searchField">
          <option value="all">전체</option>
          <option value="compId">CompId</option>
          <option value="compType">CompType</option>
          <option value="nameKor">Name (Kor)</option>
          <option value="nameEng">Name (Eng)</option>
        </select>
        <input type="text" v-model="searchKeyword" placeholder="검색..." />
      </div>

      <div class="item-list">
        <table class="item-table">
          <thead>
            <tr>
              <th>CompId</th>
              <th>CompType</th>
              <th>Name (Kor)</th>
              <th>Name (Eng)</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in filteredItems"
              :key="item.compId"
              @click="selectItem(item)"
              class="item-row"
            >
              <td>{{ item.compId }}</td>
              <td>{{ item.compType }}</td>
              <td>{{ item.nameKor || item.nameKOR }}</td>
              <td>{{ item.nameEng }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredItems.length === 0" class="no-results">
          검색 결과가 없습니다.
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, default: () => [] }
});

onMounted(() => {
  console.log('SelectionModal received items:', props.items);
});

const emit = defineEmits(['close', 'select']);

const searchKeyword = ref('');
const searchField = ref('all');

const filteredItems = computed(() => {
  if (!searchKeyword.value) {
    return props.items;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return props.items.filter(item => {
    const field = searchField.value;
    if (field === 'all') {
      return (
        (item.nameKor && item.nameKor.toLowerCase().includes(keyword)) ||
        (item.nameKOR && item.nameKOR.toLowerCase().includes(keyword)) ||
        (item.compId && item.compId.toLowerCase().includes(keyword)) ||
        (item.compType && item.compType.toLowerCase().includes(keyword)) ||
        (item.nameEng && item.nameEng.toLowerCase().includes(keyword))
      );
    } else if (field === 'nameKor') {
      return (item.nameKor && item.nameKor.toLowerCase().includes(keyword)) ||
             (item.nameKOR && item.nameKOR.toLowerCase().includes(keyword));
    } else if (item[field]) {
      return String(item[field]).toLowerCase().includes(keyword);
    }
    return false;
  });
});

const selectItem = (item) => {
  emit('select', item);
  emit('close');
};
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
  z-index: 1001; /* Higher than OverviewModal */
}

.modal-content {
  width: 700px;
  height: 70vh;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-content > h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.search-container {
  display: flex;
  margin-bottom: 15px;
}

.search-container select {
  margin-right: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-container input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.item-list {
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
}

.item-table th, .item-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.item-table th {
  background-color: #f9f9f9;
  font-weight: bold;
}

.item-row {
  cursor: pointer;
}

.item-row:hover {
  background-color: #f5f5f5;
}

.no-results {
  padding: 10px;
  text-align: center;
  color: #888;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
