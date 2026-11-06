<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon } from '@heroicons/vue/20/solid'
import {
  UserApi,
  userClaimValueLabel,
  type UserClaimListResource,
  type UserClaimResource
} from '@/entities/user'
import { ClaimTags } from '@/entities/claim'
import { CollectionPage, useCollection } from '@/features/browse-collection'
import { SaEmptyValue, SaTableCell, SaTableHeader, SaTag } from '@sympauthy/design'
import { formatDate } from '@/shared/lib'

const route = useRoute()
const { t } = useI18n()
const api = new UserApi()

const userId = computed(() => route.params.userId as string)

const claims = useCollection<UserClaimResource, UserClaimListResource>({
  capabilities: () => api.getUserClaimCapabilities(userId.value),
  page: (params) => api.listUserClaims(userId.value, params),
  items: (content) => content.claims,
  key: (claim) => claim.claim_id
})

// The shell above this route nulls the record before re-reading it, which unmounts this tab and
// mounts it again — so this collection is the mount's own, and follows the record without a watcher
// and with nothing to disown.
onMounted(async () => {
  await claims.load()
})
</script>

<template>
  <CollectionPage :collection="claims" :search-placeholder="t('pages.userClaims.search')">
    <template #header>
      <SaTableHeader
        :sorting="claims.sort"
        field="claim_id"
        :filtered-label="claims.filteredLabel('claim_id')"
      >
        {{ t('pages.userClaims.claim') }}
      </SaTableHeader>
      <SaTableHeader
        :sorting="claims.sort"
        field="value"
        :filtered-label="claims.filteredLabel('value')"
      >
        {{ t('pages.userClaims.value') }}
      </SaTableHeader>
      <SaTableHeader
        fit
        :sorting="claims.sort"
        field="collected"
        :filtered-label="claims.filteredLabel('collected')"
      >
        {{ t('pages.userClaims.collectedAt') }}
      </SaTableHeader>
    </template>

    <template #rows>
      <tr v-for="claim in claims.items" :key="claim.claim_id">
        <SaTableCell primary truncate>
          <div class="flex flex-wrap items-center gap-2">
            {{ claim.claim_id }}
            <ClaimTags :identifier="claim.identifier" />
          </div>
        </SaTableCell>
        <!-- The value names itself on a phone, read under the claim it belongs to, and takes that line
             whole so that when it was collected always reads on the next one, however short it is.
             Its verification sits beside it rather than in a column of its own, since it is what
             proves that value. -->
        <SaTableCell
          :label="t('pages.userClaims.value')"
          label-hidden
          truncate
          class="max-sm:basis-full"
        >
          <div
            v-if="claim.value != null"
            class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 sm:flex-nowrap"
          >
            <span class="min-w-0 sm:truncate">{{ userClaimValueLabel(claim) }}</span>
            <!-- On the value's baseline, smaller as it is: the check is centred on its own words, and
                 kept out of the alignment so the mark's baseline is theirs. -->
            <span
              v-if="claim.verified_at"
              class="inline-flex shrink-0 items-baseline gap-1 text-xs font-medium whitespace-nowrap text-tag-green"
            >
              <CheckCircleIcon class="size-3.5 self-center" />
              {{ t('pages.userClaims.verified', { date: formatDate(claim.verified_at) }) }}
            </span>
          </div>
          <span v-else class="inline-flex items-center gap-2">
            <SaEmptyValue />
            <SaTag color="yellow">
              {{
                claim.required
                  ? t('pages.userClaims.requiredNotCollected')
                  : t('pages.userClaims.notCollected')
              }}
            </SaTag>
          </span>
        </SaTableCell>
        <!-- The package ends a phone's first line with a break that the row's gap falls on both sides
             of, so the name stands twice that gap above the value. This line matches it, so the three
             read evenly spaced. -->
        <SaTableCell :label="t('pages.userClaims.collectedAt')" fit class="max-sm:mt-1">
          <span v-if="claim.collected_at">{{ formatDate(claim.collected_at) }}</span>
          <SaEmptyValue v-else />
        </SaTableCell>
      </tr>
    </template>

    <template #empty>
      <p class="text-sm text-gray-600">{{ t('pages.userClaims.empty') }}</p>
    </template>
  </CollectionPage>
</template>
