import { createApp } from 'vue'
import App from '@/app/App.vue'
import { i18n } from '@/app/i18n'
import { makeRouter } from '@/app/router'
import { createPinia } from 'pinia'

const pinia = createPinia()
const router = makeRouter()

createApp(App).use(router).use(i18n).use(pinia).mount('#app')
