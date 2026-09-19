<script lang="ts" setup>
import { PAGE_ACTIONS_OUTLET } from './pageActionsOutlet'

/**
 * What a screen lets an operator do, drawn in the bar that names the screen rather than wherever
 * the page happens to reach first.
 *
 * A page writes it where the action belongs in its own file and it arrives in the header, so the
 * control sits in the same place on every screen and does not move when a filter chip appears
 * under it. Only a screen inside the panel shell has that bar: the callback and the registration
 * page render outside it and have no actions to put there.
 */
</script>

<template>
  <!-- Deferred, so the bar above is mounted by the time a page rendered in the same pass asks for
       it. -->
  <Teleport defer :to="`#${PAGE_ACTIONS_OUTLET}`">
    <slot />
  </Teleport>
</template>
