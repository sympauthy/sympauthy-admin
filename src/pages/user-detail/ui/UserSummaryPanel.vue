<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ActionsDropdown,
  CopyableValue,
  SummaryCard,
  SummaryField,
  Tag,
  type ActionItem
} from '@/shared/ui'
import { ArrowRightStartOnRectangleIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/vue/20/solid'
import type { UserDetailResource } from '@/entities/user'
import { formatDate } from '@/shared/lib'

defineProps<{
  user: UserDetailResource
}>()

const emit = defineEmits<{
  logout: []
  enrollMfa: []
  linkProvider: []
}>()

const { t } = useI18n()

const actions = computed<ActionItem[]>(() => [
  {
    key: 'enrollMfa',
    label: t('pages.userDetail.enrollMfa'),
    icon: ShieldCheckIcon
  },
  {
    key: 'linkProvider',
    label: t('pages.userDetail.linkProvider'),
    icon: LinkIcon
  },
  {
    key: 'logout',
    label: t('pages.userDetail.forceLogout'),
    icon: ArrowRightStartOnRectangleIcon,
    danger: true
  }
])

function onAction(key: string) {
  if (key === 'enrollMfa') {
    emit('enrollMfa')
  } else if (key === 'linkProvider') {
    emit('linkProvider')
  } else if (key === 'logout') {
    emit('logout')
  }
}
</script>

<template>
  <SummaryCard>
    <SummaryField mono :label="t('pages.userDetail.userId')">
      <CopyableValue :value="user.user_id" :title="t('pages.userDetail.copyUserId')" />
    </SummaryField>
    <SummaryField :label="t('pages.userDetail.status')">
      <Tag v-if="user.status === 'enabled'" color="green">
        {{ t('pages.users.enabled') }}
      </Tag>
      <Tag v-else color="red">
        {{ t('pages.users.disabled') }}
      </Tag>
    </SummaryField>
    <SummaryField :label="t('pages.userDetail.createdAt')">
      {{ formatDate(user.created_at) }}
    </SummaryField>

    <template #actions>
      <ActionsDropdown :actions="actions" @action="onAction" />
    </template>
  </SummaryCard>
</template>
