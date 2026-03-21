import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const sidebarOpen = ref(false)

export function useSidebar() {
  const route = useRoute()

  watch(
    () => route.fullPath,
    () => {
      sidebarOpen.value = false
    },
  )

  function openSidebar() {
    sidebarOpen.value = true
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  return {
    sidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  }
}
