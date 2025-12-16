import Home from '../../views/HomeView.vue'
import DetailsView from '../../views/DetailsView.vue'
import CreateView from '../../views/CreateView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: Home,
    },
    {
      name: 'Detail',
      path: '/posts/:id',
      component: DetailsView,
      props: true,
    },
    {
      name: 'Create',
      path: '/create',
      component: CreateView,
    },
  ],
})

export default router
