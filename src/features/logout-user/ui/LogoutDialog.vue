<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaAlert, SaConfirmDialog, SaRadioGroup, SaSelect } from '@sympauthy/design'
import { GrantApi } from '@/entities/grant'
import { clientChoiceLabel, useClientStore } from '@/entities/client'
import { isSuccess, getErrorMessage } from '@/shared/api'
import { missingScopesHint, useAuthStore } from '@/shared/auth'

interface Props {
  userId: string | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const grantApi = new GrantApi()
const clientStore = useClientStore()
const authStore = useAuthStore()

// Logging the person out of one client means picking it from the clients the configuration declares,
// which is read under a scope of its own; logging them out of every client reads none, so a token
// without it still has that.
const clientPickerHint = computed(() =>
  missingScopesHint(authStore.missingScopes(['admin:config:read']))
)

// A logout narrowed to one client and not yet told which is held back: sent as it stands, it would
// name no client, and the server would read that as every one of them.
const awaitingClient = computed(() => mode.value === 'specific' && !selectedClientId.value)

const mode = ref<'all' | 'specific'>('all')
const modes = computed(() => [
  { value: 'all' as const, label: t('logoutDialog.allClients') },
  {
    value: 'specific' as const,
    label: t('logoutDialog.specificClient'),
    disabledReason: clientPickerHint.value
  }
])
const selectedClientId = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      mode.value = 'all'
      selectedClientId.value = ''
      loading.value = false
      error.value = null
      if (!clientPickerHint.value) {
        clientStore.fetchAllClients()
      }
    }
  }
)

async function onConfirm() {
  if (!props.userId || awaitingClient.value) return

  loading.value = true
  error.value = null

  // A force logout is a revocation of the grants the person holds, narrowed to one client where
  // the operator picked one.
  const response = await grantApi.revokeGrants({
    user_ids: [props.userId],
    client_ids: mode.value === 'specific' ? [selectedClientId.value] : undefined
  })

  if (isSuccess(response)) {
    loading.value = false
    emit('close')
  } else {
    error.value = getErrorMessage(response)
    loading.value = false
  }
}
</script>

<template>
  <SaConfirmDialog
    :open="open"
    :confirm-label="t('logoutDialog.confirm')"
    :cancel-label="t('common.cancel')"
    :loading="loading"
    :error="error"
    :confirm-disabled="awaitingClient"
    @confirm="onConfirm"
    @cancel="$emit('close')"
  >
    <template #title>
      {{ t('logoutDialog.title') }}
    </template>

    <p class="mb-4 text-sm text-gray-600">
      {{ t('logoutDialog.description') }}
    </p>

    <div class="space-y-3">
      <SaRadioGroup v-model="mode" :options="modes" :aria-label="t('logoutDialog.clients')" />

      <SaAlert v-if="mode === 'specific' && clientStore.allClientsError" color="danger">
        {{ clientStore.allClientsError }}
      </SaAlert>

      <SaSelect v-else-if="mode === 'specific'" v-model="selectedClientId">
        <option value="" disabled>
          {{ t('logoutDialog.selectClient') }}
        </option>
        <option
          v-for="client in clientStore.allClients"
          :key="client.client_id"
          :value="client.client_id"
        >
          {{ clientChoiceLabel(client) }}
        </option>
      </SaSelect>
    </div>
  </SaConfirmDialog>
</template>
