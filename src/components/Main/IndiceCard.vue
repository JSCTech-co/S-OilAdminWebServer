<template>
    <div class="indice-card">
      <!-- 상단: 업데이트 일시 -->
      <div class="indice-top">
        <span class="updated">Update date: {{ updateDate }}</span>
      </div>
  
      <!-- 제목 -->
      <div class="indice-title">{{ title }}</div>
  
      <!-- 내용: 좌측 현재값 + 증감 아이콘, 우측 이전값 -->
      <div class="indice-content">
        <div class="left">
          <span class="trend-icon" :class="trendClass">{{ trendSymbol }}</span>
          <span class="current">{{ formattedValue }}</span>
        </div>
        <div class="right">
          <span class="prev">{{ formattedPrev }}</span>
          <span class="prev-label">{{ prevLabel }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, computed } from 'vue'
  import { evaluateEx, resize, evalExprViaHypercube } from "@/util/useQlikEngine.js"

  const props = defineProps({
    title: { type: String, required: true },           // 카드 제목
    updateDate: { type: String, required: true },      // 예: 2025-08-29 02:00
    value: { type: [Number, String], required: true }, // 현재값
    prevValue: { type: [Number, String], required: true }, // 이전값
    basis: { type: String, default: 'day' },           // 'day' | 'month' | 'year'
    unit: { type: String, default: '' },               // 예: %, Ton 등 (표시용 선택)
    compact: { type: Boolean, default: true },          // K 단위 축약 표시 여부
    appId: { type: String, default: '' }
  })
  
  // 숫자 포맷터
  const toNumber = (v) => {
    const n = typeof v === 'string' ? Number(v.replace(/,/g, '')) : Number(v)
    return isNaN(n) ? 0 : n
  }
  const formatCompact = (n) => {
    const abs = Math.abs(n)
    if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.0+$/,'') + 'B'
    if (abs >= 1_000_000)     return (n / 1_000_000).toFixed(2).replace(/\.0+$/,'') + 'M'
    if (abs >= 1_000)         return (n / 1_000).toFixed(2).replace(/\.0+$/,'') + 'K'
    return n.toLocaleString()
  }
  
  const cur = computed(() => toNumber(props.value))
  const prev = computed(() => toNumber(props.prevValue))
  const diff = computed(() => cur.value - prev.value)
  
  const trendClass = computed(() => {
    if (diff.value > 0) return 'up'
    if (diff.value < 0) return 'down'
    return 'flat'
  })
  const trendSymbol = computed(() => {
    if (diff.value > 0) return '▲'
    if (diff.value < 0) return '▼'
    return '−'
  })
  
  const formattedValue = computed(() => {
    const base = props.compact ? formatCompact(cur.value) : cur.value.toLocaleString()
    return props.unit ? `${base}` : base
  })
  const formattedPrev = computed(() => {
    const base = props.compact ? formatCompact(prev.value) : prev.value.toLocaleString()
    return base
  })
  const prevLabel = computed(() => {
    if (props.basis === 'month') return 'Previous Month Value'
    if (props.basis === 'year')  return 'Previous Year Value'
    return 'Previous Day Value'
  })

  onMounted(async () => {
      const res = await evalExprViaHypercube(props.appId, "=Sum([Sales Price])/Avg([Sales Price])") 
      console.log(res.text);
  })
  </script>
  
  <style scoped>
  .indice-card{
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    padding: 8px 10px;
    min-height: 92px;
    box-sizing: border-box;
  }
  
  /* 상단 업데이트 일시 */
  .indice-top{
    display: flex;
    justify-content: flex-end;
    font-size: 9px;
    color: #666;
    margin-bottom: 4px;
  }
  .updated{ white-space: nowrap; }
  
  /* 제목 */
  .indice-title{
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 6px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
  
  /* 본문 */
  .indice-content{
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    margin: 0 75px;
  }
  
  /* 좌측: 아이콘 + 현재값 */
  .left{
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
  }
  .trend-icon{
    font-size: 22px;
    font-weight: 700;
    line-height: 1;
    display: inline-block;
    transform: translateY(2px);
  }
  .trend-icon.up   { color: #d9534f; }  /* 상승: 붉은 톤 */
  .trend-icon.down { color: #1e88e5; }  /* 하락: 파란 톤 */
  .trend-icon.flat { color: #999; }     /* 동일: 회색 */
  
  .current{
    font-size: 24px;
    font-weight: 700;
    color: #222;
    line-height: 1;
  }
  
  /* 우측: 이전값(회색) + 라벨 */
  .right{
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.1;
  }
  .prev{
    font-size: 16px;
    color: #9aa0a6;
    font-weight: 600;
  }
  .prev-label{
    font-size: 11px;
    color: #9aa0a6;
  }
  </style>
  