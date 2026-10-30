<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/auth'
import { ArrowRightStartOnRectangleIcon, XMarkIcon } from '@heroicons/vue/20/solid'
import { useSidebar } from '@/shared/lib'
import { HintTooltip } from '@/shared/ui'
import { navSections } from '../router/navigation'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { closeSidebar } = useSidebar()

// Every entry is drawn, and one the token cannot open is drawn disabled: the operator sees what the
// panel holds and what their token keeps them from, rather than a sidebar that changes shape with
// the scopes they were granted.
const sections = computed(() =>
  navSections.map((section) => ({
    label: section.label,
    entries: section.entries.map((entry) => {
      const route = router.resolve({ name: entry.name })
      return {
        ...entry,
        path: route.path,
        missingScopes: authStore.missingScopes(route.meta.requiredScopes ?? [])
      }
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
  <nav class="flex h-full flex-col bg-gray-800 text-white">
    <div
      class="flex h-14 items-center justify-between border-b border-gray-700 px-4 text-lg font-semibold"
    >
      <span>SympAuthy Admin</span>
      <button
        :title="t('nav.closeMenu')"
        class="text-gray-400 hover:text-white lg:hidden"
        @click="closeSidebar"
      >
        <XMarkIcon class="size-5" />
      </button>
    </div>
    <ul class="mt-2 flex flex-1 flex-col">
      <template v-for="(section, index) in sections" :key="section.label">
        <li v-if="index > 0" class="my-2 border-t border-gray-700" />
        <li class="px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          {{ t(section.label) }}
        </li>
        <li v-for="entry in section.entries" :key="entry.name">
          <HintTooltip
            v-if="entry.missingScopes.length > 0"
            :text="t('common.missingScopes', { scopes: entry.missingScopes.join(', ') })"
            side="right"
            block
          >
            <span aria-disabled="true" class="block cursor-not-allowed px-4 py-2 text-gray-500">
              {{ t(entry.label) }}
            </span>
          </HintTooltip>
          <router-link
            v-else
            :to="entry.path"
            :class="[
              'block px-4 py-2 transition-colors hover:bg-gray-700',
              { 'bg-gray-900': isActive(entry.path) }
            ]"
          >
            {{ t(entry.label) }}
          </router-link>
        </li>
      </template>
    </ul>
    <div class="border-t border-gray-700 p-4">
      <div class="mb-2 truncate text-sm text-gray-300">{{ authStore.userName }}</div>
      <button
        class="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        @click="logout"
      >
        <ArrowRightStartOnRectangleIcon class="size-4" />
        {{ t('auth.logout') }}
      </button>
    </div>
  </nav>
</template>
