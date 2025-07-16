<template>
    <div class="container">
    <h2 class="table-title">Overview Dashboard Management</h2>

    <!-- 검색 필터 -->
    <div class="search-bar">
      <select>
        <option value="roleName">Role Name</option>
        <option value="roleId">Role ID</option>
      </select>
      <input v-model="searchKeyword" placeholder="검색어 입력" @keydown.enter="applySearch"/>
      <button @click="applySearch">검색</button>
      <button @click="resetFilters">초기화</button>
      <div class="order-by">
        <label style="margin-right:5px;">정렬</label>
        <select>
          <option value="roleName">Name</option>
          <option value="roleId">ID</option>
        </select>
      </div>
    </div>

    <!-- 테이블 -->
    <table class="mapping-table">
      <thead>
        <tr>
          <th>Role ID</th>
          <th>Role Name</th>
          <th>Indice 1</th>
          <th>Indice 2</th>
          <th>Indice 3</th>
          <th>Indice 4</th>
          <th>Widget 1</th>
          <th>Widget 2</th>
          <th>Widget 3</th>
          <th>Widget 4</th>
          <th>Widget 5</th>
          <th>Widget 6</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>66</td>
          <td>1 RFCC Process Engineering Team</td>
          <td>[ECOS] CO2 emission Daily Avg.</td>
          <td>[ECOS] Daily Avg. EII</td>
          <td>[OA] All Unit (Forecast)</td>
          <td>[PU] Process Utilization</td>
          <td>[Budget] CAPEX Excecution Status</td>
          <td>[Budget] OPEX Excecution Status</td>
          <td>[ECOS] Flaring</td>
          <td>[CM] Weekly Contribution Margin Movement</td>
          <td>[Operation] Product Yield</td>
          <td>[IOTEM] Shift Handover Status</td>
          <td>
            <button class="edit-button" @click="openEditModal(item)">Edit</button>
          </td>
        </tr>
        <tr>
          <td>150</td>
          <td>1 RFCC Process Engineering Team Leader</td>
          <td>[ECOS] CO2 emission Daily Avg.</td>
          <td>[ECOS] Daily Avg. EII</td>
          <td>[OA] All Unit (Forecast)</td>
          <td>[PU] Process Utilization</td>
          <td>[Budget] CAPEX Excecution Status</td>
          <td>[Budget] OPEX Excecution Status</td>
          <td>[ECOS] Flaring</td>
          <td>[CM] Weekly Contribution Margin Movement</td>
          <td>[Operation] Product Yield</td>
          <td>[CM] Weekly Price Movement</td>
          <td>
            <button class="edit-button" @click="openEditModal(item)">Edit</button>
          </td>
        </tr>
        <tr>
          <td>67</td>
          <td>2 RFCC Process Engineering Team</td>
          <td>[ECOS] CO2 emission Daily Avg.</td>
          <td>[ECOS] Daily Avg. EII</td>
          <td>[OA] All Unit (Forecast)</td>
          <td>[PU] Process Utilization</td>
          <td>[[ECOS] Monthly Avg. EII</td>
          <td>[Budget] OPEX Excecution Status</td>
          <td>[LRIS] RBI Risk Criticality (Asset Type)</td>
          <td>[CM] Weekly Contribution Margin Movement</td>
          <td>[Operation] Product Yield</td>
          <td>[IOTEM] Shift Handover Status</td>
          <td>
            <button class="edit-button" @click="openEditModal(item)">Edit</button>
          </td>
        </tr>
        <tr>
          <td>151</td>
          <td>2 RFCC Process Engineering Team Leader</td>
          <td>[ECOS] CO2 emission Daily Avg.</td>
          <td>[ECOS] Daily Avg. EII</td>
          <td>[OA] All Unit (Forecast)</td>
          <td>[PU] Process Utilization</td>
          <td>[Budget] CAPEX Excecution Status</td>
          <td>[Budget] OPEX Excecution Status</td>
          <td>[ECOS] Flaring</td>
          <td>[CM] Weekly Contribution Margin Movement</td>
          <td>[Operation] Product Yield</td>
          <td>[IOTEM] Shift Handover Status</td>
          <td>
            <button class="edit-button" @click="openEditModal(item)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="table-pagination">
      <button @click="goToPrevPage" :disabled="currentPage === 1">Prev</button>
      <button> 1 </button>
      <button> 2 </button>
      <button> 3 </button>
      <button> 4 </button>
      <button> 5 </button>
      <button> 6 </button>
      <button> 7 </button>
      <button> 8 </button>
      <button> 9 </button>
      <button> 10 </button>
      <button @click="goToNextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
onMounted(() => {
  // window.require.config({
  //   baseUrl: "https://dev.jsct.site/resources",
  //   paths: {
  //     qlik: "js/qlik"
  //   }
  // });

  // window.require(["js/qlik"], function (qlik) {
  //   const app = qlik.openApp("52e79fa9-bf89-4da3-8a6f-82fe6aa01e5a", {
  //     host: "dev.jsct.site",
  //     prefix: "/jwt2",
  //     port: 443,
  //     isSecure: true
  //   });

  // //   app.getObject("qlik-object-container", "NaKQwM");
  // });
});
</script>
<style scoped>
.container {
  padding: 24px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.search-bar select,
.search-bar input,
.search-bar button {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.mapping-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
  margin-bottom: 12px;
}
.mapping-table th,
.mapping-table td {
  border: 1px solid #ddd;
  padding: 4px 8px;
  text-align: left;
}
.edit-button {
  color: #1d4ed8;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
}
.table-pagination {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin: 16px 0;
}
.table-pagination button {
  padding: 0.3em 0.9em;
}
.table-pagination button.active-page {
  background-color: #7f7f7f;
  color: white;
  font-weight: bold;
  border-radius: 4px;
}
.order-by{
  margin-left: auto;
}
</style>