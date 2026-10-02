<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { CommonTag, EmptyValue, HelpTooltip } from '@/shared/ui'
import { claimPublicationPlaceLabel } from '../model/ClaimResource'

/**
 * How many places a claim is published in, with the places themselves in a popover.
 *
 * The count is what the cell holds because the five labels spelled out took a share of the table
 * that the claim's own identifier needed more. A claim published nowhere is an `EmptyValue`, which
 * is what a cell with no value to show draws.
 */
defineProps<{
  places: string[]
}>()

const { t } = useI18n()
</script>

<template>
  <CommonTag v-if="places.length" color="gray">
    {{ t('pages.claims.publishedIn.count', places.length) }}
    <template #help>
      <HelpTooltip>
        <div class="flex flex-wrap gap-1">
          <CommonTag v-for="place in places" :key="place" color="gray">
            {{ claimPublicationPlaceLabel(place) }}
          </CommonTag>
        </div>
      </HelpTooltip>
    </template>
  </CommonTag>
  <EmptyValue v-else />
</template>
