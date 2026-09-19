<script lang="ts" setup>
import BaseDialog from './BaseDialog.vue'
import CommonAlert from './CommonAlert.vue'
import CommonButton from './CommonButton.vue'
import { type ButtonStyle, dangerColoredButton, secondaryColoredButton } from './ButtonStyle'
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

    <slot />

    <CommonAlert v-if="error" color="danger" class="mt-4">
      {{ error }}
    </CommonAlert>

    <template #actions>
      <CommonButton
        :button-style="secondaryColoredButton"
        :label="cancelLabel ?? t('common.cancel')"
        :disabled="loading"
        @click="emit('cancel')"
      />
      <CommonButton
        :button-style="confirmStyle"
        :label="confirmLabel ?? t('common.confirm')"
        :submitting="loading"
        @click="emit('confirm')"
      />
    </template>
  </BaseDialog>
</template>
