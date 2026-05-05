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
      {{ t('pages.clientDetail.scopes') }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.allowedScopes') }}
        </dt>
        <dd class="mt-2">
          <Tag v-for="scope in client.allowed_scopes" :key="scope" color="blue" class="mr-1 mb-1">
            {{ scope }}
          </Tag>
          <span v-if="client.allowed_scopes.length === 0" class="text-sm text-gray-500">
            {{ t('pages.clientDetail.noScopes') }}
          </span>
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.defaultScopes') }}
        </dt>
        <dd class="mt-2">
          <Tag v-for="scope in client.default_scopes" :key="scope" color="green" class="mr-1 mb-1">
            {{ scope }}
          </Tag>
          <span v-if="client.default_scopes.length === 0" class="text-sm text-gray-500">
            {{ t('pages.clientDetail.noScopes') }}
          </span>
        </dd>
      </div>
    </div>
  </div>
</template>
