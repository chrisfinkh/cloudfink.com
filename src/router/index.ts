import Home from '@/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "Home",
     path:'/',
     component: Home
    }
    // {
    //   name: "Create",
    //   path: '/create',
    //   component:
    // }
  ],
})

export default router
