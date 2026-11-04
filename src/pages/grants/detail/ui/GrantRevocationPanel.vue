<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { RouteLink, SaDefinitionList, SaDefinitionRow, SaDetailSection } from '@/shared/ui'
import { grantRevokedByLabel, type GrantDetailResource } from '@/entities/grant'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <SaDetailSection :title="t('pages.grantDetail.revocation')">
    <SaDefinitionList>
      <SaDefinitionRow v-if="grant.revoked_at" :label="t('pages.grantDetail.revokedAt')">
        {{ formatDateTime(grant.revoked_at) }}
      </SaDefinitionRow>
      <SaDefinitionRow v-if="grant.revoked_by" :label="t('pages.grantDetail.revokedBy')">
        {{ grantRevokedByLabel(grant.revoked_by) }}
      </SaDefinitionRow>
      <SaDefinitionRow
        v-if="grant.revoked_by_user_id"
        mono
        :label="t('pages.grantDetail.revokedByUser')"
      >
        <RouteLink :to="{ name: 'userDetail', params: { userId: grant.revoked_by_user_id } }">
          {{ grant.revoked_by_user_id }}
        </RouteLink>
      </SaDefinitionRow>
    </SaDefinitionList>
  </SaDetailSection>
</template>
