<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { SaEmptyValue, SaPopover, SaTag } from '@sympauthy/design'
import { claimPublicationPlaceLabel } from '../model/ClaimResource'

/**
 * How many places a claim is published in, with the places themselves in a popover.
 *
 * The count is what the cell holds because the five labels spelled out took a share of the table
 * that the claim's own identifier needed more. A claim published nowhere is an `SaEmptyValue`, which
 * is what a cell with no value to show draws.
 */
defineProps<{
  places: string[]
}>()

const { t } = useI18n()
</script>

<template>
  <SaTag v-if="places.length" color="gray">
    {{ t('pages.claims.publishedIn.count', places.length) }}
    <template #help>
      <SaPopover :label="t('common.moreInformation')">
        <div class="flex flex-wrap gap-1">
          <SaTag v-for="place in places" :key="place" color="gray">
            {{ claimPublicationPlaceLabel(place) }}
          </SaTag>
        </div>
      </SaPopover>
    </template>
  </SaTag>
  <SaEmptyValue v-else />
</template>
