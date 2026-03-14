<script lang="ts" setup>
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
  error: null,
})

defineEmits<{
  confirm: []
  cancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="$emit('cancel')"
        />
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            <slot name="title" />
          </h3>

          <div class="mb-6">
            <slot />
          </div>

          <div
            v-if="error"
            class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {{ error }}
          </div>

          <div class="flex justify-end gap-3">
            <CommonButton
              :button-style="secondaryColoredButton"
              :disabled="loading"
              @click="$emit('cancel')"
            >
              {{ cancelLabel ?? t('common.cancel') }}
            </CommonButton>
            <CommonButton
              :button-style="confirmStyle"
              :submitting="loading"
              @click="$emit('confirm')"
            >
              <template #submitting>
                {{ confirmLabel ?? t('common.confirm') }}
              </template>
              {{ confirmLabel ?? t('common.confirm') }}
            </CommonButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
