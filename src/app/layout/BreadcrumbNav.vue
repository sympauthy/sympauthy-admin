<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { useBreadcrumb } from '@/shared/lib'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { dynamicLabel } = useBreadcrumb()

type BreadcrumbItem = {
  label: string
  to?: string
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = []
  const allRoutes = router.getRoutes()

  const currentMeta = route.meta.breadcrumb

  // Walk up the parent chain to collect ancestors
  const ancestors: { label: string; name: string }[] = []
  if (currentMeta?.parent) {
    let parentName: string | undefined = currentMeta.parent
    while (parentName) {
      const parentRoute = allRoutes.find((r) => r.name === parentName)
      const parentMeta = parentRoute?.meta?.breadcrumb
      if (parentMeta) {
        ancestors.unshift({ label: t(parentMeta.label), name: parentName })
        parentName = parentMeta.parent
      } else {
        break
      }
    }
  }

  // Add ancestors as links
  for (const ancestor of ancestors) {
    items.push({
      label: ancestor.label,
      to: router.resolve({ name: ancestor.name }).href
    })
  }

  // Add current page (no link)
  if (currentMeta) {
    items.push({
      label: dynamicLabel.value ?? t(currentMeta.label)
    })
  }

  return items
})
</script>

<template>
  <nav
    v-if="breadcrumbs.length > 0"
    class="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white"
  >
    <!-- Lined up with the column the content below is centred in, so the record's name sits over
         the record rather than at the far edge of a wide monitor. -->
    <ol class="mx-auto flex w-full max-w-page items-center gap-2 px-4 lg:px-6">
      <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center gap-2">
        <ChevronRightIcon v-if="index > 0" class="size-4 shrink-0 text-gray-400" />
        <router-link
          v-if="item.to"
          :to="item.to"
          class="text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="text-sm font-semibold text-gray-900">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
