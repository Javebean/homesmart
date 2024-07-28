import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/env',
    name: 'home',
    component: HomeView
  },
  {
    path: '/task',
    name: 'task',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/TaskView.vue')
  },
  {
    path: '/wskey',
    name: 'wskey',
    component: () => import(/* webpackChunkName: "about" */ '../views/Wskey.vue')
  },
  {
    path: '/backupenv',
    name: 'backupenv',
    component: () => import(/* webpackChunkName: "about" */ '../views/BackUpEnv.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
