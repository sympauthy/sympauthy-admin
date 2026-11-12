import '@sympauthy/design/fonts.css'
import { fetchBrand } from '@sympauthy/design'
import { createApp } from 'vue'
import App from '@/app/App.vue'
import { i18n } from '@/shared/i18n/i18n'
import { makeRouter } from '@/app/router'
import { createPinia } from 'pinia'
import { brandKey, brandName } from '@/shared/lib'
import { usePreferencesStore } from '@/shared/operator-preferences'

const pinia = createPinia()
const router = makeRouter()

// Awaited so that a deployment's name is on the page from the first paint, rather than replacing
// SympAuthy's. It never rejects: an unreadable brand draws the panel as SympAuthy's.
const brand = await fetchBrand()
document.title = `${brandName(brand)} ${i18n.global.t('nav.panel')}`
// Before the first screen: a deployment whose stylesheet carries no dark values is drawn light,
// whatever the device or the operator asks for.
usePreferencesStore(pinia).setDarkModeAvailable(brand.darkMode === 'auto')

createApp(App).provide(brandKey, brand).use(router).use(i18n).use(pinia).mount('#app')
