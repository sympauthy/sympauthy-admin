<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import { ArrowRightStartOnRectangleIcon, XMarkIcon } from '@heroicons/vue/20/solid'
import { useSidebar } from '@/composables/useSidebar'

const { t } = useI18n()
const authStore = useAuthStore()
const { closeSidebar } = useSidebar()

async function logout() {
  await authStore.signout()
}
</script>

<template>
  <nav class="flex flex-col h-full bg-gray-800 text-white">
    <div class="h-14 flex items-center justify-between px-4 text-lg font-semibold border-b border-gray-700">
      <span>SympAuthy Admin</span>
      <button :title="t('nav.closeMenu')" class="lg:hidden text-gray-400 hover:text-white" @click="closeSidebar">
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
    <ul class="flex flex-col mt-2 flex-1">
      <li>
        <router-link
          to="/"
          class="block px-4 py-2 hover:bg-gray-700 transition-colors"
          active-class="bg-gray-900"
        >
          {{ t('nav.dashboard') }}
        </router-link>
      </li>
      <li>
        <router-link to='/users' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.users') }}
        </router-link>
      </li>
      <li>
        <router-link to='/clients' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.clients') }}
        </router-link>
      </li>
      <li>
        <router-link to='/claims' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.claims') }}
        </router-link>
      </li>
      <li>
        <router-link to='/scopes' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.scopes') }}
        </router-link>
      </li>
      <!-- <li>
        <router-link to='/configuration' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.configuration') }}
        </router-link>
      </li> -->
      <!-- <li>
        <router-link to='/sessions' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.sessions') }}
        </router-link>
      </li> -->
    </ul>
    <div class="border-t border-gray-700 p-4">
      <div class="text-sm text-gray-300 truncate mb-2">{{ authStore.userName }}</div>
      <button
        class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        @click="logout"
      >
        <ArrowRightStartOnRectangleIcon class="h-4 w-4" />
        {{ t('auth.logout') }}
      </button>
    </div>
  </nav>
</template>
