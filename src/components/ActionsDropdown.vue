<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, type Component } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { useI18n } from 'vue-i18n'
import CommonButton from '@/components/CommonButton.vue'
import { type ButtonStyle, secondaryColoredButton } from '@/styles/ButtonStyle'

export interface ActionItem {
  key: string
  label: string
  icon?: Component
  danger?: boolean
}

withDefaults(defineProps<{
  actions: ActionItem[]
  buttonStyle?: ButtonStyle
}>(), {
  buttonStyle: () => secondaryColoredButton,
})

const emit = defineEmits<{
  action: [key: string]
}>()

const { t } = useI18n()

const open = ref(false)
const dropdownRef = ref<HTMLElement>()

function toggle() {
  open.value = !open.value
}

function selectAction(key: string) {
  emit('action', key)
  open.value = false
}

function onClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <CommonButton
      :button-style="buttonStyle"
      :title="t('common.actions')"
      @click="toggle"
    >
      <span class="inline-flex items-center gap-1.5">
        {{ t('common.actions') }}
        <ChevronDownIcon class="size-4" />
      </span>
    </CommonButton>
    <div
      v-if="open && actions.length > 0"
      class="absolute right-0 mt-1 min-w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
    >
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        class="flex w-full items-center gap-2 px-4 py-2.5 text-sm first:rounded-t-md last:rounded-b-md cursor-pointer"
        :class="action.danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100'"
        @click="selectAction(action.key)"
      >
        <component :is="action.icon" v-if="action.icon" class="size-4 shrink-0" />
        {{ action.label }}
      </button>
    </div>
  </div>
</template>
