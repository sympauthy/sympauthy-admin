<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SaCopyButton,
  SaDetailSection,
  SaTable,
  SaTableActions,
  SaTableCell
} from '@sympauthy/design'
import type { ClientDetailResource } from '@/entities/client'

const props = defineProps<{
  client: ClientDetailResource
}>()

const { t } = useI18n()

const uris = computed(() => props.client.allowed_redirect_uris ?? [])
</script>

<template>
  <SaDetailSection :title="t('pages.clientDetail.redirectUris')">
    <!-- A list of one kind of value rather than a record's fields, so it is a table of them, drawn
         without its header row since the section's title already names its one column. It is
         never loading: the record it reads is fetched by the shell. Each is copied on its own, since
         an operator registering the client elsewhere pastes one URI at a time. -->
    <SaTable :loading-label="t('common.loading')" :empty="uris.length === 0">
      <template #rows>
        <tr v-for="uri in uris" :key="uri">
          <SaTableCell primary mono>{{ uri }}</SaTableCell>
          <SaTableActions>
            <SaCopyButton
              :value="uri"
              :label="t('pages.clientDetail.copyRedirectUri', { uri })"
              :copied-label="t('common.copied')"
              :failed-label="t('common.copyFailed')"
            />
          </SaTableActions>
        </tr>
      </template>
      <template #empty>
        <p class="text-sm text-gray-600">{{ t('pages.clientDetail.noRedirectUris') }}</p>
      </template>
    </SaTable>
  </SaDetailSection>
</template>
