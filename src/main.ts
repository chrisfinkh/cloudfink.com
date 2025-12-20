import 'unfonts.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { plugin as formkitPlugin } from '@formkit/vue'
import formkitConfig from './formkit.config'
import { i18n } from './i18n'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(formkitPlugin, formkitConfig)

app.mount('#app')
