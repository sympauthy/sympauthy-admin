import { readonly, ref } from 'vue'

// `breakpoint-sm`: Tailwind compiles the theme's breakpoints away, so a script cannot read it.
const phoneWidth = window.matchMedia('(width < 40rem)')
const isPhone = ref(phoneWidth.matches)

phoneWidth.addEventListener('change', (event) => {
  isPhone.value = event.matches
})

/**
 * Whether a screen is laid out for a phone, for what a stylesheet cannot decide: which route opens,
 * and what the bar names.
 */
export function useIsPhone() {
  return readonly(isPhone)
}
