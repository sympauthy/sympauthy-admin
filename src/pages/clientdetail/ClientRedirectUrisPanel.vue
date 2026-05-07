<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import DetailSection from '@/components/DetailSection.vue'
import type { ClientDetailResource } from '@/client/model/ClientDetailResource'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.redirectUris')">
    <dl class="bg-white rounded-lg border border-gray-200">
      <div class="px-4 py-3 sm:px-6">
        <dd v-if="client.allowed_redirect_uris && client.allowed_redirect_uris.length > 0">
          <div
            v-for="uri in client.allowed_redirect_uris"
            :key="uri"
            class="text-sm font-mono text-gray-900 truncate"
          >
            {{ uri }}
          </div>
        </dd>
        <dd v-else class="text-sm text-gray-500">
          {{ t('pages.clientDetail.noRedirectUris') }}
        </dd>
      </div>
    </dl>
  </DetailSection>
</template>
