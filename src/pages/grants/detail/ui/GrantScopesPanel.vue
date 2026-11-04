<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  DocHelpTooltip,
  SaDefinitionList,
  SaDefinitionRow,
  SaDetailSection,
  SaEmptyValue,
  SaTag
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
  <SaDetailSection :title="t('pages.grantDetail.scopes')">
    <SaDefinitionList>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.grantedScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.grantedScopes" />
        </template>
        <div v-if="grant.granted_scopes.length > 0" class="flex flex-wrap gap-1">
          <SaTag v-for="scope in grant.granted_scopes" :key="scope" color="blue">
            {{ scope }}
          </SaTag>
        </div>
        <SaEmptyValue v-else />
      </SaDefinitionRow>
      <SaDefinitionRow v-if="grant.granted_by" :label="t('pages.grantDetail.grantedBy')">
        {{ grantGrantedByLabel(grant.granted_by) }}
        <template v-if="grant.granted_at">· {{ formatDateTime(grant.granted_at) }}</template>
      </SaDefinitionRow>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.consentedScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.consentedScopes" />
        </template>
        <div v-if="grant.consented_scopes.length > 0" class="flex flex-wrap gap-1">
          <SaTag v-for="scope in grant.consented_scopes" :key="scope" color="blue">
            {{ scope }}
          </SaTag>
        </div>
        <SaEmptyValue v-else />
      </SaDefinitionRow>
      <SaDefinitionRow v-if="grant.consented_by" :label="t('pages.grantDetail.consentedBy')">
        {{ grantConsentedByLabel(grant.consented_by) }}
        <template v-if="grant.consented_at">· {{ formatDateTime(grant.consented_at) }}</template>
      </SaDefinitionRow>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.clientScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.clientScopes" />
        </template>
        <div v-if="grant.client_scopes.length > 0" class="flex flex-wrap gap-1">
          <SaTag v-for="scope in grant.client_scopes" :key="scope" color="blue">
            {{ scope }}
          </SaTag>
        </div>
        <SaEmptyValue v-else />
      </SaDefinitionRow>
    </SaDefinitionList>
  </SaDetailSection>
</template>
