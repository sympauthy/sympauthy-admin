<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowRightStartOnRectangleIcon, ExclamationTriangleIcon } from '@heroicons/vue/20/solid'
import { missingScopesHint, useAuthStore, useRouteAccess } from '@/shared/auth'
import { useSidebar } from '@/shared/lib'
import { usePreferencesStore } from '@/shared/operator-preferences'
import { SaBrandLogo, SaSidebar, type SaSidebarSection } from '@sympauthy/design'
import { BrandWordmark } from '@/shared/ui'
import { navSections } from '../router/navigation'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()
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
      <!-- `SaSidebarAccount`'s markup, drawn here because it says nothing under the operator's
           name, and this foot says when the server has not taken a copy of their preferences. It
           goes back to the package once the component can: sympauthy/sympauthy-design#72. -->
      <div class="flex flex-col gap-3">
        <div class="flex min-w-0 flex-col">
          <span :title="authStore.userName" class="truncate text-sm font-medium text-nav-strong">
            {{ authStore.userName }}
          </span>
          <span
            v-if="authStore.userEmail"
            :title="authStore.userEmail"
            class="truncate text-xs text-nav-muted"
          >
            {{ authStore.userEmail }}
          </span>
        </div>
        <p
          v-if="preferencesStore.notKeptReason"
          role="status"
          class="flex gap-1.5 text-xs text-nav-muted"
        >
          <ExclamationTriangleIcon class="mt-px size-4 shrink-0 text-gold" />
          {{ t(`nav.notKept.${preferencesStore.notKeptReason}`) }}
        </p>
        <button
          type="button"
          class="flex min-h-control items-center justify-center gap-1.5 rounded-md border border-nav-muted text-sm font-medium -outline-offset-2 outline-nav-text transition-colors hover:bg-nav-hover focus-visible:outline-2"
          @click="logout"
        >
          <ArrowRightStartOnRectangleIcon class="size-4" />
          {{ t('auth.logout') }}
        </button>
      </div>
    </template>
  </SaSidebar>
</template>
