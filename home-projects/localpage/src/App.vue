<template>
  <nav>
    <router-link to="/env">环境变量</router-link> |
    <router-link to="/task">任务</router-link> |
    <!-- <router-link to="/wskey">wskey</router-link> |
    <router-link to="/backupenv">备份环境变量</router-link> -->
  </nav>
  <StyleProvider hash-priority="high" :transformers="[legacyLogicalPropertiesTransformer]">
    <router-view />
  </StyleProvider>
</template>


<script lang="ts" setup>
import { StyleProvider } from 'ant-design-vue';
import { legacyLogicalPropertiesTransformer } from 'ant-design-vue';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
