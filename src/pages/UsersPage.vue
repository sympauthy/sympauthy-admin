<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'
import { useClaimStore } from '@/stores/useClaimStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import Tag from '@/components/Tag.vue'
import CommonButton from '@/components/CommonButton.vue'
import { EyeIcon } from '@heroicons/vue/20/solid'
import { primaryColoredButton } from '@/styles/ButtonStyle'
import type { FilterConfig } from '@/components/FilterBar.vue'
import type { ClaimResource } from '@/client/model/ClaimResource'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const claimStore = useClaimStore()

const enabledClaims = ref<ClaimResource[]>([])

const filters = computed<FilterConfig[]>(() => [
  {
    key: 'status',
    label: t('pages.users.statusFilter'),
    type: 'select',
    options: [
      { label: t('pages.users.allStatuses'), value: '' },
      { label: t('pages.users.enabled'), value: 'enabled' },
      { label: t('pages.users.disabled'), value: 'disabled' },
    ],
  },
  ...enabledClaims.value.map((claim) => ({
    key: claim.id,
    label: claim.id,
    type: 'text' as const,
  })),
])

function onFilterChange(key: string, value: string) {
  if (key === 'status') {
    userStore.setStatusFilter(value)
  } else {
    userStore.setClaimFilter(key, value)
  }
}

function onFilterRemove(key: string) {
  if (key === 'status') {
    userStore.clearStatusFilter()
  } else {
    userStore.clearClaimFilter(key)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

onMounted(async () => {
  await claimStore.fetchClaims()
  enabledClaims.value = claimStore.claims.filter((c) => c.enabled)
  userStore.setSelectedClaimIds(enabledClaims.value.map((c) => c.id))
  await userStore.fetchUsers()
})
</script>

<template>
  <div>
    <FilterBar
      :search-placeholder="t('pages.users.search')"
      :filters="filters"
      @search="userStore.setSearch"
      @filter-change="onFilterChange"
      @filter-remove="onFilterRemove"
    />

    <PaginatedTable
      :loading="userStore.loading"
      :error="userStore.error"
      :empty="userStore.users.length === 0"
      :page="userStore.page"
      :total-pages="userStore.totalPages"
      table-layout="auto"
      @page-change="userStore.fetchUsers"
    >
      <template #header>
        <SortableHeader
          class="w-0 whitespace-nowrap"
          :label="t('pages.users.status')"
          field="status"
          :current-sort="userStore.sortField"
          :current-order="userStore.sortOrder"
          @sort="userStore.toggleSort"
        />
        <SortableHeader
          v-for="claim in enabledClaims"
          :key="claim.id"
          :label="claim.id"
          :field="claim.id"
          :current-sort="userStore.sortField"
          :current-order="userStore.sortOrder"
          @sort="userStore.toggleSort"
        />
        <SortableHeader
          class="w-0 whitespace-nowrap"
          :label="t('pages.users.createdAt')"
          field="created_at"
          :current-sort="userStore.sortField"
          :current-order="userStore.sortOrder"
          @sort="userStore.toggleSort"
        />
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap">
          {{ t('pages.users.actions') }}
        </th>
      </template>

      <template #rows>
        <tr v-for="user in userStore.users" :key="user.user_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <Tag v-if="user.status === 'enabled'" color="green">
              {{ t('pages.users.enabled') }}
            </Tag>
            <Tag v-else color="red">
              {{ t('pages.users.disabled') }}
            </Tag>
          </td>
          <td
            v-for="claim in enabledClaims"
            :key="claim.id"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
          >
            {{ user.claims?.[claim.id] ?? '' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(user.created_at) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <CommonButton
              :button-style="primaryColoredButton"
              @click="router.push({ name: 'userDetail', params: { userId: user.user_id } })"
            >
              <span class="inline-flex items-center gap-1.5">
                <EyeIcon class="size-4 shrink-0" />
                {{ t('pages.users.view') }}
              </span>
            </CommonButton>
          </td>
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.users.empty') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
