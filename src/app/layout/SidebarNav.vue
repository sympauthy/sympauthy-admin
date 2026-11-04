<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { missingScopesHint, useAuthStore, useRouteAccess } from '@/shared/auth'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/20/solid'
import { useSidebar } from '@/shared/lib'
import { BrandWordmark, SaBrandLogo, SaSidebar, type SaSidebarSection } from '@/shared/ui'
import { navSections } from '../router/navigation'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { missingScopes } = useRouteAccess()
const { closeSidebar } = useSidebar()

// Every entry is drawn, and one the token cannot open is drawn disabled: the operator sees what the
// panel holds and what their token keeps them from, rather than a sidebar that changes shape with
// the scopes they were granted. An entry naming a route the router does not know is dropped rather
// than drawn, since there is nothing to open.
const sections = computed<SaSidebarSection[]>(() =>
  navSections.map((section) => ({
    label: t(section.label),
    entries: section.entries.flatMap((entry) => {
      const missing = missingScopes(entry.name)
      if (missing === undefined) {
        return []
      }
      const path = router.resolve({ name: entry.name }).path
      return [
        {
          key: entry.name,
          label: t(entry.label),
          link: { to: path },
          current: route.path === path || route.path.startsWith(path + '/'),
          disabledReason: missingScopesHint(missing)
        }
      ]
    })
  }))
)

async function logout() {
  await authStore.signout()
}
</script>

<template>
  <SaSidebar
    :sections="sections"
    :label="t('nav.main')"
    :close-label="t('nav.closeMenu')"
    :link-as="RouterLink"
    @close="closeSidebar"
  >
    <template #head>
      <SaBrandLogo dark />
      <span class="truncate text-lg font-semibold">
        <BrandWordmark />
        <span class="ml-1.5 font-medium text-nav-muted">{{ t('nav.panel') }}</span>
      </span>
    </template>
    <template #foot>
      <div class="mb-2 truncate text-sm">{{ authStore.userName }}</div>
      <button
        class="flex min-h-control items-center gap-2 text-sm text-nav-muted outline-nav-text transition-colors hover:text-nav-text focus-visible:outline-2"
        @click="logout"
      >
        <ArrowRightStartOnRectangleIcon class="size-4" />
        {{ t('auth.logout') }}
      </button>
    </template>
  </SaSidebar>
</template>
