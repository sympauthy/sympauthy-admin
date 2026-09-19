<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ConfirmDialog, FormSelect } from '@/shared/ui'
import { UserApi } from '@/entities/user'
import { useClientStore } from '@/entities/client'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'

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

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      mode.value = 'all'
      selectedClientId.value = ''
      loading.value = false
      error.value = null
      clientStore.fetchAllClients()
    }
  }
)

async function onConfirm() {
  if (!props.userId) return

  loading.value = true
  error.value = null

  const response =
    mode.value === 'specific' && selectedClientId.value
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

    <p class="mb-4 text-sm text-gray-600">
      {{ t('logoutDialog.description') }}
    </p>

    <div class="space-y-3">
      <label class="flex cursor-pointer items-center gap-2">
        <input v-model="mode" type="radio" value="all" class="text-primary focus:ring-primary" />
        <span class="text-sm text-gray-700">{{ t('logoutDialog.allClients') }}</span>
      </label>

      <label class="flex cursor-pointer items-center gap-2">
        <input
          v-model="mode"
          type="radio"
          value="specific"
          class="text-primary focus:ring-primary"
        />
        <span class="text-sm text-gray-700">{{ t('logoutDialog.specificClient') }}</span>
      </label>

      <FormSelect v-if="mode === 'specific'" v-model="selectedClientId">
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
