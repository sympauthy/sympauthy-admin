<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { ClientDetailResource } from '@/client/model/ClientDetailResource'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
    <h3 class="text-sm font-medium text-gray-900 mb-4">
      {{ t('pages.clientDetail.redirectUris') }}
    </h3>
    <ul
      v-if="client.allowed_redirect_uris && client.allowed_redirect_uris.length > 0"
      class="space-y-1"
    >
      <li
        v-for="uri in client.allowed_redirect_uris"
        :key="uri"
        class="text-sm font-mono text-gray-900 truncate"
      >
        {{ uri }}
      </li>
    </ul>
    <p v-else class="text-sm text-gray-500">
      {{ t('pages.clientDetail.noRedirectUris') }}
    </p>
  </div>
</template>
