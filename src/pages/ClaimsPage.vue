<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClaimStore } from '@/stores/useClaimStore'
import ListPage from '@/components/ListPage.vue'
import Tag from '@/components/Tag.vue'
import OriginTag from '@/components/OriginTag.vue'
import ClaimTags from '@/components/ClaimTags.vue'

const { t } = useI18n()
const claimStore = useClaimStore()

onMounted(async () => {
  await claimStore.fetchClaims()
})
</script>

<template>
  <ListPage
    :loading="claimStore.loading"
    :error="claimStore.error"
    :empty="claimStore.claims.length === 0"
    :page="claimStore.page"
    :size="claimStore.size"
    :total="claimStore.total"
    :total-pages="claimStore.totalPages"
    @page-change="claimStore.fetchClaims"
    @page-size-change="claimStore.setSize"
  >
    <template #header>
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('pages.claims.status') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.claims.id') }}
      </th>
      <th
        class="w-0 whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {{ t('common.origin.label') }}
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {{ t('pages.claims.tags') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="claim in claimStore.claims" :key="claim.id">
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag v-if="claim.enabled" color="green">
            {{ t('pages.claims.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.claims.disabled') }}
          </Tag>
        </td>
        <td class="px-6 py-4 text-sm font-medium text-gray-900 truncate">
          {{ claim.id }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <OriginTag :origin="claim.origin" />
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.claims.empty') }}</p>
    </template>
  </ListPage>
</template>
