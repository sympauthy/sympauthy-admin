<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CommonCard, DetailSection } from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.redirectUris')">
    <!-- A list of one kind of value rather than a record's fields, so it is a card of them rather
         than a definition list with nothing to put in the labels. -->
    <CommonCard>
      <div v-if="client.allowed_redirect_uris && client.allowed_redirect_uris.length > 0">
        <div
          v-for="uri in client.allowed_redirect_uris"
          :key="uri"
          class="truncate font-mono text-sm text-gray-900"
        >
          {{ uri }}
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">
        {{ t('pages.clientDetail.noRedirectUris') }}
      </p>
    </CommonCard>
  </DetailSection>
</template>
