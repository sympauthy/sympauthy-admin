<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  GrantApi,
  grantStatusColor,
  grantStatusLabel,
  grantTypeLabel,
  type GrantListResource,
  type GrantSummaryResource
} from '@/entities/grant'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { DocHelpTooltip, RouteLink, TableRecord } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const api = new GrantApi()

const grants = useCollection<GrantSummaryResource, GrantListResource>({
  capabilities: () => api.getGrantCapabilities(),
  page: (params) => api.listGrants(params),
  items: (content) => content.grants,
  key: (grant) => grant.grant_id
})

onMounted(async () => {
  await grants.load()
})
</script>

<template>
  <CollectionPage :collection="grants" :search-placeholder="t('pages.grants.search')">
    <template #header>
      <SaTableHeader
        :sorting="grants.sort"
        field="grant_type"
        :filtered-label="grants.filteredLabel('grant_type')"
      >
        {{ t('pages.grants.grant') }}
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
      <SaTableHeader
        :sorting="grants.sort"
        field="user_id"
        :filtered-label="grants.filteredLabel('user_id')"
      >
        {{ t('pages.grants.user') }}
        <template #help>
          <DocHelpTooltip term="terms.grant.user" />
        </template>
      </SaTableHeader>
      <SaTableHeader
        :sorting="grants.sort"
        field="client_id"
        :filtered-label="grants.filteredLabel('client_id')"
      >
        {{ t('pages.grants.client') }}
      </SaTableHeader>
      <SaTableHeader
        hidden-below="sm"
        :sorting="grants.sort"
        field="audience_id"
        :filtered-label="grants.filteredLabel('audience_id')"
      >
        {{ t('pages.grants.audience') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        hidden-below="lg"
        :sorting="grants.sort"
        field="created_at"
        :filtered-label="grants.filteredLabel('created_at')"
      >
        {{ t('pages.grants.createdAt') }}
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="grant in grants.items" :key="grant.grant_id">
        <SaTableCell primary truncate>
          <TableRecord
            :name="grantTypeLabel(grant.grant_type)"
            :detail="grant.grant_id"
            :to="{ name: 'grantDetail', params: { grantId: grant.grant_id } }"
          />
        </SaTableCell>
        <SaTableCell :label="t('pages.grants.status')" label-hidden fit>
          <SaTag :color="grantStatusColor(grant.status)">
            {{ grantStatusLabel(grant.status) }}
          </SaTag>
        </SaTableCell>
        <!-- The identifier rather than the person's claims: a grant names its user and nothing
             more, and the search field is what finds one by the address they sign in with. -->
        <SaTableCell :label="t('pages.grants.user')" truncate mono>
          <RouteLink
            v-if="grant.user_id"
            block
            :to="{ name: 'userDetail', params: { userId: grant.user_id } }"
            class="text-gray-900"
          >
            {{ grant.user_id }}
          </RouteLink>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.grants.client')" truncate mono>
          <RouteLink
            block
            :to="{ name: 'clientDetail', params: { clientId: grant.client_id } }"
            class="text-gray-900"
          >
            {{ grant.client_id }}
          </RouteLink>
        </SaTableCell>
        <SaTableCell :label="t('pages.grants.audience')" truncate mono hidden-below="sm">
          {{ grant.audience_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.grants.createdAt')" fit hidden-below="lg">
          {{ formatDateTime(grant.created_at) }}
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.grants.empty') }}</p>
    </template>
  </CollectionPage>
</template>
