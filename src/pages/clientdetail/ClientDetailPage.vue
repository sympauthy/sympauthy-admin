<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useClientDetailStore } from '@/stores/useClientDetailStore'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import ClientSummaryPanel from '@/pages/clientdetail/ClientSummaryPanel.vue'
import ClientScopesPanel from '@/pages/clientdetail/ClientScopesPanel.vue'
import ClientRedirectUrisPanel from '@/pages/clientdetail/ClientRedirectUrisPanel.vue'
import ClientAuthorizationPanel from '@/pages/clientdetail/ClientAuthorizationPanel.vue'
import CommonSpinner from '@/components/CommonSpinner.vue'
import CommonAlert from '@/components/CommonAlert.vue'

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
      <ClientScopesPanel :client="store.client" />
      <ClientRedirectUrisPanel :client="store.client" />
      <ClientAuthorizationPanel
        v-if="store.client.authorization_flow_id || store.client.authorization_webhook"
        :client="store.client"
      />
    </div>
  </div>
</template>
