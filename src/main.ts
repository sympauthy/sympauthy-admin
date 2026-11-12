import '@sympauthy/design/fonts.css'
import { fetchBrand } from '@sympauthy/design'
import { createApp } from 'vue'
import App from '@/app/App.vue'
import { i18n } from '@/shared/i18n/i18n'
import { makeRouter } from '@/app/router'
import { createPinia } from 'pinia'
import { brandKey, brandName } from '@/shared/lib'
import { useAuthStore } from '@/shared/auth'
import { usePreferencesStore } from '@/entities/preference'

const pinia = createPinia()
const router = makeRouter()

// Awaited so that a deployment's name is on the page from the first paint, rather than replacing
// SympAuthy's. It never rejects: an unreadable brand draws the panel as SympAuthy's. The operator
// the browser holds a session for is read beside it, so their theme is drawn from the first paint
// too, rather than the device's until the guard has signed them in.
const [brand, storedOperator] = await Promise.all([
  fetchBrand(),
  useAuthStore(pinia).storedUserId()
])
// Before the first screen: a deployment whose stylesheet carries no dark values is drawn light,
// whatever the device or the operator asks for.
const preferencesStore = usePreferencesStore(pinia)
preferencesStore.setDarkModeAvailable(brand.darkMode === 'auto')
if (storedOperator !== null) {
  preferencesStore.applyBrowserCopy(storedOperator)
}
document.title = `${brandName(brand)} ${i18n.global.t('nav.panel')}`

createApp(App).provide(brandKey, brand).use(router).use(i18n).use(pinia).mount('#app')
