<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  SaDefinitionList,
  SaDefinitionRow,
  SaDetailSection,
  SaEmptyValue,
  SaTag
} from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'
import {
  grantConsentedByLabel,
  grantGrantedByLabel,
  type GrantDetailResource
} from '@/entities/grant'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <!-- Each set is named by how it was given, under its label, and drawn in the colour the scopes
       screen gives its kind: a granted scope is grantable, a consented one consentable, and a client
       scope is the client's. When each was given is the timeline's. -->
  <SaDetailSection :title="t('pages.grantDetail.scopes')">
    <SaDefinitionList>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.grantedScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.grantedScopes" />
          <span
            v-if="grant.granted_by"
            class="block text-sm font-normal tracking-normal text-gray-600 normal-case"
          >
            {{ grantGrantedByLabel(grant.granted_by) }}
          </span>
        </template>
        <div v-if="grant.granted_scopes.length > 0" class="flex flex-wrap gap-1">
          <SaTag v-for="scope in grant.granted_scopes" :key="scope" color="purple">
            {{ scope }}
          </SaTag>
        </div>
        <SaEmptyValue v-else />
      </SaDefinitionRow>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.consentedScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.consentedScopes" />
          <span
            v-if="grant.consented_by"
            class="block text-sm font-normal tracking-normal text-gray-600 normal-case"
          >
            {{ grantConsentedByLabel(grant.consented_by) }}
          </span>
        </template>
        <div v-if="grant.consented_scopes.length > 0" class="flex flex-wrap gap-1">
          <SaTag v-for="scope in grant.consented_scopes" :key="scope" color="blue">
            {{ scope }}
          </SaTag>
        </div>
        <SaEmptyValue v-else />
      </SaDefinitionRow>
      <SaDefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.clientScopes.label') }}
          <DocHelpTooltip term="pages.grantDetail.clientScopes" />
          <span class="block text-sm font-normal tracking-normal text-gray-600 normal-case">
            {{ t('pages.grantDetail.clientScopes.detail') }}
          </span>
        </template>
        <div v-if="grant.client_scopes.length > 0" class="flex flex-wrap gap-1">
          <SaTag v-for="scope in grant.client_scopes" :key="scope" color="gray">
            {{ scope }}
          </SaTag>
        </div>
        <SaEmptyValue v-else />
      </SaDefinitionRow>
    </SaDefinitionList>
  </SaDetailSection>
</template>
