<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { missingScopesHint, useAuthStore, useRouteAccess } from '@/shared/auth'
import { useSidebar } from '@/shared/lib'
import { SaBrandLogo, SaSidebar, SaSidebarAccount, type SaSidebarSection } from '@sympauthy/design'
import { BrandWordmark } from '@/shared/ui'
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
    :home-link="{ to: '/' }"
    :close-label="t('nav.closeMenu')"
    :link-as="RouterLink"
    @close="closeSidebar"
  >
    <template #head>
      <SaBrandLogo dark size="md" />
      <span class="truncate text-lg tracking-tight"><BrandWordmark /></span>
      <span class="text-xs font-medium tracking-wider text-nav-muted uppercase">
        {{ t('nav.panel') }}
      </span>
    </template>
    <template #foot>
      <SaSidebarAccount
        :name="authStore.userName"
        :detail="authStore.userEmail"
        :sign-out-label="t('auth.logout')"
        @sign-out="logout"
      />
    </template>
  </SaSidebar>
</template>
