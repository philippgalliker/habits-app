import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/neu',
      name: 'new-entry',
      component: () => import('../views/NewEntryView.vue'),
    },
    {
      path: '/kategorien',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue'),
    },
  ],
})

export default router
