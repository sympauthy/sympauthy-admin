<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserDetailStore } from '@/stores/useUserDetailStore'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import UserSummaryPanel from '@/pages/userdetail/UserSummaryPanel.vue'
import UserClaimsPanel from '@/pages/userdetail/UserClaimsPanel.vue'
import UserConsentsPanel from '@/pages/userdetail/UserConsentsPanel.vue'
import LogoutDialog from '@/components/LogoutDialog.vue'
import CommonSpinner from '@/components/CommonSpinner.vue'
import CommonAlert from '@/components/CommonAlert.vue'

const route = useRoute()
const { t } = useI18n()
const store = useUserDetailStore()
const { setLabel } = useBreadcrumb()

const userId = computed(() => route.params.userId as string)
const logoutOpen = ref(false)

onMounted(async () => {
  store.$reset()
  await Promise.all([
    store.fetchUser(userId.value),
    store.fetchClaims(userId.value),
    store.fetchConsents(userId.value),
  ])
  if (store.user) {
    const identifier = store.user.identifier_claims
      ? Object.values(store.user.identifier_claims)[0]
      : undefined
    setLabel(identifier ?? userId.value)
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
      />
      <UserClaimsPanel :user-id="userId" />
      <UserConsentsPanel :user-id="userId" />
    </div>

    <LogoutDialog
      :user-id="userId"
      :open="logoutOpen"
      @close="logoutOpen = false"
    />
  </div>
</template>
