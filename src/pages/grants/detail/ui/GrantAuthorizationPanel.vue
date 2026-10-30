<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
  CommonTag,
  DefinitionList,
  DefinitionRow,
  DetailSection,
  DocHelpTooltip,
  EmptyValue,
  RouteLink
} from '@/shared/ui'
import type { GrantDetailResource } from '@/entities/grant'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.grantDetail.authorization')">
    <DefinitionList>
      <DefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.authenticatedAt.label') }}
          <DocHelpTooltip term="pages.grantDetail.authenticatedAt" />
        </template>
        <template v-if="grant.authenticated_at">
          {{ formatDateTime(grant.authenticated_at) }}
        </template>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow mono>
        <template #label>
          {{ t('pages.grantDetail.actorGrant.label') }}
          <DocHelpTooltip term="pages.grantDetail.actorGrant" />
        </template>
        <RouteLink
          v-if="grant.actor_grant_id"
          :to="{ name: 'grantDetail', params: { grantId: grant.actor_grant_id } }"
        >
          {{ grant.actor_grant_id }}
        </RouteLink>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow>
        <template #label>
          {{ t('pages.grantDetail.requestedClaims.label') }}
          <DocHelpTooltip term="pages.grantDetail.requestedClaims" />
        </template>
        <div
          v-if="
            grant.requested_claims &&
            (grant.requested_claims.id_token.length > 0 ||
              grant.requested_claims.userinfo.length > 0)
          "
          class="space-y-1"
        >
          <div v-if="grant.requested_claims.id_token.length > 0" class="flex flex-wrap gap-1">
            <span class="mr-1">{{ t('pages.grantDetail.requestedClaims.idToken') }}</span>
            <CommonTag v-for="claim in grant.requested_claims.id_token" :key="claim" color="gray">
              {{ claim }}
            </CommonTag>
          </div>
          <div v-if="grant.requested_claims.userinfo.length > 0" class="flex flex-wrap gap-1">
            <span class="mr-1">{{ t('pages.grantDetail.requestedClaims.userinfo') }}</span>
            <CommonTag v-for="claim in grant.requested_claims.userinfo" :key="claim" color="gray">
              {{ claim }}
            </CommonTag>
          </div>
        </div>
        <EmptyValue v-else />
      </DefinitionRow>
    </DefinitionList>
  </DetailSection>
</template>
