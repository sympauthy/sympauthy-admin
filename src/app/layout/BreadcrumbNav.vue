<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBreadcrumb, useIsPhone } from '@/shared/lib'
import { SaBreadcrumb, type SaBreadcrumbItem } from '@sympauthy/design'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { dynamicLabel } = useBreadcrumb()
const isPhone = useIsPhone()

const breadcrumbs = computed<SaBreadcrumbItem[]>(() => {
  const items: SaBreadcrumbItem[] = []
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
      key: ancestor.name,
      label: ancestor.label,
      link: { to: { name: ancestor.name } }
    })
  }

  // Add current page (no link)
  if (currentMeta) {
    const label = dynamicLabel.value ?? t(currentMeta.label)
    const view = route.meta.view

    // A wider screen draws the view as a tab under the record, which stays what the bar names. A
    // phone opens it as a screen of its own, under the record.
    if (view && isPhone.value) {
      items.push({
        key: view.record,
        label,
        link: { to: { name: view.record, params: route.params } }
      })
      items.push({ key: String(route.name), label: t(view.label) })
    } else {
      items.push({ key: String(route.name), label })
    }
  }

  return items
})
</script>

<template>
  <SaBreadcrumb
    :items="breadcrumbs"
    :label="t('nav.breadcrumb')"
    :link-as="RouterLink"
    :back-label="(name) => t('nav.backTo', { name })"
  />
</template>
