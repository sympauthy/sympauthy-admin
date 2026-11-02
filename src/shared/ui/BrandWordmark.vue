<script lang="ts" setup>
import { SYMPAUTHY_NAME, useBrand } from '@/shared/lib'

/** The deployment's name. SympAuthy's has a drawing of its own, and any other is written as it is. */
const { name } = useBrand()
</script>

<template>
  <span v-if="name === SYMPAUTHY_NAME" class="font-medium">
    Symp<span class="font-extrabold">Authy</span>
  </span>
  <span v-else>{{ name }}</span>
</template>
