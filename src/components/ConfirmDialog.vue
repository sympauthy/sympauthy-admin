<script lang="ts" setup>
import BaseDialog from '@/components/BaseDialog.vue'
import CommonButton from '@/components/CommonButton.vue'
import { type ButtonStyle, dangerColoredButton, secondaryColoredButton } from '@/styles/ButtonStyle'
import { useI18n } from 'vue-i18n'

interface Props {
  open: boolean
  confirmLabel?: string
  cancelLabel?: string
  confirmStyle?: ButtonStyle
  loading?: boolean
  error?: string | null
}

withDefaults(defineProps<Props>(), {
  confirmLabel: undefined,
  cancelLabel: undefined,
  confirmStyle: () => dangerColoredButton,
  loading: false,
  error: null
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <BaseDialog :open="open" :dismiss-disabled="loading" @close="emit('cancel')">
    <template #title>
      <slot name="title" />
    </template>

    <div class="mb-6">
      <slot />
    </div>

    <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div class="flex justify-end gap-3">
      <CommonButton
        :button-style="secondaryColoredButton"
        :disabled="loading"
        @click="emit('cancel')"
      >
        {{ cancelLabel ?? t('common.cancel') }}
      </CommonButton>
      <CommonButton :button-style="confirmStyle" :submitting="loading" @click="emit('confirm')">
        <template #submitting>
          {{ confirmLabel ?? t('common.confirm') }}
        </template>
        {{ confirmLabel ?? t('common.confirm') }}
      </CommonButton>
    </div>
  </BaseDialog>
</template>
