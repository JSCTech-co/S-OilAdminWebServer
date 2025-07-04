<template>
  <div class="modal">
    <div class="modal-content">
      <h3>{{ mode === 'edit' ? 'App 수정' : 'App 등록' }}</h3>

      <div class="form-container">
        <div class="form-group">
          <label for="appName">App Name</label>
          <input type="text" id="appName" v-model="form.appName" />
        </div>
        <div class="form-group">
          <label for="appType">App Type</label>
          <input type="text" id="appType" v-model="form.appType" />
        </div>
        <div class="form-group">
          <label for="appId">App Id</label>
          <input type="text" id="appID" v-model="form.appId" :disabled="mode === 'edit'"/>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')">Cancel</button>
        <button @click="handleSubmit">Save</button>
      </div>
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
  aid: '',
  appName: '',
  appType: '',
  appId: '',
})

watch(() => props.initialData, (newData) => {
  if (props.mode === 'edit' && newData) {
    form.aid = newData.aid || '';
    form.appName = newData.appName || '';
    form.appType = newData.appType || '';
    form.appId = newData.appId || '';
  } else {
    form.aid = '';
    form.appName = '';
    form.appType = '';
    form.appId = '';
  }
}, { immediate: true, deep: true })


const handleSubmit = async () => {
  let url = ''
  let payload = {}

  if (props.mode === 'edit') {
    url = 'http://localhost:8123/appmapping/update'
    payload = {
      aid: form.aid,
      appName: form.appName,
      appType: form.appType,
      appId: form.appId
    }
  } else {
    url = 'http://localhost:8123/appmapping/insert'
    payload = {
      appName: form.appName,
      appType: form.appType,
      appId: form.appId
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
  width: 400px;
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

.form-container {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}
</style>
