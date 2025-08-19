<template>
  <div class="modal">
    <div class="modal-content">
      <h3>Overview 수정 (Role: {{ currentRole.roleName }})</h3>

      <div class="table-container">
        <table class="overview-edit-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>Comp ID</th>
              <th>Name (KOR)</th>
              <th>Name (ENG)</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 4" :key="`indice-${i}`">
              <td>Indice {{ i }}</td>
              <td>{{ getIndiceItem(currentRole.indices, i)?.compId || '-' }}</td>
              <td>{{ getIndiceItem(currentRole.indices, i)?.compNameKorean || '-' }}</td>
              <td>{{ getIndiceItem(currentRole.indices, i)?.compName || '-' }}</td>
              <td><button @click="openSelectionModal('indice', i)">수정</button></td>
            </tr>
            <tr v-for="i in 6" :key="`widget-${i}`">
              <td>Widget {{ i }}</td>
              <td>{{ getWidgetItem(currentRole.widgets, i)?.compId || '-' }}</td>
              <td>{{ getWidgetItem(currentRole.widgets, i)?.compNameKorean || '-' }}</td>
              <td>{{ getWidgetItem(currentRole.widgets, i)?.compName || '-' }}</td>
              <td><button @click="openSelectionModal('widget', i)">수정</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')">닫기</button>
      </div>
    </div>
    
    <SelectionModal
      v-if="isSelectionModalOpen"
      :title="selectionType === 'indice' ? 'Indice' : 'Widget'"
      :items="selectionType === 'indice' ? indiceList : widgetList"
      @close="isSelectionModalOpen = false"
      @select="handleSelection"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import SelectionModal from './SelectionModal.vue';

const props = defineProps({
  initialData: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'saved']);

const currentRole = ref({});
const isSelectionModalOpen = ref(false);
const selectionType = ref(''); // 'indice' or 'widget'
const editingOrder = ref(0); // 1 to 4 for indice, 1 to 6 for widget

const indiceList = ref([]);
const widgetList = ref([]);

const getIndiceItem = (indices, order) => {
  if (!indices) return null;
  return indices.find(i => i.widgetOrder === order);
};

const getWidgetItem = (widgets, order) => {
  if (!widgets) return null;
  return widgets.find(w => w.widgetOrder === order);
};

const fetchOptions = async () => {
  try {
    const indiceRes = await fetch(`http://localhost:8123/overview/selectIndiceList?roleId=${currentRole.value.roleId}`);
    const indiceData = await indiceRes.json();
    indiceList.value = indiceData;

    const widgetRes = await fetch(`http://localhost:8123/overview/selectWidgetList?roleId=${currentRole.value.roleId}`);
    const widgetData = await widgetRes.json();
    widgetList.value = widgetData;
  } catch (err) {
    console.error('Failed to fetch options:', err);
    alert('데이터 목록을 불러오는 데 실패했습니다.');
  }
};

// Deep copy initialData to currentRole to allow local modifications
watch(() => props.initialData, async (newData) => {
  if (newData) {
    currentRole.value = JSON.parse(JSON.stringify(newData));
    await fetchOptions(); // Call fetchOptions after currentRole is set
  }
}, { immediate: true, deep: true });

const openSelectionModal = (type, order) => {
  selectionType.value = type;
  editingOrder.value = order;
  isSelectionModalOpen.value = true;
};

const handleSelection = async (selectedItem) => {
  const roleId = currentRole.value.roleId;
  const cid = selectedItem.cid;
  const widgetOrder = editingOrder.value;
  const type = selectionType.value;

  let url = '';
  let payload = {};

  if (type === 'indice') {
    url = 'http://localhost:8123/overview/updateIndice'; // Assuming a new endpoint for updating a single indice
    payload = {
      roleId,
      cid,
      widgetOrder
    };
  } else if (type === 'widget') {
    url = 'http://localhost:8123/overview/updateWidget'; // Assuming a new endpoint for updating a single widget
    payload = {
      roleId,
      cid,
      widgetOrder
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // Update the local state (currentRole) to reflect the change immediately
      if (type === 'indice') {
        const existingIndiceIndex = currentRole.value.indices.findIndex(i => i.widgetOrder === widgetOrder);
        if (existingIndiceIndex !== -1) {
          currentRole.value.indices[existingIndiceIndex] = { ...selectedItem, widgetOrder };
        } else {
          currentRole.value.indices.push({ ...selectedItem, widgetOrder });
        }
      } else {
        // If the selected item is a widget, it might have nameKOR/nameENG instead of compNameKorean/compNameEnglish
        // Ensure consistency by mapping them if necessary
        const mappedSelectedItem = {
          ...selectedItem,
          compNameKorean: selectedItem.nameKOR || selectedItem.compNameKorean,
          compName: selectedItem.nameENG || selectedItem.compName
        };
        const existingWidgetIndex = currentRole.value.widgets.findIndex(w => w.widgetOrder === widgetOrder);
        if (existingWidgetIndex !== -1) {
          currentRole.value.widgets[existingWidgetIndex] = { ...mappedSelectedItem, widgetOrder };
        } else {
          currentRole.value.widgets.push({ ...selectedItem, widgetOrder });
        }
      }
      // Emit saved event to Overview.vue to trigger a data refresh
      emit('saved');
    } else {
      const errorText = await res.text();
      console.error('Update failed:', errorText);
      alert('업데이트 실패: ' + errorText);
    }
  } catch (err) {
    console.error('API 호출 실패', err);
    alert('업데이트 중 오류가 발생했습니다.');
  }
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
  z-index: 1000;
  font-size: 12px;
}

.modal-content {
  width: 1200px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.modal-content > h3 {
  margin-top: 0;
}

.overview-edit-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.overview-edit-table th,
.overview-edit-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.overview-edit-table th {
  background-color: #f2f2f2;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
