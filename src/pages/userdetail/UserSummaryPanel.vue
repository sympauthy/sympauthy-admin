<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Tag from '@/components/Tag.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import ActionsDropdown, { type ActionItem } from '@/components/ActionsDropdown.vue'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/20/solid'
import type { UserDetailResource } from '@/client/model/UserDetailResource'

defineProps<{
  user: UserDetailResource
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()

const actions = computed<ActionItem[]>(() => [
  {
    key: 'logout',
    label: t('pages.userDetail.forceLogout'),
    icon: ArrowRightStartOnRectangleIcon,
    danger: true,
  },
])

function onAction(key: string) {
  if (key === 'logout') {
    emit('logout')
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-start justify-between gap-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 min-w-0">
        <div class="min-w-0">
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.userDetail.userId') }}
          </dt>
          <dd class="mt-1 flex items-center gap-1.5 min-w-0">
            <span class="text-sm text-gray-900 font-mono truncate">
              {{ user.user_id }}
            </span>
            <CopyToClipboard
              :value="user.user_id"
              :title="t('pages.userDetail.copyUserId')"
            />
          </dd>
        </div>
        <div>
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.userDetail.status') }}
          </dt>
          <dd class="mt-1">
            <Tag v-if="user.status === 'enabled'" color="green">
              {{ t('pages.users.enabled') }}
            </Tag>
            <Tag v-else color="red">
              {{ t('pages.users.disabled') }}
            </Tag>
          </dd>
        </div>
        <div>
          <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ t('pages.userDetail.createdAt') }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900">
            {{ formatDate(user.created_at) }}
          </dd>
        </div>
      </div>
      <ActionsDropdown
        :actions="actions"
        @action="onAction"
      />
    </div>
  </div>
</template>
