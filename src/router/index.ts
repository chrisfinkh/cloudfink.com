import Home from '../../views/HomeView.vue'
import DetailsView from '../../views/DetailsView.vue'
import CreateView from '../../views/CreateView.vue'
import LoginSignupView from '../../views/LoginSignupView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { i18n, SUPPORTED_LOCALES, type LocaleCode } from '@/i18n'

const localeRoutes = [
  {
    name: 'Home',
    path: '',
    component: Home,
  },
  {
    name: 'Detail',
    path: 'posts/:id',
    component: DetailsView,
    props: true,
  },
  {
    name: 'Create',
    path: 'create',
    component: CreateView,
  },
  {
    name: 'Login',
    path: 'login',
    component: LoginSignupView,
  },
]

const supportedLocaleCodes = SUPPORTED_LOCALES.map((l) => l.code).join('|')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: `/:locale(${supportedLocaleCodes})`,
      children: localeRoutes,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: () => {
        const savedLocale = localStorage.getItem('locale') as LocaleCode | null
        const browserLocale = navigator.language.split('-')[0] as LocaleCode
        const defaultLocale = SUPPORTED_LOCALES.some((l) => l.code === browserLocale)
          ? browserLocale
          : 'en'
        return `/${savedLocale || defaultLocale}`
      },
    },
  ],
})

router.beforeEach((to) => {
  const locale = to.params.locale as LocaleCode
  if (locale && SUPPORTED_LOCALES.some((l) => l.code === locale)) {
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
  }
})

export default router
