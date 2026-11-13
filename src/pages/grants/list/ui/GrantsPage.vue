<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  GrantApi,
  grantIsLive,
  grantName,
  grantScopeCount,
  grantStatusColor,
  grantStatusLabel,
  grantTypeLabel,
  type GrantListResource,
  type GrantSummaryResource
} from '@/entities/grant'
import { clientReferenceName } from '@/entities/client'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { RevokeGrantDialog } from '@/features/revoke-grant'
import { SaTableActions, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import {
  type ActionItem,
  ActionsDropdown,
  DocHelpTooltip,
  RecordLink,
  TableRecord
} from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
const api = new GrantApi()

const grants = useCollection<GrantSummaryResource, GrantListResource>({
  capabilities: () => api.getGrantCapabilities(),
  page: (params) => api.listGrants(params),
  items: (content) => content.grants,
  key: (grant) => grant.grant_id
})

const revokeGrantId = ref<string | null>(null)

// Only a live grant is offered for revoking: the server leaves any other as it is, so the action
// would succeed and change nothing.
function actions(grant: GrantSummaryResource): ActionItem[] {
  return [
    { key: 'view', label: t('pages.grants.view') },
    ...(grantIsLive(grant)
      ? [
          {
            key: 'revoke',
            label: t('revokeGrantDialog.action'),
            danger: true,
            requiredScopes: ['admin:grants:write']
          }
        ]
      : [])
  ]
}

function scopeCount(grant: GrantSummaryResource): string {
  return t('pages.grants.scopeCount', grantScopeCount(grant))
}

function onAction(key: string, grant: GrantSummaryResource) {
  if (key === 'view') {
    router.push({ name: 'grantDetail', params: { grantId: grant.grant_id } })
  } else if (key === 'revoke') {
    revokeGrantId.value = grant.grant_id
  }
}

onMounted(async () => {
  await grants.load()
})
</script>

<template>
  <CollectionPage :collection="grants" :search-placeholder="t('pages.grants.search')">
    <template #header>
      <SaTableHeader
        :sorting="grants.sort"
        field="user"
        :filtered-label="grants.filteredLabel('user')"
      >
        {{ t('pages.grants.grant') }}
        <template #help>
          <DocHelpTooltip term="terms.grant.user" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="grants.sort"
        field="status"
        :filtered-label="grants.filteredLabel('status')"
      >
        {{ t('pages.grants.status') }}
        <template #help>
          <DocHelpTooltip term="terms.grant.status" />
        </template>
      </SaTableHeader>
      <!-- Beside the status rather than after the audience, as the canvas has it from sm:, so a
           phone reads the two on the line it gives the record's state. -->
      <SaTableHeader
        fit
        :sorting="grants.sort"
        field="grant_type"
        :filtered-label="grants.filteredLabel('grant_type')"
      >
        {{ t('pages.grants.grantType') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="grants.sort"
        field="client"
        :filtered-label="grants.filteredLabel('client')"
      >
        {{ t('pages.grants.client') }}
      </SaTableHeader>
      <!-- Audience and creation are dropped between sm: and lg:, where the shrink-wrapped columns
           beside them would leave the grant's name no width; a phone stacks them, and keeps them. -->
      <SaTableHeader
        fit
        class="sm:max-lg:hidden"
        :sorting="grants.sort"
        field="audience_id"
        :filtered-label="grants.filteredLabel('audience_id')"
      >
        {{ t('pages.grants.audience') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        class="sm:max-lg:hidden"
        :sorting="grants.sort"
        field="created_at"
        :filtered-label="grants.filteredLabel('created_at')"
      >
        {{ t('pages.grants.createdAt') }}
      </SaTableHeader>
      <SaTableHeader fit>
        <span class="sr-only">{{ t('pages.grants.actions') }}</span>
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="grant in grants.items" :key="grant.grant_id">
        <SaTableCell primary truncate>
          <!-- The canvas counts the grant's scopes under its name rather than giving its identifier,
               which the record's summary carries to be copied. -->
          <TableRecord
            :name="grantName(grant)"
            :caption="scopeCount(grant)"
            :to="{ name: 'grantDetail', params: { grantId: grant.grant_id } }"
          />
        </SaTableCell>
        <SaTableCell :label="t('pages.grants.status')" label-hidden fit>
          <SaTag :color="grantStatusColor(grant.status)">
            {{ grantStatusLabel(grant.status) }}
          </SaTag>
        </SaTableCell>
        <!-- As small as the labelled values under it on a phone, as the canvas sets the line it shares
             with the status: the package makes only a labelled cell small, so this one would keep the
             body size. A phone shows no caption under the name, so the canvas moves the scope count
             to the end of this line. -->
        <SaTableCell :label="t('pages.grants.grantType')" label-hidden fit class="max-sm:text-xs">
          {{ grantTypeLabel(grant.grant_type)
          }}<span class="sm:hidden"> · {{ scopeCount(grant) }}</span>
        </SaTableCell>
        <!-- A phone reads the client, the audience and the creation each on a line of its own, as
             the canvas lists them, under the line the status and the type share. The package ends
             that phone's first line with a break that the row's gap falls on both sides of, so each
             line after it adds that gap again to read evenly spaced. -->
        <SaTableCell :label="t('pages.grants.client')" fit class="max-sm:mt-1 max-sm:basis-full">
          <RecordLink
            :mono="!grant.client.display_name"
            :name="clientReferenceName(grant.client)"
            :to="{ name: 'clientDetail', params: { clientId: grant.client.id } }"
          />
        </SaTableCell>
        <SaTableCell
          :label="t('pages.grants.audience')"
          fit
          mono
          class="max-sm:mt-1 max-sm:basis-full sm:max-lg:hidden"
        >
          {{ grant.audience_id }}
        </SaTableCell>
        <SaTableCell
          :label="t('pages.grants.createdAt')"
          fit
          class="max-sm:mt-1 max-sm:basis-full sm:max-lg:hidden"
        >
          {{ formatDateTime(grant.created_at) }}
        </SaTableCell>
        <SaTableActions>
          <!-- Named by the grant rather than its person, who holds many. -->
          <ActionsDropdown
            :record="grant.grant_id"
            :actions="actions(grant)"
            @action="onAction($event, grant)"
          />
        </SaTableActions>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.grants.empty') }}</p>
    </template>
  </CollectionPage>

  <RevokeGrantDialog
    :grant-id="revokeGrantId"
    :open="revokeGrantId !== null"
    @revoked="grants.fetch(grants.page)"
    @close="revokeGrantId = null"
  />
</template>
