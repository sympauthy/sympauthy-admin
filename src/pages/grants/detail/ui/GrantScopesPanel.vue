<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SaDefinitionList, SaDefinitionRow, SaDetailSection, SaEmptyValue } from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'
import {
  grantConsentedByLabel,
  grantGrantedByLabel,
  type GrantDetailResource
} from '@/entities/grant'
import { ScopeTag, ScopeTypeLegend } from '@/entities/scope'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <!-- Each set is named by how it was given, under its label, and drawn as the scopes screen draws
       its kind: a granted scope is grantable, a consented one consentable, and a client scope is
       the client's. When each was given is the timeline's. The legend says what each look
       means: the section draws its title alone, so the legend is laid over the right of that line
       rather than put in it, where it would become part of the heading's name. -->
  <div class="grid">
    <ScopeTypeLegend class="col-start-1 row-start-1 h-7 justify-self-end" />
    <SaDetailSection :title="t('pages.grantDetail.scopes')" class="col-start-1 row-start-1">
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
            <ScopeTag v-for="scope in grant.granted_scopes" :key="scope" type="grantable">
              {{ scope }}
            </ScopeTag>
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
            <ScopeTag v-for="scope in grant.consented_scopes" :key="scope" type="consentable">
              {{ scope }}
            </ScopeTag>
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
            <ScopeTag v-for="scope in grant.client_scopes" :key="scope" type="client">
              {{ scope }}
            </ScopeTag>
          </div>
          <SaEmptyValue v-else />
        </SaDefinitionRow>
      </SaDefinitionList>
    </SaDetailSection>
  </div>
</template>
