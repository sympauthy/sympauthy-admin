<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useClientDetailStore } from '@/entities/client'
import { useBreadcrumb } from '@/shared/lib'
import ClientSummaryPanel from './ClientSummaryPanel.vue'
import ClientScopesPanel from './ClientScopesPanel.vue'
import ClientRedirectUrisPanel from './ClientRedirectUrisPanel.vue'
import ClientAuthorizationPanel from './ClientAuthorizationPanel.vue'
import { CommonSpinner, CommonAlert } from '@/shared/ui'

const route = useRoute()
const { t } = useI18n()
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
    <div v-if="store.loading" class="flex items-center gap-2">
      <CommonSpinner class="h-6 w-6 border-4" />
      <span class="text-gray-600">{{ t('common.loading') }}</span>
    </div>

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
