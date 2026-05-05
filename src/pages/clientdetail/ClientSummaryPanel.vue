<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Tag from '@/components/Tag.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import type { ClientDetailResource } from '@/client/model/ClientDetailResource'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="min-w-0">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.clientId') }}
        </dt>
        <dd class="mt-1 flex items-center gap-1.5 min-w-0">
          <span class="text-sm text-gray-900 font-mono truncate">
            {{ client.client_id }}
          </span>
          <CopyToClipboard
            :value="client.client_id"
            :title="t('pages.clientDetail.copyClientId')"
          />
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.type') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          {{ client.type }}
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.audience') }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900">
          {{ client.audience_id }}
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.grantTypes') }}
        </dt>
        <dd class="mt-1">
          <Tag
            v-for="grantType in client.allowed_grant_types"
            :key="grantType"
            color="blue"
            class="mr-1 mb-1"
          >
            {{ grantType }}
          </Tag>
        </dd>
      </div>
    </div>
  </div>
</template>
