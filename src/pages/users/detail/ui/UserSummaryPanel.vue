<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CommonTag, CopyableValue, DocHelpTooltip, SummaryCard, SummaryField } from '@/shared/ui'
import type { UserDetailResource } from '@/entities/user'
import { formatDate } from '@/shared/lib'

defineProps<{
  user: UserDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SummaryCard>
    <SummaryField mono :label="t('pages.userDetail.userId')">
      <CopyableValue :value="user.user_id" :title="t('pages.userDetail.copyUserId')" />
    </SummaryField>
    <SummaryField :label="t('pages.userDetail.status')">
      <template #help>
        <DocHelpTooltip term="terms.user.status" />
      </template>
      <CommonTag v-if="user.status === 'enabled'" color="green">
        {{ t('pages.users.enabled') }}
      </CommonTag>
      <CommonTag v-else color="red">
        {{ t('pages.users.disabled') }}
      </CommonTag>
    </SummaryField>
    <SummaryField :label="t('pages.userDetail.createdAt')">
      {{ formatDate(user.created_at) }}
    </SummaryField>
  </SummaryCard>
</template>
