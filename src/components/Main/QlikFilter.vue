<template>
    <div class="q-filter-wrap">
      <select
        v-model="value"
        @change="emit('update:modelValue', value)"
        aria-label="필터 선택"
      >
        <option value="">부서/조직</option>
        <option value="A">Filter A</option>
        <option value="B">Filter B</option>
        <option value="C">Filter C</option>
      </select>
  
      <!-- 초기화 버튼: 항상 보임 -->
      <button
        class="q-clear"
        type="button"
        aria-label="선택 초기화"
        @click="clear"
      >
        ×
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, defineProps, defineEmits } from "vue";
  
  const props = defineProps({
    modelValue: { type: String, default: "" }
  });
  const emit = defineEmits(["update:modelValue", "clear"]);
  
  const value = ref(props.modelValue);
  watch(() => props.modelValue, v => (value.value = v));
  
  function clear() {
    value.value = "";
    emit("update:modelValue", "");
    emit("clear");
  }
  </script>
  
  <style scoped>
  .q-filter-wrap {
    position: relative;
    display: inline-block;
  
    /* 캡슐형 스타일 */
    height: 22px;
    padding: 0 42px 0 10px; /* 오른쪽 공간 확보 (화살표+X) */
    border-radius: 999px;
    font-size: 11px;
    line-height: 22px;
    box-sizing: border-box;
    cursor: pointer;
    background: #fff;
    border: 1px solid #ddd;
  }
  
  /* select를 투명 처리 */
  .q-filter-wrap select {
    border: none;
    outline: none;
    background: transparent;
    font-size: inherit;
    height: 100%;
    width: 145%;
    padding: 0;
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  
  /* 화살표 (CSS border로 구현) */
  .q-filter-wrap::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 22px; /* X 버튼 왼쪽 */
    transform: translateY(-40%); /* 세로 중앙 보정 */
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 7px solid #000; /* 아래쪽 삼각형 */
    pointer-events: none;
  }
  
  /* 초기화 버튼: 항상 보임 */
  .q-clear {
    position: absolute;
    top: 50%;
    right: 4px;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: transparent;
    font-size: 14px;
    line-height: 16px;
    padding: 0;
    cursor: pointer;
    opacity: 0.7;
  }
  .q-clear:hover {
    opacity: 1;
  }
  .q-clear:focus {
  outline: none;
  box-shadow: none;
}
  </style>
  