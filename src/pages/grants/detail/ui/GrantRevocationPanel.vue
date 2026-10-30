<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DefinitionList, DefinitionRow, DetailSection } from '@/shared/ui'
import { grantRevokedByLabel, type GrantDetailResource } from '@/entities/grant'
import { formatDateTime } from '@/shared/lib'

defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()
</script>

<template>
  <DetailSection :title="t('pages.grantDetail.revocation')">
    <DefinitionList>
      <DefinitionRow v-if="grant.revoked_at" :label="t('pages.grantDetail.revokedAt')">
        {{ formatDateTime(grant.revoked_at) }}
      </DefinitionRow>
      <DefinitionRow v-if="grant.revoked_by" :label="t('pages.grantDetail.revokedBy')">
        {{ grantRevokedByLabel(grant.revoked_by) }}
      </DefinitionRow>
      <DefinitionRow
        v-if="grant.revoked_by_user_id"
        mono
        :label="t('pages.grantDetail.revokedByUser')"
      >
        <router-link
          :to="{ name: 'userDetail', params: { userId: grant.revoked_by_user_id } }"
          class="hover:underline"
        >
          {{ grant.revoked_by_user_id }}
        </router-link>
      </DefinitionRow>
    </DefinitionList>
  </DetailSection>
</template>
