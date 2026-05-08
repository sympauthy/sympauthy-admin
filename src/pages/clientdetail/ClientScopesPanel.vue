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
  <DetailSection :title="t('pages.clientDetail.scopes')">
    <dl class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      <div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.allowedScopes') }}
        </dt>
        <dd class="mt-1 sm:mt-0 sm:col-span-2">
          <Tag v-for="scope in client.allowed_scopes" :key="scope" color="blue" class="mr-1 mb-1">
            {{ scope }}
          </Tag>
          <span v-if="client.allowed_scopes.length === 0" class="text-sm text-gray-500">
            {{ t('pages.clientDetail.noScopes') }}
          </span>
        </dd>
      </div>
      <div class="px-4 py-3 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
        <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.clientDetail.defaultScopes') }}
        </dt>
        <dd class="mt-1 sm:mt-0 sm:col-span-2">
          <Tag v-for="scope in client.default_scopes" :key="scope" color="green" class="mr-1 mb-1">
            {{ scope }}
          </Tag>
          <span v-if="client.default_scopes.length === 0" class="text-sm text-gray-500">
            {{ t('pages.clientDetail.noScopes') }}
          </span>
        </dd>
      </div>
    </dl>
  </DetailSection>
</template>
