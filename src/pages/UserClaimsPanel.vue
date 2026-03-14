<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Tag from '@/components/Tag.vue'
import HelpTooltip from '@/components/HelpTooltip.vue'
import type { UserResource } from '@/client/model/UserResource'

const props = defineProps<{
  user: UserResource
}>()

const { t } = useI18n()

const claimEntries = computed(() => {
  if (!props.user.claims) return []
  return Object.entries(props.user.claims)
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('pages.userDetail.claims') }}
      <HelpTooltip>
        <i18n-t keypath="pages.userDetail.claimsHelp" tag="p">
          <template #link>
            <a
              :href="t('pages.userDetail.claimsHelpLinkUrl')"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              {{ t('pages.userDetail.claimsHelpLinkText') }}
            </a>
          </template>
        </i18n-t>
      </HelpTooltip>
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full table-fixed divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
              {{ t('pages.userDetail.claim') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('pages.userDetail.value') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ t('pages.userDetail.status') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <Tag v-if="user.status === 'enabled'" color="green">
                {{ t('pages.users.enabled') }}
              </Tag>
              <Tag v-else color="red">
                {{ t('pages.users.disabled') }}
              </Tag>
            </td>
          </tr>
          <tr v-for="[key, value] in claimEntries" :key="key">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ key }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 truncate">
              {{ value }}
            </td>
          </tr>
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ t('pages.userDetail.createdAt') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
