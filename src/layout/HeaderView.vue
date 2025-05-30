<template>
    <header class="j-header">
      <nav class="navbar">
        <!-- 왼쪽 영역: 로고 및 홈 링크 -->
        <div class="navbar-left">
          <router-link to="/" class="logo">DSV-ADMIN</router-link>
        </div>
  
        <!-- 가운데 영역: 라우터 링크 -->
        <div class="navbar-center">
          <router-link to="/KpiKopAdmin" class="nav-item" @mouseover="showSubMenu = false">KPI/KOP Admin</router-link>
          <router-link to="/ReportAdmin" class="nav-item" @mouseover="showSubMenu = false">Report Admin</router-link>
          <router-link to="/" class="nav-item" @mouseover="showSubMenu = false">KPI/KOP Filter</router-link>
          <router-link to="/" class="nav-item" @mouseover="showSubMenu = false">Role-Comp Mapping</router-link>
          <router-link to="/" class="nav-item" @mouseover="showSubMenu = false">User-Role Mapping</router-link>
          <router-link to="/" class="nav-item" @mouseover="showSubMenu = false">App Master</router-link>
          <router-link to="/" class="nav-item" @mouseover="showSubMenu = false">Overview Admin</router-link>
          <router-link to="/" class="nav-item" @mouseover="showSubMenu = false">Indice Admin</router-link>         
        </div>
  
        <!-- 오른쪽 영역: 로그인 ID 및 로그아웃 버튼 -->
        <div class="navbar-right">
          <span>{{ loginUserId }}</span>
          <button @click="logout">Logout</button>
        </div>
      </nav>
    </header>
  </template>
<script>

</script>
<style scoped>
.j-header {
  width: 100%;
  height: 60px;
  background-color: #333;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.navbar-left {
  flex: 1;
  text-align: left;
  padding-left: 20px;
}

.navbar-center {
  flex: 8;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.navbar-right {
  flex: 1;
  text-align: right;
  padding-right: 20px;
}

.logo {
  color: white;
  font-size: 24px;
  text-decoration: none;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 15px;
  position: relative;
}

.nav-item:hover {
  color: #ffcc00; /* 마우스 오버 시 색상 변경 */
  cursor: pointer;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  list-style: none;
  padding: 10px;
  margin: 0;
  border: 1px solid #ccc;
  width: 150px;
  z-index: 10;
}

.submenu li {
  padding: 5px 0;
}

.submenu li a {
  color: black;
  text-decoration: none;
}

.submenu li a:hover {
  color: #ffcc00; /* 소메뉴 마우스 오버 시 */
}

.navbar-right span {
  color: white;
  margin-right: 10px;
}

.navbar-right button {
  background-color: #ffcc00;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.navbar-right button:hover {
  background-color: #ff9900;
}
</style>
