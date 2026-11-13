<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SaBrandLogo, SaCard } from '@sympauthy/design'
import BrandWordmark from './BrandWordmark.vue'
import DocLink from './DocLink.vue'

/**
 * A screen drawn outside the panel shell, as the flow draws its auth card: the deployment's brand
 * over the card, and the product under it. The page fills the card.
 */
defineProps<{
  /** Whether the operator's theme is dark, which picks the logo drawn on its ground. */
  dark: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center gap-6 px-4 pt-8 pb-6">
    <!-- Named as the sidebar's head names the panel: the wordmark, then what this is of it. -->
    <header class="flex items-baseline gap-3 sm:mt-16">
      <SaBrandLogo :dark="dark" size="lg" class="self-center" />
      <p class="text-3xl tracking-tight text-gray-900"><BrandWordmark /></p>
      <span class="text-sm font-medium tracking-wider text-gray-500 uppercase">
        {{ t('nav.panel') }}
      </span>
    </header>

    <!-- The flow's auth card, and so its width rather than a form page's `card-large`. -->
    <SaCard class="w-full max-w-card text-base">
      <div class="flex flex-col gap-6">
        <slot />
      </div>
    </SaCard>

    <i18n-t keypath="common.poweredBy" tag="p" scope="global" class="mt-auto text-sm text-gray-500">
      <template #link>
        <DocLink href="https://sympauthy.github.io/">SympAuthy</DocLink>
      </template>
    </i18n-t>
  </div>
</template>
