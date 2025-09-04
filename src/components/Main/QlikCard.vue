<template>
  <!-- 확대 시 배경 오버레이 -->
  <div v-if="isZoomed" class="qlik-zoom-overlay"></div>

  <div class="qlik-card" :class="{ 'is-zoomed': isZoomed }" :role="isZoomed ? 'dialog' : null" :aria-modal="isZoomed ? 'true' : null">
    <!-- Header -->
    <div class="qlik-card-header">
      <div class="qlik-card-title">{{ title }}</div>
      <div class="qlik-card-icons" v-if="!isZoomed">
        <button class="icon" type="button" aria-label="확대" @click="onZoom">
          <img src="@/assets/icon-zoom-in.png" alt="확대" />
        </button>
        <button class="icon" type="button" aria-label="필터 초기화" @click="onClearFilter">
          <img src="@/assets/icon-filter.png" alt="필터 초기화" />
        </button>
        <button class="icon" type="button" aria-label="다운로드" @click="onDownload">
          <img src="@/assets/icon-download.png" alt="다운로드" />
        </button>
      </div>

      <!-- 전체화면 상태: 닫기(X)만 노출 -->
      <div class="qlik-card-icons" v-else>
        <button class="icon close-icon" type="button" aria-label="닫기" @click="onZoom">✕</button>
      </div>
    </div>

    <!-- Filter bar: 확대 시 숨김 -->
    <div class="qlik-card-filters" v-show="!isZoomed">
      <QlikFilter v-for="i in 4" :key="i" />
    </div>

    <!-- Content -->
    <div class="qlik-card-content" :id="domId"></div>

    <!-- Footer -->
    <div class="qlik-card-footer">
      Last Updated: {{ updateDate }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import QlikFilter from "./QlikFilter.vue";
import { mountObject, resize } from "@/util/useQlikEngine.js"

const props = defineProps({
  title: { type: String, required: true },
  icons: { type: Array, default: () => [] },
  filters: { type: Array, default: () => [] },
  appId: { type: String, required: true },
  objId: { type: String, required: true },
  domId: { type: String, required: true },
  updateDate: { type: String, default: "" }
});

const isZoomed = ref(false);
let handle = null;

function onZoom() {
  isZoomed.value = !isZoomed.value;
  document.body.style.overflow = isZoomed.value ? "hidden" : "";
  nextTick(() => {
    try { if (window.require) window.require(["qlik"], (qlik) => qlik?.resize?.()); } catch {}
    window.dispatchEvent(new Event("resize"));
  });
}
function onClearFilter() {}
function onDownload() {}

onMounted(async () => {
  // const requirejs = window.require;
  // requirejs.config({
  //   baseUrl: "https://dev.jsct.site/ticket/resources",
  //   paths: { qlik: "js/qlik" }
  // });
  // requirejs(["js/qlik"], (qlik) => {
  //   const app = qlik.openApp(props.appId, {
  //     host: "dev.jsct.site",
  //     prefix: "/ticket/",
  //     isSecure: true,
  //     port: 443
  //   });
  //   // app.getObject(props.domId, props.objId);
  // });
  handle && handle.close && handle.close();
  handle = await mountObject(props.appId, props.objId, props.domId);
  await nextTick();
  await resize();
});

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
.qlik-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  overflow: hidden;
  padding: 5px;
}

/* 오버레이 */
.qlik-zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9998;
}

/* 확대 상태: 팝업 느낌 */
.qlik-card.is-zoomed {
  position: fixed;
  top: clamp(12px, 3vh, 28px);
  right: clamp(12px, 3vw, 28px);
  bottom: clamp(12px, 3vh, 28px);
  left: clamp(12px, 3vw, 28px);
  z-index: 9999;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.30);
  margin: 0;
  background: #fff;
}

.qlik-card-content {
  flex: 1;
  padding: 10px;
  min-height: 200px;
}
.qlik-card.is-zoomed .qlik-card-content {
  min-height: 0;
  flex: 1 1 auto;
}

/* Header */
.qlik-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
}
.qlik-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.qlik-card-icons {
  display: flex;
  gap: 10px;
}
.qlik-card-icons .icon {
  cursor: pointer;
  font-size: 14px;
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
  box-shadow: none;
}
.close-icon {
  font-size: 18px;
  line-height: 1;
  opacity: 0.8;
}
.close-icon:focus{
  outline: none;
  box-shadow: none;
}
.close-icon:hover{
  opacity: 1;
}
.qlik-card-icons .icon img {
  width: 16px;
  height: 16px;
  display: block;
  opacity: 0.7;
}
.qlik-card-icons .icon img:hover {
  opacity: 1;
}

/* Filter bar */
.qlik-card-filters {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 22px;
  column-gap: 2px;
  row-gap: 6px;
  padding: 4px 8px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
}

/* Footer */
.qlik-card-footer {
  font-size: 11px;
  color: #666;
  padding: 1px 10px;
  text-align: right;
}
</style>
