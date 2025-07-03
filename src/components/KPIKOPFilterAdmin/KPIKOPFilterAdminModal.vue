<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ mode === 'edit' ? 'Edit Filter' : 'Create New Filter' }}</h3>

      <div class="comp-info-grid">
        <div class="form-field">
          <label>Comp ID</label>
          <input :value="compData.compId" disabled />
        </div>
        <div class="form-field">
          <label>Comp Type</label>
          <input :value="compData.compType" disabled />
        </div>
        <div class="form-field">
          <label>Comp Name</label>
          <input :value="compData.compName" disabled />
        </div>
        <div class="form-field">
          <label>Comp Name (KOR)</label>
          <input :value="compData.compNameKorean" disabled />
        </div>
      </div>

      <hr class="divider" />

      <form @submit.prevent="handleSubmit" class="form-grid">
        <!-- Filter Fields -->
        <div class="form-field">
          <label>Filter Name *</label>
          <input v-model="form.filterName" required />
        </div>
        <div class="form-field">
          <label>Filter Label</label>
          <input v-model="form.filterLabel" />
        </div>
        <div class="form-field">
          <label>Filter Type *</label>
          <select v-model="form.filterType" required>
            <option value="daterange">Date Range</option>
            <option value="DropDown">Dropdown</option>
            <option value="hierarchy">Hierarchy</option>
            <option value="multiSelectDropdown">Multi-Select Dropdown</option>
          </select>
        </div>
        <div class="form-field">
          <label>Field Name </label>
          <input v-model="form.fieldName" required />
        </div>
        <div class="form-field">
          <label>Filter Sequence *</label>
          <input v-model.number="form.filterSequence" type="number" required />
        </div>
        <div class="form-field">
          <label>Widget Object ID</label>
          <input v-model="form.widgetObjectId" />
        </div>
        <div class="form-field">
          <label>Filter Object ID</label>
          <input v-model="form.filterObjId" />
        </div>
        <div class="form-field">
          <label>Filter Qlik ID</label>
          <input v-model="form.filterQlikId" />
        </div>
        <div class="form-field">
          <label>Page Name</label>
          <input v-model="form.pageName" />
        </div>

        <div class="btn-area" style="grid-column: span 2">
          <button type="submit">Save</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  mode: { type: String, default: 'insert' },
  initialData: { type: Object, default: () => ({}) },
  compData: { type: Object, required: true }
})

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  filterId: null,
  filterName: '',
  filterLabel: '',
  filterType: 'daterange',
  filterSequence: 10,
  filterObjId: '',
  filterQlikId: '',
  pageName: '',
  fieldName: '',
  widgetObjectId: ''
})

watch(() => props.initialData, (data) => {
  if (props.mode === 'edit' && data) {
    Object.assign(form, data);
    if (data.filterType) {
      const lowerCaseFilterType = data.filterType.toLowerCase();
      if (['daterange', 'dropdown', 'hierarchy', 'multiselectdropdown'].includes(lowerCaseFilterType)) {
        // Find the correct value from the options to preserve casing in the form
        const options = ['daterange', 'DropDown', 'hierarchy', 'multiSelectDropdown'];
        form.filterType = options.find(opt => opt.toLowerCase() === lowerCaseFilterType) || 'daterange';
      } else {
        form.filterType = 'daterange'; // Default value if no match
      }
    }
  } else {
    // Reset form for insert mode
    Object.keys(form).forEach(k => {
      form[k] = null; // Reset all fields
    });
    form.filterType = 'daterange';
    form.filterSequence = 1;
  }
}, { immediate: true, deep: true })

const handleSubmit = async () => {
  const isEdit = props.mode === 'edit'
  const url = `http://localhost:8123/kpikopfilter/${isEdit ? 'update' : 'insert'}`
  
  const payload = {
    ...form,
    compId: props.compData.compId,
    compType: props.compData.compType
  }
  if (!isEdit) {
    delete payload.filterId
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      emit('saved')
      emit('close')
    } else {
      const errorText = await res.text()
      alert(`Failed to save: ${errorText}`)
    }
  } catch (error) {
    console.error('Error saving filter:', error)
    alert('An error occurred while saving the filter.')
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: #fff;
  color: #000;
  padding: 24px;
  width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-field label {
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
}
.form-field input,
.form-field select {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.comp-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  background-color: #f7f7f7;
  padding: 12px;
  border-radius: 4px;
}

.divider {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

input:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
}
</style>