<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/entities/user'
import { ClaimApi, type ClaimResource } from '@/entities/claim'
import {
  CollectionPage,
  CollectionSortHeader,
  Tag,
  CommonButton,
  primaryColoredButton,
  dangerColoredButton
} from '@/shared/ui'
import { LogoutDialog } from '@/features/logout-user'
import { EyeIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/20/solid'
import { isSuccess } from '@/shared/api'
import { formatDate } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const claimApi = new ClaimApi()

// The claims a user is identified by are the columns of this table, and what `claims=` asks the
// server to embed in each row. They are read here rather than taken from the capability document:
// that document says which claims the collection can be *filtered* on, which is every configured
// one, and a column is a different question.
const identifierClaims = ref<ClaimResource[]>([])

// One request, sized past any plausible number of configured claims, so the columns are known
// before the first page of users is asked for.
const CONFIGURED_CLAIMS_PAGE_SIZE = 100

const logoutUserId = ref<string | null>(null)

onMounted(async () => {
  const response = await claimApi.listClaims({ page: 0, size: CONFIGURED_CLAIMS_PAGE_SIZE })
  if (isSuccess(response)) {
    identifierClaims.value = response.content.claims.filter((c) => c.enabled && c.identifier)
  }
  userStore.setSelectedClaimIds(identifierClaims.value.map((c) => c.id))
  await userStore.users.fetch()
})
</script>

<template>
  <CollectionPage :collection="userStore.users" :search-placeholder="t('pages.users.search')">
    <template #header>
      <CollectionSortHeader
        class="w-0 whitespace-nowrap"
        :collection="userStore.users"
        :label="t('pages.users.status')"
        field="status"
      />
      <CollectionSortHeader
        v-for="claim in identifierClaims"
        :key="claim.id"
        :collection="userStore.users"
        :label="claim.id"
        :field="claim.id"
      />
      <CollectionSortHeader
        class="w-0 whitespace-nowrap hidden sm:table-cell"
        :collection="userStore.users"
        :label="t('pages.users.createdAt')"
        field="created_at"
      />
      <th
        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-0 whitespace-nowrap"
      >
        {{ t('pages.users.actions') }}
      </th>
    </template>

    <template #rows>
      <tr v-for="user in userStore.users.items" :key="user.user_id">
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <Tag v-if="user.status === 'enabled'" color="green">
            {{ t('pages.users.enabled') }}
          </Tag>
          <Tag v-else color="red">
            {{ t('pages.users.disabled') }}
          </Tag>
        </td>
        <td
          v-for="claim in identifierClaims"
          :key="claim.id"
          class="px-6 py-4 text-sm text-gray-500 truncate"
        >
          {{ user.claims?.[claim.id] ?? '' }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
          {{ formatDate(user.created_at) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <div class="flex gap-2">
            <CommonButton
              :button-style="primaryColoredButton"
              @click="router.push({ name: 'userDetail', params: { userId: user.user_id } })"
            >
              <span class="inline-flex items-center gap-1.5">
                <EyeIcon class="size-4 shrink-0" />
                <span class="hidden sm:inline">{{ t('pages.users.view') }}</span>
              </span>
            </CommonButton>
            <CommonButton :button-style="dangerColoredButton" @click="logoutUserId = user.user_id">
              <span class="inline-flex items-center gap-1.5">
                <ArrowRightStartOnRectangleIcon class="size-4 shrink-0" />
                <span class="hidden sm:inline">{{ t('pages.users.logout') }}</span>
              </span>
            </CommonButton>
          </div>
        </td>
      </tr>
    </template>

    <template #empty>
      <p class="text-gray-600">{{ t('pages.users.empty') }}</p>
    </template>
  </CollectionPage>

  <LogoutDialog
    :user-id="logoutUserId"
    :open="logoutUserId !== null"
    @close="logoutUserId = null"
  />
</template>
