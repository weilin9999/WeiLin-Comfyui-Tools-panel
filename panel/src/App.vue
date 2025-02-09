<template>
  <div class="app-container">
    <!-- 左侧菜单栏 -->
    <nav class="sidebar">
      <!-- 原有菜单 -->
      <ul>
        <li><RouterLink to="/">数据处理</RouterLink></li>
        <li><RouterLink to="/tag_manager">Tag管理</RouterLink></li>
        <!-- <li><RouterLink to="/collect_history">补全词库管理</RouterLink></li> -->
        <!-- <li><RouterLink to="/history">历史记录管理</RouterLink></li> -->
      </ul>
    </nav>

    <!-- 右侧内容区域 -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #2c3e50;
  padding: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 15px 0;
}

.sidebar a {
  color: white;
  text-decoration: none;
  font-size: 1.1em;
}

.sidebar a:hover {
  color: #42b983;
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  box-sizing: border-box;
}
</style>
