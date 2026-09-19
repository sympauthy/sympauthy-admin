<script lang="ts" setup>
/**
 * The fields of one record, a `DefinitionRow` each, inside the card a section is drawn in. The rows
 * carry their own padding, so the card carries none.
 */
import CommonCard from './CommonCard.vue'
</script>

<template>
  <CommonCard :padded="false">
    <dl class="divide-y divide-gray-200">
      <slot />
    </dl>
  </CommonCard>
</template>
