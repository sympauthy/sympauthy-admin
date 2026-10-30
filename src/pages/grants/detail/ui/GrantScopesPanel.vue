<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  CommonTag,
  DefinitionList,
  DefinitionRow,
  DetailSection,
  DocHelpTooltip,
  EmptyValue
} from '@/shared/ui'
import {
  grantConsentedByLabel,
  grantGrantedByLabel,
  type GrantDetailResource
} from '@/entities/grant'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.grantDetail.scopes')">
    <DefinitionList>
      <DefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.grantedScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.grantedScopes" />
        </template>
        <div v-if="grant.granted_scopes.length > 0" class="flex flex-wrap gap-1">
          <CommonTag v-for="scope in grant.granted_scopes" :key="scope" color="blue">
            {{ scope }}
          </CommonTag>
        </div>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow v-if="grant.granted_by" :label="t('pages.grantDetail.grantedBy')">
        {{ grantGrantedByLabel(grant.granted_by) }}
        <template v-if="grant.granted_at">· {{ formatDateTime(grant.granted_at) }}</template>
      </DefinitionRow>
      <DefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.consentedScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.consentedScopes" />
        </template>
        <div v-if="grant.consented_scopes.length > 0" class="flex flex-wrap gap-1">
          <CommonTag v-for="scope in grant.consented_scopes" :key="scope" color="blue">
            {{ scope }}
          </CommonTag>
        </div>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow v-if="grant.consented_by" :label="t('pages.grantDetail.consentedBy')">
        {{ grantConsentedByLabel(grant.consented_by) }}
        <template v-if="grant.consented_at">· {{ formatDateTime(grant.consented_at) }}</template>
      </DefinitionRow>
      <DefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.clientScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.clientScopes" />
        </template>
        <div v-if="grant.client_scopes.length > 0" class="flex flex-wrap gap-1">
          <CommonTag v-for="scope in grant.client_scopes" :key="scope" color="blue">
            {{ scope }}
          </CommonTag>
        </div>
        <EmptyValue v-else />
      </DefinitionRow>
    </DefinitionList>
  </DetailSection>
</template>
