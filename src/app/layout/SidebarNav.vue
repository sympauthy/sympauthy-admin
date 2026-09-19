<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/shared/auth'
import { ArrowRightStartOnRectangleIcon, XMarkIcon } from '@heroicons/vue/20/solid'
import { useSidebar } from '@/shared/lib'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const { closeSidebar } = useSidebar()

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
      <li class="px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {{ t('nav.sectionUsers') }}
      </li>
      <li>
        <router-link
          to="/users"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/users') }
          ]"
        >
          {{ t('nav.users') }}
        </router-link>
      </li>
      <li>
        <router-link
          to="/invitations"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/invitations') }
          ]"
        >
          {{ t('nav.invitations') }}
        </router-link>
      </li>
      <li class="my-2 border-t border-gray-700" />
      <li class="px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {{ t('nav.sectionConfiguration') }}
      </li>
      <li>
        <router-link
          to="/audiences"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/audiences') }
          ]"
        >
          {{ t('nav.audiences') }}
        </router-link>
      </li>
      <li>
        <router-link
          to="/clients"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/clients') }
          ]"
        >
          {{ t('nav.clients') }}
        </router-link>
      </li>
      <li>
        <router-link
          to="/claims"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/claims') }
          ]"
        >
          {{ t('nav.claims') }}
        </router-link>
      </li>
      <li>
        <router-link
          to="/scopes"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/scopes') }
          ]"
        >
          {{ t('nav.scopes') }}
        </router-link>
      </li>
      <!-- <li>
        <router-link to='/configuration' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.configuration') }}
        </router-link>
      </li> -->
      <li class="my-2 border-t border-gray-700" />
      <li class="px-4 py-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {{ t('nav.sectionDiagnostics') }}
      </li>
      <li>
        <router-link
          to="/sessions"
          :class="[
            'block px-4 py-2 transition-colors hover:bg-gray-700',
            { 'bg-gray-900': isActive('/sessions') }
          ]"
        >
          {{ t('nav.sessions') }}
        </router-link>
      </li>
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
