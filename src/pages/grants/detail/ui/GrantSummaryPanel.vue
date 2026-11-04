<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  DocHelpTooltip,
  RouteLink,
  SaCopyableValue,
  SaEmptyValue,
  SaSummaryCard,
  SaSummaryField,
  SaTag
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
    <SaSummaryField mono :label="t('pages.grantDetail.user')">
      <template #help>
        <DocHelpTooltip term="terms.grant.user" />
      </template>
      <RouteLink
        v-if="grant.user_id"
        block
        :to="{ name: 'userDetail', params: { userId: grant.user_id } }"
      >
        {{ grant.user_id }}
      </RouteLink>
      <SaEmptyValue v-else />
    </SaSummaryField>
    <!-- Plain text rather than links: a grant may name a client or an audience the configuration
         no longer declares. -->
    <SaSummaryField mono :label="t('pages.grantDetail.client')">
      {{ grant.client_id }}
    </SaSummaryField>
    <SaSummaryField mono :label="t('pages.grantDetail.audience')">
      <template #help>
        <DocHelpTooltip term="terms.audience.id" />
      </template>
      {{ grant.audience_id }}
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
