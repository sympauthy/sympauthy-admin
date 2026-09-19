import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const dynamicLabel = ref<string | null>(null)

export function useBreadcrumb() {
  const route = useRoute()

  // Cleared when the record changes, not when the path does: a record's tabs are routes of its own,
  // so moving between them changes the path while the record the breadcrumb names stays put. The
  // matched record route is the first one carrying a breadcrumb with a parent.
  watch(
    () => {
      const record = route.matched.find((match) => match.meta.breadcrumb?.parent)
      return record ? record.path + JSON.stringify(route.params) : route.fullPath
    },
    () => {
      dynamicLabel.value = null
    }
  )

  function setLabel(label: string) {
    dynamicLabel.value = label
  }

  return {
    dynamicLabel,
    setLabel
  }
}
