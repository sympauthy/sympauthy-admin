<script lang='ts' setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <nav class='flex flex-col w-64 min-h-screen bg-gray-800 text-white'>
    <div class='p-4 text-lg font-semibold border-b border-gray-700'>
      SympAuthy Admin
    </div>
    <ul class='flex flex-col mt-2'>
      <li>
        <router-link
          to='/'
          class='block px-4 py-2 hover:bg-gray-700 transition-colors'
          active-class='bg-gray-900'
        >
          {{ t('nav.dashboard') }}
        </router-link>
      </li>
      <!-- <li>
        <router-link to='/users' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.users') }}
        </router-link>
      </li> -->
      <!-- <li>
        <router-link to='/clients' class='block px-4 py-2 hover:bg-gray-700 transition-colors' active-class='bg-gray-900'>
          {{ t('nav.clients') }}
        </router-link>
      </li> -->
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
  </nav>
</template>
