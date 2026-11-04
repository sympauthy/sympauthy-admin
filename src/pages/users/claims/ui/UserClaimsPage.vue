<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  UserApi,
  userClaimValueLabel,
  type UserClaimListResource,
  type UserClaimResource
} from '@/entities/user'
import { ClaimTags } from '@/entities/claim'
import { CollectionPage, CollectionSortHeader, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader } from '@sympauthy/design'
import { OriginTag } from '@/shared/ui'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const api = new UserApi()

const userId = computed(() => route.params.userId as string)

const claims = useCollection<UserClaimResource, UserClaimListResource>({
  capabilities: () => api.getUserClaimCapabilities(userId.value),
  page: (params) => api.listUserClaims(userId.value, params),
  items: (content) => content.claims
})

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await claims.fetch()
})
</script>

<template>
  <CollectionPage :collection="claims" :search-placeholder="t('pages.userClaims.search')">
    <template #header>
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('pages.userClaims.claim')"
        field="claim_id"
      />
      <CollectionSortHeader
        :collection="claims"
        :label="t('pages.userClaims.value')"
        field="value"
      />
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('terms.origin.label')"
        field="origin"
      />
      <SaTableHeader fit>{{ t('pages.userClaims.tags') }}</SaTableHeader>
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('pages.userClaims.collectedAt')"
        field="collected"
      />
      <CollectionSortHeader
        fit
        :collection="claims"
        :label="t('pages.userClaims.verifiedAt')"
        field="verified"
      />
    </template>

    <template #rows>
      <tr v-for="claim in claims.items" :key="claim.claim_id">
        <SaTableCell primary fit>
          {{ claim.claim_id }}
        </SaTableCell>
        <SaTableCell :label="t('pages.userClaims.value')" truncate>
          <span v-if="claim.value != null">{{ userClaimValueLabel(claim) }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('terms.origin.label')" fit>
          <OriginTag :origin="claim.origin" />
        </SaTableCell>
        <SaTableCell :label="t('pages.userClaims.tags')" fit>
          <ClaimTags :required="claim.required" :identifier="claim.identifier" />
        </SaTableCell>
        <SaTableCell :label="t('pages.userClaims.collectedAt')" fit>
          <span v-if="claim.collected_at">{{ formatDate(claim.collected_at) }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
        <SaTableCell :label="t('pages.userClaims.verifiedAt')" fit>
          <span v-if="claim.verified_at">{{ formatDate(claim.verified_at) }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userClaims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
