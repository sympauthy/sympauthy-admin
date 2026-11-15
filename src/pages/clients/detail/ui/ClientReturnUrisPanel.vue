<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SaCopyButton,
  SaDetailSection,
  SaTable,
  SaTableActions,
  SaTableCell,
  SaTag
} from '@sympauthy/design'
import { clientReturnUris, type ClientDetailResource } from '@/entities/client'

const props = defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()

const uris = computed(() => clientReturnUris(props.client))
</script>

<template>
  <SaDetailSection :title="t('pages.clientDetail.returnUris')">
    <!-- Drawn as the redirect URIs above it are, so the two lists an operator compares read alike.
         The client's own `return_uri` comes first and is tagged: it is where a flow started without
         naming one returns, and the one an MFA enrollment or a provider link offers first. -->
    <SaTable :empty="uris.length === 0">
      <template #rows>
        <tr v-for="uri in uris" :key="uri">
          <SaTableCell primary mono>
            <span class="inline-flex items-center gap-2">
              {{ uri }}
              <SaTag v-if="uri === client.return_uri" color="gray">
                {{ t('pages.clientDetail.defaultReturnUri') }}
              </SaTag>
            </span>
          </SaTableCell>
          <SaTableActions>
            <SaCopyButton :value="uri" :label="t('pages.clientDetail.copyReturnUri', { uri })" />
          </SaTableActions>
        </tr>
      </template>
      <template #empty>
        <p class="text-sm text-gray-600">{{ t('pages.clientDetail.noReturnUris') }}</p>
      </template>
    </SaTable>
  </SaDetailSection>
</template>
