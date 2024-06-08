import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api/index'
import 'ant-design-vue/dist/reset.css';
const app = createApp(App);
// import Antd from 'ant-design-vue';
// app.use(Antd);
app.config.globalProperties.$api = api;
app.use(store).use(router).mount('#app')
