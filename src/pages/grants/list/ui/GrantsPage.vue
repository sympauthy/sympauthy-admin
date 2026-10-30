<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { EyeIcon } from '@heroicons/vue/20/solid'
import {
  GrantApi,
  grantStatusColor,
  grantStatusLabel,
  grantTypeLabel,
  type GrantListResource,
  type GrantSummaryResource
} from '@/entities/grant'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import {
  CommonButton,
  CommonTag,
  DocHelpTooltip,
  EmptyValue,
  TableCell,
  TableHeader,
  primaryColoredButton,
  RouteLink
} from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const { t } = useI18n()
const router = useRouter()
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
        :label="t('pages.grants.grantType')"
        field="grant_type"
      />
      <CollectionSortHeader
        fit
        hidden-below="lg"
        :collection="grants"
        :label="t('pages.grants.createdAt')"
        field="created_at"
      />
      <TableHeader fit>{{ t('pages.grants.actions') }}</TableHeader>
    </template>

    <template #rows>
      <tr v-for="grant in grants.items" :key="grant.grant_id">
        <TableCell :label="t('pages.grants.status')" fit>
          <CommonTag :color="grantStatusColor(grant.status)">
            {{ grantStatusLabel(grant.status) }}
          </CommonTag>
        </TableCell>
        <!-- The identifier rather than the person's claims: a grant names its user and nothing
             more, and the search field is what finds one by the address they sign in with. -->
        <TableCell primary truncate mono>
          <RouteLink
            v-if="grant.user_id"
            :to="{ name: 'userDetail', params: { userId: grant.user_id } }"
            class="font-medium text-gray-900"
          >
            {{ grant.user_id }}
          </RouteLink>
          <EmptyValue v-else />
        </TableCell>
        <!-- Plain text rather than a link: a grant may name a client or an audience the
             configuration no longer declares, and a link landing on an error page is worse than
             no link. -->
        <TableCell :label="t('pages.grants.client')" truncate>
          {{ grant.client_id }}
        </TableCell>
        <TableCell :label="t('pages.grants.audience')" truncate hidden-below="sm">
          {{ grant.audience_id }}
        </TableCell>
        <TableCell :label="t('pages.grants.grantType')" fit hidden-below="lg">
          {{ grantTypeLabel(grant.grant_type) }}
        </TableCell>
        <TableCell :label="t('pages.grants.createdAt')" fit hidden-below="lg">
          {{ formatDateTime(grant.created_at) }}
        </TableCell>
        <TableCell fit>
          <CommonButton
            :button-style="primaryColoredButton"
            :label="t('pages.grants.view')"
            :icon="EyeIcon"
            @click="router.push({ name: 'grantDetail', params: { grantId: grant.grant_id } })"
          />
        </TableCell>
      </tr>
    </template>

    <template #empty>
      <p class="max-w-prose text-center text-sm text-gray-600">{{ t('pages.grants.empty') }}</p>
    </template>
  </CollectionPage>
</template>
