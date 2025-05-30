<template>
    <div class="modal">
      <div class="modal-content">
        <h3>{{ mode === 'edit' ? 'Report 수정' : 'Report 등록' }}</h3>
  
        <form @submit.prevent="handleSubmit" class="form-grid">
         <!-- 상단 그리드 -->
          <div class="form-grid-2col" style="grid-column: span 2;">
            <div class="form-field">
              <label>CompSeq</label>
              <input v-model="form.compSeq" disabled />
            </div>
            <div class="form-field">
              <label>Comp ID *</label>
              <input v-model="form.compId" disabled required />
            </div>
          </div>
  
          <!-- 이후는 2열 그리드 그대로 -->
          <div class="form-field">
            <label>CompName</label>
            <input v-model="form.compName" />
          </div>
          <div class="form-field">
            <label>CompName (KOR)</label>
            <input v-model="form.compNameKorean" />
          </div>
    
          <div class="form-field">
            <label>SourceSys</label>
            <input v-model="form.sourceSys" />
          </div>
          <div class="form-field">
            <label>Owner Dept</label>
            <input v-model="form.ownerDept" />
          </div>

          <div class="form-field">
            <label>HyperLink</label>
            <input v-model="form.hyperLink" />
          </div>

          <div class="form-field">
            <label>ETL Job Name</label>
            <input v-model="form.etlJobName" />
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
    compSeq: '',
    compId: '',
    etlJobName: '',
    compName: '',
    compNameKorean: '',
    sourceSys: '',
    ownerDept: '',
    hyperLink: '',
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
      url = 'http://localhost:8123/ReportAdmin/update'
      payload = {
        
      }
    } else {
      url = 'http://localhost:8123/ReportAdmin/insert'
      payload = {
        
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
  