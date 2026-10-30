<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CommonTag,
  DefinitionList,
  DefinitionRow,
  DetailSection,
  DocHelpTooltip
} from '@/shared/ui'
import { type ClientDetailResource, clientRestrictsScopes } from '@/entities/client'

const props = defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()

const restrictsScopes = computed(() => clientRestrictsScopes(props.client))
const allowedScopes = computed(() => props.client.allowed_scopes ?? [])
</script>

<template>
  <DetailSection :title="t('pages.clientDetail.scopes')">
    <DefinitionList>
      <DefinitionRow>
        <template #label>
          {{ t('pages.clientDetail.allowedScopes.label') }}
          <DocHelpTooltip term="pages.clientDetail.allowedScopes" />
        </template>
        <div v-if="allowedScopes.length > 0" class="flex flex-wrap gap-1">
          <CommonTag v-for="scope in allowedScopes" :key="scope" color="blue">
            {{ scope }}
          </CommonTag>
        </div>
        <span v-else-if="restrictsScopes" class="text-gray-500">
          {{ t('pages.clientDetail.noScopes') }}
        </span>
        <span v-else class="text-gray-500">{{ t('pages.clientDetail.allScopes') }}</span>
      </DefinitionRow>
      <DefinitionRow>
        <template #label>
          {{ t('pages.clientDetail.defaultScopes.label') }}
          <DocHelpTooltip term="pages.clientDetail.defaultScopes" />
        </template>
        <div v-if="client.default_scopes.length > 0" class="flex flex-wrap gap-1">
          <CommonTag v-for="scope in client.default_scopes" :key="scope" color="green">
            {{ scope }}
          </CommonTag>
        </div>
        <span v-else class="text-gray-500">{{ t('pages.clientDetail.noScopes') }}</span>
      </DefinitionRow>
    </DefinitionList>
  </DetailSection>
</template>
