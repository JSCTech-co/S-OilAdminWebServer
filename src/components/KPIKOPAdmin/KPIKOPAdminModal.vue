<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ mode === 'edit' ? 'KPI/KOP 수정' : 'KPI/KOP 등록' }}</h3>

      <form @submit.prevent="handleSubmit" class="form-grid">
       <!-- 상단 그리드 (edit: 3열, insert: 2열) -->
        <div v-if="mode === 'edit'" class="form-grid-3col" style="grid-column: span 2;">
          <div class="form-field">
            <label>CID</label>
            <input v-model="form.cid" disabled />
          </div>
          <div class="form-field">
            <label>Comp ID *</label>
            <input v-model="form.compId" disabled required />
          </div>
          <div class="form-field">
            <label>Comp Type *</label>
            <select v-model="form.compType" disabled required>
              <option value="KPI">KPI</option>
              <option value="KOP">KOP</option>
            </select>
          </div>
        </div>

        <div v-else class="form-grid-2col" style="grid-column: span 2;">
          <div class="form-field">
            <label>Comp ID *</label>
            <input v-model="form.compId" required />
          </div>
          <div class="form-field">
            <label>Comp Type *</label>
            <select v-model="form.compType" required>
              <option value="KPI">KPI</option>
              <option value="KOP">KOP</option>
            </select>
          </div>
        </div>

        <!-- 이후는 2열 그리드 그대로 -->
        <div class="form-field">
          <label>Name (KOR)</label>
          <input v-model="form.nameKOR" />
        </div>
        <div class="form-field">
          <label>Name (ENG)</label>
          <input v-model="form.nameENG" />
        </div>

        <div class="form-field">
          <label>UOM</label>
          <input v-model="form.uom" />
        </div>
        <div class="form-field">
          <label>UOM (Korean)</label>
          <input v-model="form.uomKorean" />
        </div>

        <div class="form-field">
          <label>Widget Object ID</label>
          <input v-model="form.widgetObjectId" />
        </div>
        <div class="form-field">
          <label>Overview Widget ID</label>
          <input v-model="form.overviewWidgetId" />
        </div>

        <div class="form-field">
          <label>ETL Job Name</label>
          <input v-model="form.etljobName" />
        </div>

        <div class="form-field">
          <label>isActive</label>
          <select v-model="form.isActive" required>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
        </div>
        <div class="btn-area" style="grid-column: span 2">
          <button type="submit">저장</button>
          <button type="button" @click="$emit('close')">취소</button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  mode: { type: String, default: 'insert' }, // 'insert' or 'edit'
  initialData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  cid: '',
  compId: '',
  compType: 'KPI',
  uom: '',
  uomKorean: '',
  etlJobName: '',
  nameKor: '',
  nameEng: '',
  widgetObjectId: '',
  overviewWidgetId: '',
  isActive: '',
})

watch(() => props.initialData, (data) => {
  if (props.mode === 'edit') {
    Object.assign(form, data)
  } else {
    Object.keys(form).forEach(k => form[k] = '')
    form.compType = 'KPI'
    form.type = 'KPI'
  }
}, { immediate: true })


const handleSubmit = async () => {
  let url = ''
  let payload = {}

  if (props.mode === 'edit') {
    url = 'http://localhost:8123/KpiKopAdmin/update'
    payload = {
      cid: form.cid,
      compId: form.compId,         // 수정 금지되어 있지만 전달 필요
      compType: form.compType,     // 수정 금지되어 있지만 전달 필요
      nameEng: form.nameENG,
      nameKor: form.nameKOR,
      widgetObjectId: form.widgetObjectId,
      overviewWidgetId: form.overviewWidgetId,
      uom: form.uom,
      uomKorean: form.uomKorean,
      etlJobName: form.etlJobName,
      UpdatedBy: 'simoms_dsv',
      isActive: form.isActive
    }
  } else {
    url = 'http://localhost:8123/KpiKopAdmin/insert'
    payload = {
      compId: form.compId,
      compType: form.compType,
      nameEng: form.nameENG,
      nameKor: form.nameKOR,
      widgetObjectId: form.widgetObjectId,
      overviewWidgetId: form.overviewWidgetId,
      uom: form.uom,
      uomKorean: form.uomKorean,
      etlJobName: form.etlJobName,
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (res.ok) {
    emit('saved')
    emit('close')
  } else {
    alert('저장 실패')
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
  justify-content: space-between;
  margin-top: 20px;
}
input:disabled,
select:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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
.form-grid-3col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
