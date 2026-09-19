<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UserApi, type UserListResource, type UserResource } from '@/entities/user'
import { ClaimApi, type ClaimResource } from '@/entities/claim'
import { getErrorMessage, isSuccess, type ErrorApiResponse } from '@/shared/api'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import {
  CommonAlert,
  CommonButton,
  EmptyValue,
  TableCell,
  TableHeader,
  CommonTag,
  dangerColoredButton,
  primaryColoredButton
} from '@/shared/ui'
import { LogoutDialog } from '@/features/logout-user'
import { EyeIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/20/solid'
import { formatDate } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
const api = new UserApi()
const claimApi = new ClaimApi()

// The claims an account is identified by are this table's columns and what `claims=` asks the
// server to embed in each row. They are read rather than taken from the capability document: that
// document says which claims the collection can be *filtered* on, which is every configured one,
// and a column is a different question.
const identifierClaims = ref<ClaimResource[]>([])
const identifierClaimsError = ref<string | null>(null)

/**
 * One request, sized past any plausible number of configured claims, so the columns of a table that
 * draws one per claim are known before its first page is asked for.
 */
const CONFIGURED_CLAIMS_PAGE_SIZE = 100

async function fetchIdentifierClaims(): Promise<void> {
  identifierClaimsError.value = null

  const response = await claimApi.listClaims({ page: 0, size: CONFIGURED_CLAIMS_PAGE_SIZE })

  if (isSuccess(response)) {
    identifierClaims.value = response.content.claims.filter((c) => c.enabled && c.identifier)
  } else {
    identifierClaimsError.value = getErrorMessage(response as ErrorApiResponse)
    identifierClaims.value = []
  }
}

// Which claims each user comes back with. It picks the columns this table draws rather than the
// rows the server keeps, so it is not a criterion and travels beside them.
const selectedClaimIds = ref<string[]>([])

const users = useCollection<UserResource, UserListResource>({
  capabilities: () => api.getUserCapabilities(),
  page: (params) => api.listUsers(params),
  items: (content) => content.users,
  selection: () => ({
    claims: selectedClaimIds.value.length > 0 ? selectedClaimIds.value.join(',') : undefined
  })
})

const logoutUserId = ref<string | null>(null)

onMounted(async () => {
  await fetchIdentifierClaims()
  selectedClaimIds.value = identifierClaims.value.map((c) => c.id)
  await users.fetch()
})
</script>

<template>
  <CollectionPage :collection="users" :search-placeholder="t('pages.users.search')">
    <template v-if="identifierClaimsError" #notice>
      <CommonAlert color="warning">
        {{ t('pages.users.identifierClaimsFailed') }}
      </CommonAlert>
    </template>

    <template #header>
      <CollectionSortHeader
        fit
        :collection="users"
        :label="t('pages.users.status')"
        field="status"
      />
      <CollectionSortHeader
        v-for="claim in identifierClaims"
        :key="claim.id"
        :collection="users"
        :label="claim.id"
        :field="claim.id"
      />
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="users"
        :label="t('pages.users.createdAt')"
        field="created_at"
      />
      <TableHeader fit>{{ t('pages.users.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="user in users.items" :key="user.user_id">
        <TableCell :label="t('pages.users.status')" fit>
          <CommonTag v-if="user.status === 'enabled'" color="green">
            {{ t('pages.users.enabled') }}
          </CommonTag>
          <CommonTag v-else color="red">
            {{ t('pages.users.disabled') }}
          </CommonTag>
        </TableCell>
        <!-- The first identifier is what names the account, so it titles the card rather than
             being another labelled line of it. -->
        <TableCell
          v-for="(claim, index) in identifierClaims"
          :key="claim.id"
          truncate
          :primary="index === 0"
          :label="index === 0 ? undefined : claim.id"
        >
          <span v-if="user.claims?.[claim.id]">{{ user.claims[claim.id] }}</span>
          <EmptyValue v-else />
        </TableCell>
        <TableCell :label="t('pages.users.createdAt')" fit hidden-below="sm">
          {{ formatDate(user.created_at) }}
        </TableCell>
        <TableCell fit>
          <div class="flex gap-2">
            <CommonButton
              :button-style="primaryColoredButton"
              :label="t('pages.users.view')"
              :icon="EyeIcon"
              @click="router.push({ name: 'userDetail', params: { userId: user.user_id } })"
            />
            <CommonButton
              :button-style="dangerColoredButton"
              :label="t('pages.users.logout')"
              :icon="ArrowRightStartOnRectangleIcon"
              @click="logoutUserId = user.user_id"
            />
          </div>
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.users.empty') }}</p>
    </template>
  </CollectionPage>

  <LogoutDialog
    :user-id="logoutUserId"
    :open="logoutUserId !== null"
    @close="logoutUserId = null"
  />
</template>
