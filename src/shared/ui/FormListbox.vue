<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'
import {
  ListboxContent,
  ListboxFilter,
  ListboxItem,
  ListboxItemIndicator,
  ListboxRoot
} from 'reka-ui'

export interface ListboxOption {
  value: string
  label: string
}

/**
 * A choice among options whose number the build does not know: the fields a deployment filters on,
 * the values one of those fields holds. It scrolls rather than grows, and grows a search field
 * once the list is longer than it shows, so a set the deployment configures can never render past
 * the bottom of the screen.
 *
 * Where a `FormSelect` is a closed list written in the template, this is an open one handed to
 * it, and a caller offering actions rather than a value reaches for `ActionsDropdown`.
 *
 * What is chosen travels as a list whether one may be chosen or several, so the two callers bind
 * the same shape and this is the only place a single value and a list of them meet.
 */
const props = withDefaults(
  defineProps<{
    options: ListboxOption[]
    /** What is chosen, holding at most one value unless [multiple]. */
    selected: string[]
    multiple?: boolean
    /** Names what is being searched, where the list is long enough to be. */
    searchPlaceholder?: string
    /** Names the list itself, which the label beside it does not do — it points at nothing. */
    ariaLabel?: string
  }>(),
  {
    multiple: false,
    searchPlaceholder: undefined,
    ariaLabel: undefined
  }
)

const emit = defineEmits<{
  select: [values: string[]]
}>()

const { t } = useI18n()

/**
 * The length past which a list is searched rather than read. Under it a search field is one more
 * thing to look at before the answer, which is already in sight; over it the list scrolls, and
 * scrolling to find a name is reading the list.
 */
const SEARCHED_FROM = 8

const search = ref('')

const searchable = computed(() => props.options.length >= SEARCHED_FROM)

// The set can change under the control — a caller switching between one value and several keeps
// this component and swaps what it offers — and a search written for the old set hides most of the
// new one without saying why.
watch(
  () => props.options,
  () => {
    search.value = ''
  }
)

const matches = computed(() => {
  const typed = search.value.trim().toLowerCase()
  if (typed === '') {
    return props.options
  }
  return props.options.filter((option) => option.label.toLowerCase().includes(typed))
})

// The primitive models one value where one may be chosen and a list where several may; the caller
// holds a list either way.
const model = computed(() => (props.multiple ? props.selected : (props.selected[0] ?? '')))

function onUpdate(value: unknown) {
  if (props.multiple) {
    emit('select', (value as string[] | undefined) ?? [])
  } else {
    emit('select', value ? [value as string] : [])
  }
}
</script>

<template>
  <ListboxRoot
    :multiple="props.multiple"
    :model-value="model"
    :selection-behavior="props.multiple ? 'toggle' : 'replace'"
    highlight-on-hover
    class="rounded-md border border-gray-300 bg-white"
    @update:model-value="onUpdate"
  >
    <div v-if="searchable" class="relative border-b border-gray-200 p-2">
      <MagnifyingGlassIcon class="absolute top-1/2 left-5 size-4 -translate-y-1/2 text-gray-400" />
      <ListboxFilter
        v-model="search"
        class="control control-focus block w-full border-gray-300 bg-white pl-9"
        :placeholder="props.searchPlaceholder ?? t('common.list.search')"
      />
    </div>

    <ListboxContent class="max-h-56 overflow-y-auto py-1" :aria-label="props.ariaLabel">
      <ListboxItem
        v-for="option in matches"
        :key="option.value"
        :value="option.value"
        class="menu-item justify-between text-gray-700 data-[highlighted]:bg-gray-100"
      >
        <span class="truncate">{{ option.label }}</span>
        <ListboxItemIndicator>
          <CheckIcon class="size-4 shrink-0 text-primary" />
        </ListboxItemIndicator>
      </ListboxItem>

      <!-- Nothing the search matches, which is a list and not a failure. -->
      <p v-if="matches.length === 0" class="px-4 py-2 text-sm text-gray-500">
        {{ t('common.list.noMatch') }}
      </p>
    </ListboxContent>
  </ListboxRoot>
</template>
