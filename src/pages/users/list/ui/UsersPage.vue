<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UserApi, type UserListResource, type UserResource } from '@/entities/user'
import { ClaimApi, type ClaimResource } from '@/entities/claim'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaAlert, SaEmptyValue, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, DocHelpTooltip, TableRecord } from '@/shared/ui'
import { LogoutDialog } from '@/features/logout-user'
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
    identifierClaimsError.value = getErrorMessage(response)
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

// The first identifier configured names the account, so it is that column's name and the rest keep
// a column each.
const otherIdentifierClaims = computed(() => identifierClaims.value.slice(1))

/** The first identifier the account carries, which is what an account without any is short of. */
function userName(user: UserResource): string {
  const claim = identifierClaims.value.find(({ id }) => user.claims?.[id] != null)
  return claim ? String(user.claims?.[claim.id]) : user.user_id
}

const actions = computed<ActionItem[]>(() => [
  { key: 'view', label: t('pages.users.view') },
  { key: 'copyId', label: t('pages.users.copyId') },
  {
    key: 'showGrants',
    label: t('pages.users.showGrants'),
    requiredScopes: ['admin:grants:read']
  },
  {
    key: 'logout',
    label: t('pages.users.logout'),
    danger: true,
    requiredScopes: ['admin:grants:write']
  }
])

// Copying the ID (#204) and showing the grants (#205) are drawn ahead of what they do.
function onAction(key: string, user: UserResource) {
  if (key === 'view') {
    router.push({ name: 'userDetail', params: { userId: user.user_id } })
  } else if (key === 'logout') {
    logoutUserId.value = user.user_id
  }
}

onMounted(async () => {
  await fetchIdentifierClaims()
  selectedClaimIds.value = identifierClaims.value.map((c) => c.id)
  await users.fetch()
})
</script>

<template>
  <CollectionPage :collection="users" :search-placeholder="t('pages.users.search')">
    <template v-if="identifierClaimsError" #notice>
      <SaAlert color="warning">
        {{ t('pages.users.identifierClaimsFailed') }}
      </SaAlert>
    </template>

    <template #header>
      <CollectionSortHeader
        :collection="users"
        :label="t('pages.users.user')"
        :field="identifierClaims[0]?.id ?? 'user_id'"
      >
        <template #help>
          <DocHelpTooltip term="terms.claim.identifier" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader fit :collection="users" :label="t('pages.users.status')" field="status">
        <template #help>
          <DocHelpTooltip term="terms.user.status" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader
        v-for="claim in otherIdentifierClaims"
        :key="claim.id"
        :collection="users"
        :label="claim.id"
        :field="claim.id"
      >
        <template #help>
          <DocHelpTooltip term="terms.claim.identifier" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader
        fit
        hidden-below="sm"
        :collection="users"
        :label="t('pages.users.createdAt')"
        field="created_at"
      />
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.users.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="user in users.items" :key="user.user_id">
        <SaTableCell primary truncate>
          <TableRecord
            :name="userName(user)"
            :detail="userName(user) === user.user_id ? undefined : user.user_id"
            :to="{ name: 'userDetail', params: { userId: user.user_id } }"
          />
        </SaTableCell>
        <SaTableCell :label="t('pages.users.status')" label-hidden fit>
          <SaTag v-if="user.status === 'enabled'" color="green">
            {{ t('pages.users.enabled') }}
          </SaTag>
          <SaTag v-else color="red">
            {{ t('pages.users.disabled') }}
          </SaTag>
        </SaTableCell>
        <SaTableCell
          v-for="claim in otherIdentifierClaims"
          :key="claim.id"
          truncate
          :label="claim.id"
        >
          <span v-if="user.claims?.[claim.id] != null">{{ user.claims[claim.id] }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.users.createdAt')" fit hidden-below="sm">
          {{ formatDate(user.created_at) }}
        </SaTableCell>
        <SaTableCell actions>
          <ActionsDropdown
            :record="userName(user)"
            :actions="actions"
            @action="onAction($event, user)"
          />
        </SaTableCell>
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
