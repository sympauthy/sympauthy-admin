<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { TooltipProvider } from 'reka-ui'
import AdminLayout from './layout/AdminLayout.vue'
import { useAuthStore } from '@/shared/auth'
import { CommonSpinner } from '@/shared/ui'

const route = useRoute()
const authStore = useAuthStore()

const showLayout = computed(() => {
  return route.meta.noLayout !== true && authStore.isAuthenticated
})

const showLoading = computed(() => {
  return route.meta.noLayout !== true && !authStore.isAuthenticated && authStore.loading
})

// Redirect to login when the user session is lost (e.g. failed token refresh)
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated, wasAuthenticated) => {
    if (wasAuthenticated && !isAuthenticated) {
      authStore.signinRedirect(route.fullPath)
    }
  }
)
</script>

<template>
  <!-- One provider for every hint, so moving the pointer from one to the next skips the delay the
       first one waited. -->
  <TooltipProvider :delay-duration="150">
    <RouterView v-if="route.meta.noLayout" />

    <div v-else-if="showLoading" class="flex min-h-screen items-center justify-center">
      <CommonSpinner size="lg" />
    </div>

    <AdminLayout v-else-if="showLayout">
      <RouterView />
    </AdminLayout>
  </TooltipProvider>
</template>
