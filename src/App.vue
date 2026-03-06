<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import CommonSpinner from '@/components/CommonSpinner.vue'

const route = useRoute()
const authStore = useAuthStore()

const showLayout = computed(() => {
  return route.meta.noLayout !== true && authStore.isAuthenticated
})

const showLoading = computed(() => {
  return route.meta.noLayout !== true && !authStore.isAuthenticated && authStore.loading
})

// Redirect to login when the user session is lost (e.g. failed token refresh)
watch(() => authStore.isAuthenticated, (isAuthenticated, wasAuthenticated) => {
  if (wasAuthenticated && !isAuthenticated) {
    authStore.signinRedirect(route.fullPath)
  }
})
</script>

<template>
  <RouterView v-if="route.meta.noLayout" />

  <div v-else-if="showLoading" class="flex min-h-screen items-center justify-center">
    <CommonSpinner class="h-8 w-8 border-4" />
  </div>

  <AdminLayout v-else-if="showLayout">
    <RouterView />
  </AdminLayout>
</template>
