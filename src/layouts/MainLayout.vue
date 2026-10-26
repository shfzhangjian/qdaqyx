<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="system-title">智慧运营一体化管理平台</h1>
        <span class="module-title">安全生产管理</span>
      </div>
      <div class="header-right">
        <el-button class="feedback-btn" size="small">
          <el-icon><Bell /></el-icon>
          吐槽有惊喜！
        </el-button>
        <div class="user-info">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="username">孙书星</span>
        </div>
      </div>
    </header>

    <div class="main-container">
      <!-- 左侧导航栏 -->
      <aside class="app-sidebar">
        <el-menu
          :default-active="activeMenu"
          background-color="#2d7a6e"
          text-color="#ffffff"
          active-text-color="#3faa9a"
          class="sidebar-menu"
        >
          <el-menu-item index="/risk-dashboard" @click="goToDashboard">
            <el-icon><Monitor /></el-icon>
            <span>隐患风险监测驾驶舱</span>
          </el-menu-item>
          <el-menu-item index="/labor-protection/ppe" @click="goTo('/labor-protection/ppe')">
            <el-icon><Shield /></el-icon>
            <span>个人劳动防护用品管理</span>
          </el-menu-item>
          <el-sub-menu index="passenger-injury">
            <template #title>
              <el-icon><FirstAidKit /></el-icon>
              <span>客伤管理</span>
            </template>
            <el-menu-item index="/passenger-injury/register" @click="goTo('/passenger-injury/register')">
              <el-icon><EditPen /></el-icon>
              <span>客伤信息登记管理</span>
            </el-menu-item>
            <el-menu-item index="/passenger-injury/ledger" @click="goTo('/passenger-injury/ledger')">
              <el-icon><Notebook /></el-icon>
              <span>客伤信息台账</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 右侧内容区 -->
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)

function goToDashboard() {
  router.push('/risk-dashboard')
}

function goTo(path) {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: $header-height;
  background: $header-bg;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 $spacing-lg;
  box-shadow: $shadow-md;
  z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;

    .system-title {
      color: #fff;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .module-title {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: $border-radius-sm;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-lg;

    .feedback-btn {
      background: #f5d66c;
      border: none;
      color: #8b6d00;
      
      &:hover {
        background: #f8e08a;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      color: #fff;
      cursor: pointer;

      .username {
        font-size: 14px;
      }
    }
  }
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  width: $sidebar-width;
  background: $sidebar-bg;
  overflow-y: auto;

  .sidebar-menu {
    border-right: none;
    
    .el-menu-item, .el-sub-menu__title {
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    .el-menu-item.is-active {
      background-color: $primary-light;
    }
  }
}

.app-content {
  flex: 1;
  background: $content-bg;
  overflow-y: auto;
  padding: $spacing-lg;
}
</style>
