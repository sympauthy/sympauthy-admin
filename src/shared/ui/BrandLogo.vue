<script lang="ts" setup>
import { computed, ref } from 'vue'
import { brandingUrls } from '@sympauthy/design'
import sympauthyLogo from '@sympauthy/design/logos/sympauthy-icon.svg'
import sympauthyLogoDark from '@sympauthy/design/logos/sympauthy-icon-dark.svg'

/**
 * The deployment's logo, as the server answers it. The panel is pinned light, so the ground under
 * the logo chooses the file rather than the device's preference: the sidebar stays dark in every
 * theme, and everything else is `ground` or `surface`.
 */
const props = withDefaults(
  defineProps<{
    /** Drawn on the sidebar's ground. */
    dark?: boolean
    /** The size a screen outside the panel shell is headed with. */
    large?: boolean
  }>(),
  {
    dark: false,
    large: false
  }
)

const urls = brandingUrls()
const failed = ref(false)

const src = computed(() => {
  if (failed.value) {
    return props.dark ? sympauthyLogoDark : sympauthyLogo
  }
  return props.dark ? urls.logoDark : urls.logo
})
</script>

<template>
  <!-- A deployment's logo has any shape. At the size drawn beside the name it takes half the row at
       most, so a wide one leaves the name room and is scaled rather than squashed. -->
  <img
    :src="src"
    alt=""
    class="w-auto shrink-0 object-contain"
    :class="large ? 'h-10' : 'h-6 max-w-1/2'"
    @error="failed = true"
  />
</template>
