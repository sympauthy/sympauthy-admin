<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserDetailStore } from '@/stores/useUserDetailStore'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import UserClaimsPanel from '@/pages/UserClaimsPanel.vue'
import UserConsentsPanel from '@/pages/UserConsentsPanel.vue'
import CommonSpinner from '@/components/CommonSpinner.vue'
import CommonAlert from '@/components/CommonAlert.vue'

const route = useRoute()
const { t } = useI18n()
const store = useUserDetailStore()
const { setLabel } = useBreadcrumb()

const userId = computed(() => route.params.userId as string)

onMounted(async () => {
  store.$reset()
  await Promise.all([
    store.fetchUser(userId.value),
    store.fetchConsents(userId.value),
  ])
  if (store.user) {
    const identifier = store.user.claims
      ? Object.values(store.user.claims)[0]
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
    <div v-else-if="store.user" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UserClaimsPanel :user="store.user" />
      <UserConsentsPanel :user-id="userId" />
    </div>
  </div>
</template>
