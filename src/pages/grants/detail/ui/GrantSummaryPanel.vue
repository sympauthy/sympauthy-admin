<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  CommonTag,
  CopyableValue,
  DocHelpTooltip,
  EmptyValue,
  SummaryCard,
  SummaryField,
  RouteLink
} from '@/shared/ui'
import {
  grantStatusColor,
  grantStatusLabel,
  grantTypeLabel,
  type GrantDetailResource
} from '@/entities/grant'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SummaryCard>
    <SummaryField mono :label="t('pages.grantDetail.grantId')">
      <CopyableValue :value="grant.grant_id" :title="t('pages.grantDetail.copyGrantId')" />
    </SummaryField>
    <SummaryField :label="t('pages.grantDetail.status')">
      <template #help>
        <DocHelpTooltip term="terms.grant.status" />
      </template>
      <CommonTag :color="grantStatusColor(grant.status)">
        {{ grantStatusLabel(grant.status) }}
      </CommonTag>
    </SummaryField>
    <SummaryField :label="t('pages.grantDetail.grantType')">
      {{ grantTypeLabel(grant.grant_type) }}
    </SummaryField>
    <SummaryField mono :label="t('pages.grantDetail.user')">
      <template #help>
        <DocHelpTooltip term="terms.grant.user" />
      </template>
      <RouteLink
        v-if="grant.user_id"
        :to="{ name: 'userDetail', params: { userId: grant.user_id } }"
      >
        {{ grant.user_id }}
      </RouteLink>
      <EmptyValue v-else />
    </SummaryField>
    <!-- Plain text rather than links: a grant may name a client or an audience the configuration
         no longer declares. -->
    <SummaryField mono :label="t('pages.grantDetail.client')">
      {{ grant.client_id }}
    </SummaryField>
    <SummaryField mono :label="t('pages.grantDetail.audience')">
      <template #help>
        <DocHelpTooltip term="terms.audience.id" />
      </template>
      {{ grant.audience_id }}
    </SummaryField>
    <SummaryField :label="t('pages.grantDetail.createdAt')">
      {{ formatDateTime(grant.created_at) }}
    </SummaryField>
    <SummaryField :label="t('pages.grantDetail.expiresAt.label')">
      <template #help>
        <DocHelpTooltip term="pages.grantDetail.expiresAt" />
      </template>
      <template v-if="grant.expires_at">{{ formatDateTime(grant.expires_at) }}</template>
      <EmptyValue v-else />
    </SummaryField>
  </SummaryCard>
</template>
