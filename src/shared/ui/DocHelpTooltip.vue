<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DocLink from './DocLink.vue'
import HelpTooltip from './HelpTooltip.vue'

/**
 * What a term means, read from the bundle: the sentence its `help` holds, closing on the link into
 * the public documentation that its `helpLinkText` and `helpLinkUrl` name.
 *
 * The sentence reaches `i18n-t` as a key rather than as text, because the `{link}` in it is rendered
 * as an anchor and that is what `i18n-t` slots in by key. A sentence naming no `{link}` never
 * renders that slot, so the two keys behind it are read only where the sentence has somewhere to put
 * them.
 *
 * A set whose states one sentence cannot tell apart explains each of them under `valuesHelp`, beside
 * the `values` naming them, and the tooltip lists them under the sentence, one line per state.
 */
const props = defineProps<{
  /** The key the `help` / `helpLinkText` / `helpLinkUrl` triple nests under. */
  term: string
}>()

const { t, tm } = useI18n()

const keypath = computed(() => `${props.term}.help`)
const linkText = computed(() => t(`${props.term}.helpLinkText`))
const linkUrl = computed(() => t(`${props.term}.helpLinkUrl`))
// `tm` answers an empty object for a term explaining no state; `te` cannot ask, since it is true of a
// message only and never of the object the states nest in.
const explainedValues = computed(() => Object.keys(tm(`${props.term}.valuesHelp`)))
</script>

<template>
  <HelpTooltip>
    <i18n-t :keypath="keypath" tag="p" scope="global">
      <template #link>
        <DocLink :href="linkUrl">{{ linkText }}</DocLink>
      </template>
    </i18n-t>
    <dl v-if="explainedValues.length > 0" class="mt-2 space-y-1.5">
      <div v-for="value in explainedValues" :key="value">
        <dt class="inline font-medium text-gray-900">{{ t(`${term}.values.${value}`) }}</dt>
        <dd class="inline">— {{ t(`${term}.valuesHelp.${value}`) }}</dd>
      </div>
    </dl>
  </HelpTooltip>
</template>
