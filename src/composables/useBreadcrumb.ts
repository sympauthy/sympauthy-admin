import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const dynamicLabel = ref<string | null>(null)

export function useBreadcrumb() {
  const route = useRoute()

  watch(() => route.fullPath, () => {
    dynamicLabel.value = null
  })

  function setLabel(label: string) {
    dynamicLabel.value = label
  }

  return {
    dynamicLabel,
    setLabel,
  }
}
