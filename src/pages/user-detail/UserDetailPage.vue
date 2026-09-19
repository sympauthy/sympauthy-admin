<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserDetailStore } from '@/entities/user/model/useUserDetailStore'
import { useUserConsentStore } from '@/entities/consent/model/useUserConsentStore'
import { useUserMfaStore } from '@/entities/user/model/useUserMfaStore'
import { useUserProviderLinkStore } from '@/entities/user/model/useUserProviderLinkStore'
import { useBreadcrumb } from '@/shared/lib/useBreadcrumb'
import UserSummaryPanel from '@/pages/user-detail/UserSummaryPanel.vue'
import UserClaimsPanel from '@/pages/user-detail/UserClaimsPanel.vue'
import UserConsentsPanel from '@/pages/user-detail/UserConsentsPanel.vue'
import UserMfaPanel from '@/pages/user-detail/UserMfaPanel.vue'
import UserProvidersPanel from '@/pages/user-detail/UserProvidersPanel.vue'
import LogoutDialog from '@/features/logout-user/LogoutDialog.vue'
import EnrollMfaDialog from '@/features/enroll-mfa/EnrollMfaDialog.vue'
import LinkProviderDialog from '@/features/link-provider/LinkProviderDialog.vue'
import CommonSpinner from '@/shared/ui/CommonSpinner.vue'
import CommonAlert from '@/shared/ui/CommonAlert.vue'

const route = useRoute()
const { t } = useI18n()
const store = useUserDetailStore()
const consentStore = useUserConsentStore()
const mfaStore = useUserMfaStore()
const providerLinkStore = useUserProviderLinkStore()
const { setLabel } = useBreadcrumb()

const userId = computed(() => route.params.userId as string)
const logoutOpen = ref(false)
const enrollMfaOpen = ref(false)
const linkProviderOpen = ref(false)

onMounted(async () => {
  store.$reset()
  consentStore.$reset()
  mfaStore.$reset()
  providerLinkStore.$reset()
  await Promise.all([
    store.fetchUser(userId.value),
    store.fetchClaims(userId.value),
    consentStore.fetchConsents(userId.value),
    mfaStore.fetchMfaMethods(userId.value),
    providerLinkStore.fetchProviderLinks(userId.value)
  ])
  if (store.user) {
    const identifier = store.user.identifier_claims
      ? Object.values(store.user.identifier_claims)[0]
      : undefined
    setLabel(identifier != null ? String(identifier) : userId.value)
  }
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="store.loading" class="flex items-center gap-2">
      <CommonSpinner class="h-6 w-6 border-4" />
      <span class="text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Error state -->
    <CommonAlert v-else-if="store.error" color="danger">
      {{ store.error }}
    </CommonAlert>

    <!-- Content -->
    <div v-else-if="store.user" class="space-y-6">
      <UserSummaryPanel
        :user="store.user"
        @logout="logoutOpen = true"
        @enroll-mfa="enrollMfaOpen = true"
        @link-provider="linkProviderOpen = true"
      />
      <UserClaimsPanel :user-id="userId" />
      <UserConsentsPanel :user-id="userId" />
      <UserMfaPanel :user-id="userId" />
      <UserProvidersPanel :user-id="userId" />
    </div>

    <LogoutDialog :user-id="userId" :open="logoutOpen" @close="logoutOpen = false" />
    <EnrollMfaDialog :user-id="userId" :open="enrollMfaOpen" @close="enrollMfaOpen = false" />
    <LinkProviderDialog
      :user-id="userId"
      :open="linkProviderOpen"
      @close="linkProviderOpen = false"
    />
  </div>
</template>
