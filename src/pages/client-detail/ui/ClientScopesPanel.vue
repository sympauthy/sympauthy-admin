<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DefinitionList, DefinitionRow, DetailSection, Tag } from '@/shared/ui'
import type { ClientDetailResource } from '@/entities/client'

defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.scopes')">
    <DefinitionList>
      <DefinitionRow :label="t('pages.clientDetail.allowedScopes')">
        <div v-if="client.allowed_scopes.length > 0" class="flex flex-wrap gap-1">
          <Tag v-for="scope in client.allowed_scopes" :key="scope" color="blue">
            {{ scope }}
          </Tag>
        </div>
        <span v-else class="text-gray-500">{{ t('pages.clientDetail.noScopes') }}</span>
      </DefinitionRow>
      <DefinitionRow :label="t('pages.clientDetail.defaultScopes')">
        <div v-if="client.default_scopes.length > 0" class="flex flex-wrap gap-1">
          <Tag v-for="scope in client.default_scopes" :key="scope" color="green">
            {{ scope }}
          </Tag>
        </div>
        <span v-else class="text-gray-500">{{ t('pages.clientDetail.noScopes') }}</span>
      </DefinitionRow>
    </DefinitionList>
  </DetailSection>
</template>
