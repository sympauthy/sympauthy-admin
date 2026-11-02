<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { missingScopesHint, useAuthStore, useRouteAccess } from '@/shared/auth'
import { ArrowRightStartOnRectangleIcon, XMarkIcon } from '@heroicons/vue/20/solid'
import { useSidebar } from '@/shared/lib'
import { BrandLogo, BrandWordmark, HintTooltip } from '@/shared/ui'
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
const sections = computed(() =>
  navSections.map((section) => ({
    label: section.label,
    entries: section.entries.flatMap((entry) => {
      const missing = missingScopes(entry.name)
      if (missing === undefined) {
        return []
      }
      return [
        {
          ...entry,
          path: router.resolve({ name: entry.name }).path,
          hint: missingScopesHint(missing)
        }
      ]
    })
  }))
)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

async function logout() {
  await authStore.signout()
}
</script>

<template>
  <nav class="flex h-full flex-col bg-nav text-nav-text">
    <div class="flex h-14 items-center justify-between gap-2 border-b border-nav-divider px-4">
      <div class="flex min-w-0 items-center gap-2">
        <BrandLogo on-dark />
        <span class="truncate text-lg font-semibold text-white">
          <BrandWordmark />
          <span class="ml-1.5 font-medium text-nav-muted">{{ t('nav.panel') }}</span>
        </span>
      </div>
      <button
        :title="t('nav.closeMenu')"
        class="shrink-0 text-nav-muted hover:text-white lg:hidden"
        @click="closeSidebar"
      >
        <XMarkIcon class="size-5" />
      </button>
    </div>
    <ul class="mt-2 flex flex-1 flex-col">
      <template v-for="(section, index) in sections" :key="section.label">
        <li v-if="index > 0" class="my-2 border-t border-nav-divider" />
        <li class="px-4 py-2 text-xs font-semibold tracking-wider text-nav-muted uppercase">
          {{ t(section.label) }}
        </li>
        <li v-for="entry in section.entries" :key="entry.name">
          <HintTooltip v-if="entry.hint" :text="entry.hint" side="right">
            <span
              role="link"
              aria-disabled="true"
              tabindex="0"
              class="block cursor-not-allowed px-4 py-2 text-sm text-nav-disabled"
            >
              {{ t(entry.label) }}
            </span>
          </HintTooltip>
          <router-link
            v-else
            :to="entry.path"
            :class="[
              'relative block px-4 py-2 text-sm transition-colors',
              isActive(entry.path)
                ? 'bg-nav-active font-medium text-white before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gold'
                : 'hover:bg-nav-hover'
            ]"
          >
            {{ t(entry.label) }}
          </router-link>
        </li>
      </template>
    </ul>
    <div class="border-t border-nav-divider p-4">
      <div class="mb-2 truncate text-sm">{{ authStore.userName }}</div>
      <button
        class="flex items-center gap-2 text-sm text-nav-muted transition-colors hover:text-white"
        @click="logout"
      >
        <ArrowRightStartOnRectangleIcon class="size-4" />
        {{ t('auth.logout') }}
      </button>
    </div>
  </nav>
</template>
