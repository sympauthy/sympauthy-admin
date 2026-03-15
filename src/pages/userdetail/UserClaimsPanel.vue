<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useUserDetailStore } from '@/stores/useUserDetailStore'
import HelpTooltip from '@/components/HelpTooltip.vue'
import PaginatedTable from '@/components/PaginatedTable.vue'
import Tag from '@/components/Tag.vue'

const props = defineProps<{
  userId: string
}>()

const { t } = useI18n()
const store = useUserDetailStore()

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
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
    <PaginatedTable
      :loading="store.claimsLoading"
      :error="store.claimsError"
      :empty="store.claims.length === 0"
      :page="store.claimsPage"
      :total-pages="store.claimsTotalPages"
      @page-change="(page: number) => store.fetchClaims(userId, page)"
    >
      <template #header>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.claim') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {{ t('pages.userDetail.value') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap">
          {{ t('pages.userDetail.claimTags') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap">
          {{ t('pages.userDetail.collectedAt') }}
        </th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap">
          {{ t('pages.userDetail.verifiedAt') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="claim in store.claims" :key="claim.claim_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ claim.claim_id }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
            {{ claim.value ?? '—' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <div class="flex flex-wrap gap-1">
              <Tag v-if="claim.standard" color="blue">
                {{ t('pages.claims.standard') }}
              </Tag>
              <Tag v-else color="gray">
                {{ t('pages.claims.custom') }}
              </Tag>
              <Tag v-if="claim.required" color="yellow">
                {{ t('pages.claims.required') }}
              </Tag>
              <Tag v-if="claim.identifier" color="purple">
                {{ t('pages.claims.identifier') }}
              </Tag>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(claim.collected_at) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(claim.verified_at) }}
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.userDetail.noClaims') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
