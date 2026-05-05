<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Tag from '@/components/Tag.vue'
import type { ClientDetailResource } from '@/client/model/ClientDetailResource'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
    <h3 class="text-sm font-medium text-gray-900 mb-4">
      {{ t('pages.clientDetail.authorization') }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-if="client.authorization_flow_id">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.authorizationFlow') }}
        </dt>
        <dd class="mt-1 text-sm font-mono text-gray-900">
          {{ client.authorization_flow_id }}
        </dd>
      </div>
      <template v-if="client.authorization_webhook">
        <div>
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.clientDetail.webhookUrl') }}
          </dt>
          <dd class="mt-1 text-sm font-mono text-gray-900 truncate">
            {{ client.authorization_webhook.url }}
          </dd>
        </div>
        <div>
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.clientDetail.webhookOnFailure') }}
          </dt>
          <dd class="mt-1">
            <Tag :color="client.authorization_webhook.on_failure === 'deny_all' ? 'red' : 'yellow'">
              {{ client.authorization_webhook.on_failure }}
            </Tag>
          </dd>
        </div>
      </template>
    </div>
  </div>
</template>
