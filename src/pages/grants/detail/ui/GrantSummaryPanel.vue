<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  SaCopyableValue,
  SaEmptyValue,
  SaSummaryCard,
  SaSummaryField,
  SaTag
} from '@sympauthy/design'
import { DocHelpTooltip, RecordLink } from '@/shared/ui'
import {
  grantStatusColor,
  grantStatusLabel,
  grantTypeLabel,
  type GrantDetailResource
} from '@/entities/grant'
import { clientReferenceName } from '@/entities/client'
import { userIdentifierLabel } from '@/entities/user'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <!-- A line per question, three fields across from sm:: which grant it is and where it stands, who
       and what it was opened for, and when. -->
  <SaSummaryCard>
    <SaSummaryField mono :label="t('pages.grantDetail.grantId')">
      <SaCopyableValue
        :value="grant.grant_id"
        :label="t('pages.grantDetail.copyGrantId')"
        :copied-label="t('common.copied')"
        :failed-label="t('common.copyFailed')"
      />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.grantDetail.status')">
      <template #help>
        <DocHelpTooltip term="terms.grant.status" />
      </template>
      <SaTag :color="grantStatusColor(grant.status)">
        {{ grantStatusLabel(grant.status) }}
      </SaTag>
    </SaSummaryField>
    <SaSummaryField :label="t('pages.grantDetail.grantType')">
      {{ grantTypeLabel(grant.grant_type) }}
    </SaSummaryField>
    <SaSummaryField :label="t('pages.grantDetail.user')">
      <template #help>
        <DocHelpTooltip term="terms.grant.user" />
      </template>
      <RecordLink
        v-if="grant.user"
        truncate
        :name="userIdentifierLabel(grant.user)"
        :to="{ name: 'userDetail', params: { userId: grant.user.user_id } }"
      />
      <SaEmptyValue v-else />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.grantDetail.client')">
      <RecordLink
        truncate
        :mono="!grant.client.display_name"
        :name="clientReferenceName(grant.client)"
        :to="{ name: 'clientDetail', params: { clientId: grant.client.id } }"
      />
      <!-- The identifier under the name, as it is written in the configuration and searched by. -->
      <span
        v-if="grant.client.display_name"
        class="block truncate font-mono text-xs text-gray-500"
        :title="grant.client.id"
      >
        {{ grant.client.id }}
      </span>
    </SaSummaryField>
    <!-- An audience has no screen, so it stays plain text, cut by the field itself. -->
    <SaSummaryField mono :label="t('pages.grantDetail.audience')">
      <template #help>
        <DocHelpTooltip term="terms.audience.id" />
      </template>
      <span :title="grant.audience_id">{{ grant.audience_id }}</span>
    </SaSummaryField>
    <SaSummaryField :label="t('pages.grantDetail.createdAt')">
      {{ formatDateTime(grant.created_at) }}
    </SaSummaryField>
    <SaSummaryField :label="t('pages.grantDetail.expiresAt.label')">
      <template #help>
        <DocHelpTooltip term="pages.grantDetail.expiresAt" />
      </template>
      <template v-if="grant.expires_at">{{ formatDateTime(grant.expires_at) }}</template>
      <SaEmptyValue v-else />
    </SaSummaryField>
  </SaSummaryCard>
</template>
