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
 */
const props = defineProps<{
  /** The key the `help` / `helpLinkText` / `helpLinkUrl` triple nests under. */
  term: string
}>()

const { t } = useI18n()

const keypath = computed(() => `${props.term}.help`)
const linkText = computed(() => t(`${props.term}.helpLinkText`))
const linkUrl = computed(() => t(`${props.term}.helpLinkUrl`))
</script>

<template>
  <HelpTooltip>
    <i18n-t :keypath="keypath" tag="p" scope="global">
      <template #link>
        <DocLink :href="linkUrl">{{ linkText }}</DocLink>
      </template>
    </i18n-t>
  </HelpTooltip>
</template>
