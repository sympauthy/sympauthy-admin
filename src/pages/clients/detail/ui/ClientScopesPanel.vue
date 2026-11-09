<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon } from '@heroicons/vue/20/solid'
import { SaDefinitionList, SaDefinitionRow, SaDetailSection } from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'
import {
  type ClientDetailResource,
  clientDefaultsToAllowedScopes,
  clientRestrictsScopes
} from '@/entities/client'
import { type ScopeResource, ScopeTag, ScopeTypeLegend } from '@/entities/scope'

const props = defineProps<{
  client: ClientDetailResource
  /** Every scope the deployment declares, for the type each of the client's is drawn as. */
  scopes: ScopeResource[]
}>()

const { t } = useI18n()

const restrictsScopes = computed(() => clientRestrictsScopes(props.client))
const allowedScopes = computed(() => props.client.allowed_scopes ?? [])
// Listing the same scopes twice would make the reader compare the two rows to learn they agree.
const defaultsToAllowed = computed(() => clientDefaultsToAllowedScopes(props.client))

const scopeTypes = computed(() => new Map(props.scopes.map((scope) => [scope.id, scope.type])))
</script>

<template>
  <!-- The section draws its title alone, so the legend is laid over the right of that line rather
       than put in it, where it would become part of the heading's name. -->
  <div class="grid">
    <ScopeTypeLegend class="col-start-1 row-start-1 h-7 justify-self-end" />
    <SaDetailSection :title="t('pages.clientDetail.scopes')" class="col-start-1 row-start-1">
      <SaDefinitionList>
        <SaDefinitionRow>
          <template #label>
            {{ t('pages.clientDetail.allowedScopes.label') }}
            <DocHelpTooltip term="pages.clientDetail.allowedScopes" />
            <span class="block text-sm font-normal tracking-normal text-gray-600 normal-case">
              {{
                restrictsScopes
                  ? t('pages.clientDetail.allowedScopes.detail', allowedScopes.length)
                  : t('pages.clientDetail.allowedScopes.detailUnrestricted')
              }}
            </span>
          </template>
          <div v-if="allowedScopes.length > 0" class="flex flex-wrap gap-1">
            <ScopeTag v-for="scope in allowedScopes" :key="scope" :type="scopeTypes.get(scope)">
              {{ scope }}
            </ScopeTag>
          </div>
          <span v-else-if="restrictsScopes" class="text-gray-500">
            {{ t('pages.clientDetail.noScopes') }}
          </span>
          <span v-else class="text-gray-500">{{ t('pages.clientDetail.allScopes') }}</span>
        </SaDefinitionRow>
        <SaDefinitionRow>
          <template #label>
            {{ t('pages.clientDetail.defaultScopes.label') }}
            <DocHelpTooltip term="pages.clientDetail.defaultScopes" />
            <span class="block text-sm font-normal tracking-normal text-gray-600 normal-case">
              {{ t('pages.clientDetail.defaultScopes.detail') }}
            </span>
          </template>
          <span v-if="defaultsToAllowed" class="inline-flex items-center gap-2">
            <CheckCircleIcon class="size-5 shrink-0 text-tag-green" aria-hidden="true" />
            {{ t('pages.clientDetail.everyAllowedScope') }}
          </span>
          <div v-else-if="client.default_scopes.length > 0" class="flex flex-wrap gap-1">
            <ScopeTag
              v-for="scope in client.default_scopes"
              :key="scope"
              :type="scopeTypes.get(scope)"
            >
              {{ scope }}
            </ScopeTag>
          </div>
          <span v-else class="text-gray-500">{{ t('pages.clientDetail.noScopes') }}</span>
        </SaDefinitionRow>
      </SaDefinitionList>
    </SaDetailSection>
  </div>
</template>
