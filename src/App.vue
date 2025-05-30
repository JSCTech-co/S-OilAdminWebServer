<template>
  <Header></Header>
  <div class="app-body">
    <router-view />
  </div>
</template>

<script setup>
import Header from "./layout/HeaderView.vue"
import KPOKOPAdmin from './components/KPIKOPAdmin/KPIKOPAdmin.vue'
</script>

<style>
html, body, #app {
  margin: 0 auto;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #fff;
  color: #000;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}
</style>