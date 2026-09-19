<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useClientDetailStore } from '@/entities/client'
import { useBreadcrumb } from '@/shared/lib'
import ClientSummaryPanel from './ClientSummaryPanel.vue'
import ClientScopesPanel from './ClientScopesPanel.vue'
import ClientRedirectUrisPanel from './ClientRedirectUrisPanel.vue'
import ClientAuthorizationPanel from './ClientAuthorizationPanel.vue'
import { CommonAlert, LoadingState } from '@/shared/ui'

const route = useRoute()
const store = useClientDetailStore()
const { setLabel } = useBreadcrumb()

const clientId = computed(() => route.params.clientId as string)

onMounted(async () => {
  store.$reset()
  await store.fetchClient(clientId.value)
  if (store.client) {
    setLabel(store.client.client_id)
  }
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <LoadingState v-if="store.loading" />

    <!-- Error state -->
    <CommonAlert v-else-if="store.error" color="danger">
      {{ store.error }}
    </CommonAlert>

    <!-- Content -->
    <div v-else-if="store.client" class="space-y-6">
      <ClientSummaryPanel :client="store.client" />
      <ClientAuthorizationPanel :client="store.client" />
      <ClientScopesPanel :client="store.client" />
      <ClientRedirectUrisPanel :client="store.client" />
    </div>
  </div>
</template>
