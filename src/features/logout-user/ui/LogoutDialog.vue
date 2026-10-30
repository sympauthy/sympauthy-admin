<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CommonAlert, ConfirmDialog, FormSelect } from '@/shared/ui'
import { GrantApi } from '@/entities/grant'
import { useClientStore } from '@/entities/client'
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
  <ConfirmDialog
    :open="open"
    :confirm-label="t('logoutDialog.confirm')"
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
      <label class="flex cursor-pointer items-center gap-2">
        <input v-model="mode" type="radio" value="all" class="text-primary focus:ring-primary" />
        <span class="text-sm text-gray-700">{{ t('logoutDialog.allClients') }}</span>
      </label>

      <label
        class="flex items-start gap-2"
        :class="clientPickerHint ? 'cursor-not-allowed' : 'cursor-pointer'"
      >
        <input
          v-model="mode"
          type="radio"
          value="specific"
          :disabled="clientPickerHint !== undefined"
          class="mt-0.5 text-primary focus:ring-primary"
        />
        <span
          class="flex flex-col text-sm"
          :class="clientPickerHint ? 'text-gray-400' : 'text-gray-700'"
        >
          {{ t('logoutDialog.specificClient') }}
          <span v-if="clientPickerHint" class="text-xs">{{ clientPickerHint }}</span>
        </span>
      </label>

      <CommonAlert v-if="mode === 'specific' && clientStore.allClientsError" color="danger">
        {{ clientStore.allClientsError }}
      </CommonAlert>

      <FormSelect v-else-if="mode === 'specific'" v-model="selectedClientId">
        <option value="" disabled>
          {{ t('logoutDialog.selectClient') }}
        </option>
        <option
          v-for="client in clientStore.allClients"
          :key="client.client_id"
          :value="client.client_id"
        >
          {{ client.client_id }}
        </option>
      </FormSelect>
    </div>
  </ConfirmDialog>
</template>
