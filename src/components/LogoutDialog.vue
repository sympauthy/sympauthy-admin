<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { UserApi } from '@/client/api/UserApi'
import { useClientStore } from '@/stores/useClientStore'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

interface Props {
  userId: string | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const userApi = new UserApi()
const clientStore = useClientStore()

const mode = ref<'all' | 'specific'>('all')
const selectedClientId = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    mode.value = 'all'
    selectedClientId.value = ''
    loading.value = false
    error.value = null
    clientStore.fetchClients()
  }
})

async function onConfirm() {
  if (!props.userId) return

  loading.value = true
  error.value = null

  const response = mode.value === 'specific' && selectedClientId.value
    ? await userApi.logoutUserClient(props.userId, selectedClientId.value)
    : await userApi.logoutUser(props.userId)

  if (isSuccess(response)) {
    loading.value = false
    emit('close')
  } else {
    error.value = getErrorMessage(response as ErrorApiResponse)
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
    @confirm="onConfirm"
    @cancel="$emit('close')"
  >
    <template #title>
      {{ t('logoutDialog.title') }}
    </template>

    <p class="text-sm text-gray-600 mb-4">
      {{ t('logoutDialog.description') }}
    </p>

    <div class="space-y-3">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="mode"
          type="radio"
          value="all"
          class="text-(--color-primary) focus:ring-(--color-primary)"
        />
        <span class="text-sm text-gray-700">{{ t('logoutDialog.allClients') }}</span>
      </label>

      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="mode"
          type="radio"
          value="specific"
          class="text-(--color-primary) focus:ring-(--color-primary)"
        />
        <span class="text-sm text-gray-700">{{ t('logoutDialog.specificClient') }}</span>
      </label>

      <select
        v-if="mode === 'specific'"
        v-model="selectedClientId"
        class="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
      >
        <option value="" disabled>
          {{ t('logoutDialog.selectClient') }}
        </option>
        <option
          v-for="client in clientStore.clients"
          :key="client.client_id"
          :value="client.client_id"
        >
          {{ client.client_id }}
        </option>
      </select>
    </div>
  </ConfirmDialog>
</template>
