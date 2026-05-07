<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import DetailSection from '@/components/DetailSection.vue'
import Tag from '@/components/Tag.vue'
import type { ClientDetailResource } from '@/client/model/ClientDetailResource'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.authorization')">
    <dl class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      <div
        v-if="client.authorization_flow_id"
        class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center"
      >
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.authorizationFlow') }}
        </dt>
        <dd class="mt-1 sm:mt-0 sm:col-span-2 text-sm font-mono text-gray-900">
          {{ client.authorization_flow_id }}
        </dd>
      </div>
      <template v-if="client.authorization_webhook">
        <div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.clientDetail.webhookUrl') }}
          </dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2 text-sm font-mono text-gray-900 truncate">
            {{ client.authorization_webhook.url }}
          </dd>
        </div>
        <div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.clientDetail.webhookOnFailure') }}
          </dt>
          <dd class="mt-1 sm:mt-0 sm:col-span-2">
            <Tag :color="client.authorization_webhook.on_failure === 'deny_all' ? 'red' : 'yellow'">
              {{ client.authorization_webhook.on_failure }}
            </Tag>
          </dd>
        </div>
      </template>
    </dl>
  </DetailSection>
</template>
