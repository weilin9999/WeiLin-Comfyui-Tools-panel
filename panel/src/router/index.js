import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
const TagManager = () => import('@/components/tag_manager.vue')
const CollectHistory = () => import('@/components/collect_history.vue')
const History = () => import('@/components/history.vue')
const HomeSetting = () => import('@/components/home.vue')

const routes = [
  { path: '/', component: HomeSetting },
  { path: '/tag_manager', component: TagManager },
  { path: '/collect_history', component: CollectHistory },
  { path: '/history', component: History }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 