<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ClientApi, type ClientDetailResource } from '@/entities/client'
import { getErrorMessage, isSuccess, type ErrorApiResponse } from '@/shared/api'
import { useBreadcrumb } from '@/shared/lib'
import ClientSummaryPanel from './ClientSummaryPanel.vue'
import ClientScopesPanel from './ClientScopesPanel.vue'
import ClientRedirectUrisPanel from './ClientRedirectUrisPanel.vue'
import ClientAuthorizationPanel from './ClientAuthorizationPanel.vue'
import { CommonAlert, LoadingState } from '@/shared/ui'

const route = useRoute()
const api = new ClientApi()
const { setLabel } = useBreadcrumb()

const clientId = computed(() => route.params.clientId as string)

const client = ref<ClientDetailResource | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true

  const response = await api.getClient(clientId.value)

  if (isSuccess(response)) {
    client.value = response.content
    setLabel(client.value.client_id)
  } else {
    error.value = getErrorMessage(response as ErrorApiResponse)
  }

  loading.value = false
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <LoadingState v-if="loading" />

    <!-- Error state -->
    <CommonAlert v-else-if="error" color="danger">
      {{ error }}
    </CommonAlert>

    <!-- Content -->
    <div v-else-if="client" class="space-y-6">
      <ClientSummaryPanel :client="client" />
      <ClientAuthorizationPanel :client="client" />
      <ClientScopesPanel :client="client" />
      <ClientRedirectUrisPanel :client="client" />
    </div>
  </div>
</template>
