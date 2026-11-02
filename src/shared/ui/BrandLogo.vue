<script lang="ts" setup>
import { brandingUrls } from '@sympauthy/design'

/**
 * The deployment's logo, as the server answers it. The panel is pinned light, so the ground under
 * the logo chooses the file rather than the device's preference: the sidebar stays dark in every
 * theme, and everything else is `ground` or `surface`.
 */
withDefaults(
  defineProps<{
    /** Drawn on the sidebar's ground. */
    onDark?: boolean
    /** The size a screen outside the panel shell is headed with. */
    large?: boolean
  }>(),
  {
    onDark: false,
    large: false
  }
)

const urls = brandingUrls()
</script>

<template>
  <img
    :src="onDark ? urls.logoDark : urls.logo"
    alt=""
    class="w-auto shrink-0"
    :class="large ? 'h-10' : 'h-6'"
  />
</template>
