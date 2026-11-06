<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  SaCopyableValue,
  SaEmptyValue,
  SaSummaryCard,
  SaSummaryField,
  SaTag
} from '@sympauthy/design'
import { DocHelpTooltip } from '@/shared/ui'
import type { UserDetailResource } from '@/entities/user'
import { formatDate, formatDateTime } from '@/shared/lib'

defineProps<{
  user: UserDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SaSummaryCard>
    <SaSummaryField mono :label="t('pages.userDetail.userId')">
      <SaCopyableValue
        :value="user.user_id"
        :label="t('pages.userDetail.copyUserId')"
        :copied-label="t('common.copied')"
        :failed-label="t('common.copyFailed')"
      />
    </SaSummaryField>
    <SaSummaryField :label="t('pages.userDetail.status')">
      <template #help>
        <DocHelpTooltip term="terms.user.status" />
      </template>
      <SaTag v-if="user.status === 'enabled'" color="green">
        {{ t('pages.users.enabled') }}
      </SaTag>
      <SaTag v-else color="red">
        {{ t('pages.users.disabled') }}
      </SaTag>
    </SaSummaryField>
    <SaSummaryField :label="t('pages.userDetail.createdAt')">
      {{ formatDate(user.created_at) }}
    </SaSummaryField>
    <SaSummaryField :label="t('pages.userDetail.lastAuthenticatedAt')">
      <template v-if="user.last_authenticated_at">
        {{ formatDateTime(user.last_authenticated_at) }}
      </template>
      <SaEmptyValue v-else />
    </SaSummaryField>
  </SaSummaryCard>
</template>
