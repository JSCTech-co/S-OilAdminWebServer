<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ mode === 'edit' ? 'Indice 수정' : 'Indice 등록' }}</h3>

      <form @submit.prevent="handleSubmit" class="form-grid">
        <div class="form-field">
          <label for="compId">Comp ID</label>
          <input type="text" id="compId" v-model="form.compId" :disabled="mode === 'edit'" />
        </div>
        <div class="form-field">
          <label for="compType">Comp Type</label>
          <select id="compType" v-model="form.compType">
            <option value="Indice">Indice</option>
            <option value="KPI">KPI</option>
          </select>
        </div>
        <div class="form-field">
          <label for="nameKOR">Name(KOR)</label>
          <input type="text" id="nameKor" v-model="form.nameKor" />
        </div>
        <div class="form-field">
          <label for="nameENG">Name(ENG)</label>
          <input type="text" id="nameEng" v-model="form.nameEng" />
        </div>
        <div class="form-field full-width">
          <label for="currentMonth">CurrentMonth</label>
          <textarea id="currentMonth" v-model="form.currentMonth"></textarea>
        </div>
        <div class="form-field full-width">  
          <label for="flag">Flag</label>
          <textarea id="flag" v-model="form.flag"></textarea>
        </div>
        <div class="form-field full-width">
          <label for="secondaryValue">SecondaryValue</label>
          <textarea id="secondaryValue" v-model="form.secondaryValue"></textarea>
        </div>
        <div class="form-field">
          <label for="secondaryName">SecondaryName</label>
          <input type="text" id="secondaryName" v-model="form.secondaryName" />
        </div>
        <div class="form-field">
          <label for="etljobName">ETLJobName</label>
          <input type="text" id="etljobName" v-model="form.etlJobName" />
        </div>
        <div class="form-field">
          <label for="uom">UOM</label>
          <input type="text" id="uom" v-model="form.uom" />
        </div>
        <div class="form-field">
          <label for="uomKorean">UOM(KOR)</label>
          <input type="text" id="uomKorean" v-model="form.uomKorean" />
        </div>
        <div class="form-field">
          <label for="isActive">isActive</label>
          <select v-model="form.isActive" required>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
        </div>
      </form>

      <div class="modal-actions">
        <button @click="$emit('close')">Cancel</button>
        <button @click="handleSubmit">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  mode: { type: String, default: 'insert' }, // 'insert' or 'edit'
  initialData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  cid: '',
  compId: '',
  compType: '',
  nameKor: '',
  nameEng: '',
  currentMonth: '',
  flag: '',
  secondaryName: '',
  secondaryValue: '',
  uom: '',
  uomKorean: '',
  etlJobName: '',
  isActive: ''
})

watch(() => props.initialData, (newData) => {
  if (props.mode === 'edit' && newData) {
    form.cid = newData.cid || '';
    form.compId = newData.compId || '';
    form.compType = newData.compType || '';
    form.nameKor = newData.nameKor || '';
    form.nameEng = newData.nameEng || '';
    form.currentMonth = newData.currentMonth || '';
    form.flag = newData.flag || '';
    form.secondaryName = newData.secondaryName || '';
    form.secondaryValue = newData.secondaryValue || '';
    form.uom = newData.uom || '';
    form.uomKorean = newData.uomKorean || '';
    form.etlJobName = newData.etlJobName || '';
    form.isActive = newData.isActive || '';
  } else {
    form.cid = '';
    form.compId = '';
    form.compType = 'Indice';
    form.nameKor = '';
    form.nameEng = '';
    form.currentMonth = '';
    form.flag = '';
    form.secondaryName = '';
    form.secondaryValue = '';
    form.uom = '';
    form.uomKorean = '';
    form.etlJobName = '';
    form.isActive = 'Y';
  }
}, { immediate: true, deep: true })


onMounted(() => {
  document.body.classList.add('modal-open');
});

onUnmounted(() => {
  document.body.classList.remove('modal-open');
});

const handleSubmit = async () => {
  let url = ''
  let payload = {}

  if (props.mode === 'edit') {
    url = 'http://localhost:8123/indice/update'
    payload = { ...form }
  } else {
    url = 'http://localhost:8123/indice/insert'
    payload = { ...form }
    delete payload.cid
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
  width: 750px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.modal-content > h3 {
  margin: 0;
  font-size: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-field {
  margin-bottom: 0;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-field textarea{
  resize: none;
  height: 120px;
}

.full-width {
  grid-column: span 2;
}
.modal-actions{
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
