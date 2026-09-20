<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon, PlusIcon } from '@heroicons/vue/20/solid'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { FormListbox } from '@/shared/ui'
import type { CollectionFilter } from '../model/CollectionFilter'

/**
 * The fields a collection filters on, searched rather than read down.
 *
 * It is a popover over a `FormListbox` and not a `DropdownMenu` because a menu has nowhere to
 * type: its keystrokes are its own typeahead. The list is the deployment's as well — an instance
 * publishing a field per claim renders a menu taller than the viewport — so it scrolls and it is
 * searched.
 */
const props = defineProps<{
  filters: CollectionFilter[]
}>()

const emit = defineEmits<{
  select: [field: string]
}>()

const { t } = useI18n()

const open = ref(false)
// Set where the list closed because a field was picked, which is the one close that has somewhere
// else to send the focus.
const handedOver = ref(false)

const options = computed(() =>
  props.filters.map((filter) => ({ value: filter.field, label: filter.name }))
)

/**
 * Clears the hand-over as the list opens.
 *
 * The flag means something only between a pick and the close that follows it. A close that never
 * delivers its focus event — a pick answering no filter, a teardown mid-animation — would leave it
 * latched, and the next Escape would find its trigger unfocused.
 */
function onOpenChange(opened: boolean) {
  open.value = opened
  if (opened) {
    handedOver.value = false
  }
}

// Nothing stays chosen: the list adds a filter and closes, and a field already filtered is offered
// again because two criteria over one field is how a range is asked for.
function onSelect(values: string[]) {
  const field = values[0]
  if (!field) {
    return
  }
  handedOver.value = true
  open.value = false
  emit('select', field)
}

/**
 * Leaves the focus where the filter this list just created put it.
 *
 * A popover closing without having been dismissed from outside focuses its trigger again, and that
 * focus lands outside the popover of the filter the pick opened — which reads it as an interaction
 * outside itself and closes, taking a criterion nobody has filled in yet with it. Escape and a
 * click outside are not that: nothing was created, and the trigger is where the focus belongs.
 */
function onCloseAutoFocus(event: Event) {
  if (!handedOver.value) {
    return
  }
  handedOver.value = false
  event.preventDefault()
}
</script>

<template>
  <PopoverRoot :open="open" @update:open="onOpenChange">
    <!-- A phone gives the toolbar the width of one control, so the label goes and the icon stays.
         The chevron stays with it: with nothing written on the control, it is what says a list
         opens. -->
    <PopoverTrigger
      class="control control-focus flex shrink-0 items-center gap-1.5 border-gray-300 bg-white"
      :title="t('common.addFilter')"
    >
      <PlusIcon class="size-4 shrink-0" />
      <span class="hidden sm:inline">{{ t('common.addFilter') }}</span>
      <ChevronDownIcon class="size-4 shrink-0 text-gray-500" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="end"
        :side-offset="4"
        class="overlay-animated z-10 w-64 max-w-[calc(100vw-2rem)] rounded-md shadow-lg"
        @close-auto-focus="onCloseAutoFocus"
      >
        <FormListbox
          :options="options"
          :selected="[]"
          :search-placeholder="t('common.collection.searchFields')"
          @select="onSelect"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
