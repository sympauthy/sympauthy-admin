import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const sidebarOpen = ref(false)

export function useSidebar() {
  const route = useRoute()

  watch(
    () => route.fullPath,
    () => {
      sidebarOpen.value = false
    }
  )

  function closeSidebar() {
    sidebarOpen.value = false
  }

  return {
    sidebarOpen,
    closeSidebar
  }
}
