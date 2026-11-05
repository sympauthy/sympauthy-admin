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
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTag } from '@sympauthy/design'
import { DocHelpTooltip, RouteLink, TableRecord } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const api = new GrantApi()

const grants = useCollection<GrantSummaryResource, GrantListResource>({
  capabilities: () => api.getGrantCapabilities(),
  page: (params) => api.listGrants(params),
  items: (content) => content.grants
})

onMounted(async () => {
  await grants.fetch()
})
</script>

<template>
  <CollectionPage :collection="grants" :search-placeholder="t('pages.grants.search')">
    <template #header>
      <CollectionSortHeader
        :collection="grants"
        :label="t('pages.grants.grant')"
        field="grant_type"
      />
      <CollectionSortHeader
        fit
        :collection="grants"
        :label="t('pages.grants.status')"
        field="status"
      >
        <template #help>
          <DocHelpTooltip term="terms.grant.status" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader :collection="grants" :label="t('pages.grants.user')" field="user_id">
        <template #help>
          <DocHelpTooltip term="terms.grant.user" />
        </template>
      </CollectionSortHeader>
      <CollectionSortHeader
        :collection="grants"
        :label="t('pages.grants.client')"
        field="client_id"
      />
      <CollectionSortHeader
        hidden-below="sm"
        :collection="grants"
        :label="t('pages.grants.audience')"
        field="audience_id"
      />
      <CollectionSortHeader
        fit
        hidden-below="lg"
        :collection="grants"
        :label="t('pages.grants.createdAt')"
        field="created_at"
      />
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
        <!-- Plain text rather than a link: a grant may name a client or an audience the
             configuration no longer declares, and a link landing on an error page is worse than
             no link. -->
        <SaTableCell :label="t('pages.grants.client')" truncate mono>
          {{ grant.client_id }}
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
