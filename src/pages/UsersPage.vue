<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { useClaimStore } from '@/stores/useClaimStore'
import PaginatedTable from '@/components/PaginatedTable.vue'
import SortableHeader from '@/components/SortableHeader.vue'
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/24/outline'
import type { ClaimResource } from '@/client/model/ClaimResource'

const { t } = useI18n()
const userStore = useUserStore()
const claimStore = useClaimStore()

const enabledClaims = ref<ClaimResource[]>([])
const showClaimFilters = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | undefined
let claimFilterTimeouts: Record<string, ReturnType<typeof setTimeout>> = {}

function onSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    userStore.setSearch(value)
  }, 300)
}

function onStatusChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  userStore.setStatusFilter(value)
}

function onClaimFilterInput(claimId: string, event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (claimFilterTimeouts[claimId]) clearTimeout(claimFilterTimeouts[claimId])
  claimFilterTimeouts[claimId] = setTimeout(() => {
    userStore.setClaimFilter(claimId, value)
  }, 300)
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
    <h1 class="text-2xl font-bold mb-4">{{ t('pages.users.title') }}</h1>

    <!-- Filter bar -->
    <div class="flex items-center gap-4 mb-4">
      <div class="relative flex-1 max-w-md">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          :placeholder="t('pages.users.search')"
          class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @input="onSearchInput"
        />
      </div>
      <select
        class="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        @change="onStatusChange"
      >
        <option value="">{{ t('pages.users.allStatuses') }}</option>
        <option value="enabled">{{ t('pages.users.enabled') }}</option>
        <option value="disabled">{{ t('pages.users.disabled') }}</option>
      </select>
    </div>

    <!-- Collapsible claim filters -->
    <div v-if="enabledClaims.length > 0" class="mb-4">
      <button
        class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        @click="showClaimFilters = !showClaimFilters"
      >
        <ChevronDownIcon v-if="!showClaimFilters" class="h-4 w-4" />
        <ChevronUpIcon v-else class="h-4 w-4" />
        {{ showClaimFilters ? t('pages.users.hideFilters') : t('pages.users.showFilters') }}
      </button>
      <div v-if="showClaimFilters" class="flex flex-wrap gap-3 mt-2">
        <div v-for="claim in enabledClaims" :key="claim.id" class="flex flex-col">
          <label class="text-xs text-gray-500 mb-1">{{ claim.id }}</label>
          <input
            type="text"
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            @input="onClaimFilterInput(claim.id, $event)"
          />
        </div>
      </div>
    </div>

    <PaginatedTable
      :loading="userStore.loading"
      :error="userStore.error"
      :empty="userStore.users.length === 0"
      :page="userStore.page"
      :total-pages="userStore.totalPages"
      @page-change="userStore.fetchUsers"
    >
      <template #header>
        <SortableHeader
          class="w-[10%]"
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
          class="w-[15%]"
          :label="t('pages.users.createdAt')"
          field="created_at"
          :current-sort="userStore.sortField"
          :current-order="userStore.sortOrder"
          @sort="userStore.toggleSort"
        />
      </template>

      <template #rows>
        <tr v-for="user in userStore.users" :key="user.user_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span
              v-if="user.status === 'enabled'"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
            >
              {{ t('pages.users.enabled') }}
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
            >
              {{ t('pages.users.disabled') }}
            </span>
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
        </tr>
      </template>

      <template #empty>
        <p class="text-gray-600">{{ t('pages.users.empty') }}</p>
      </template>
    </PaginatedTable>
  </div>
</template>
