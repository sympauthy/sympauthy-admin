import { createApp } from 'vue'
import App from '@/App.vue'
import { i18n } from '@/i18n'
import { makeRouter } from '@/router'
import { createPinia } from 'pinia'

const pinia = createPinia()
const router = makeRouter()

createApp(App)
  .use(router)
  .use(i18n)
  .use(pinia)
  .mount('#app')
