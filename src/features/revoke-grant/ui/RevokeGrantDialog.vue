<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaConfirmDialog } from '@sympauthy/design'
import { GrantApi } from '@/entities/grant'
import { getErrorMessage, isSuccess } from '@/shared/api'

/**
 * Revokes one grant, once the operator confirms it. It emits `revoked` before `close`, so the screen
 * behind it reads what changed.
 */
const props = defineProps<{
  grantId: string | null
  open: boolean
}>()

const emit = defineEmits<{
  revoked: []
  close: []
}>()

const { t } = useI18n()
const api = new GrantApi()

const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      loading.value = false
      error.value = null
    }
  }
)

async function onConfirm() {
  if (!props.grantId) return

  loading.value = true
  error.value = null

  const response = await api.revokeGrants({ grant_ids: [props.grantId] })

  loading.value = false
  if (isSuccess(response)) {
    emit('revoked')
    emit('close')
  } else {
    error.value = getErrorMessage(response)
  }
}
</script>

<template>
  <SaConfirmDialog
    :open="open"
    :confirm-label="t('revokeGrantDialog.confirm')"
    :cancel-label="t('common.cancel')"
    :loading="loading"
    :error="error"
    @confirm="onConfirm"
    @cancel="$emit('close')"
  >
    <template #title>
      {{ t('revokeGrantDialog.title') }}
    </template>
    <p class="text-sm text-gray-600">{{ t('revokeGrantDialog.description') }}</p>
  </SaConfirmDialog>
</template>
