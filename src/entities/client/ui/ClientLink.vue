<script lang="ts" setup>
import { computed } from 'vue'
import { RecordLink } from '@/shared/ui'
import { type ClientReferenceResource, clientReferenceName } from '../model/ClientReferenceResource'

/**
 * A client named in a field or a column, linking to its screen: by its display name, or by its
 * identifier in monospace where the configuration gives it none.
 *
 * It names the client's route itself, which no other entity does, so that every screen draws a
 * client the same way rather than each repeating the rule.
 */
const props = withDefaults(
  defineProps<{
    client: ClientReferenceResource
    /** Cut with an ellipsis rather than wrapped, where a line holds one value. */
    truncate?: boolean
    /**
     * The identifier under a display name, as the configuration and a search are written in. For
     * a summary field; a column leaves it to the screen the link opens.
     */
    identified?: boolean
  }>(),
  {
    truncate: false,
    identified: false
  }
)

const named = computed(() => !!props.client.display_name)
</script>

<template>
  <RecordLink
    :name="clientReferenceName(client)"
    :to="{ name: 'clientDetail', params: { clientId: client.id } }"
    :mono="!named"
    :truncate="truncate"
  />
  <span
    v-if="identified && named"
    class="block truncate font-mono text-xs text-gray-500"
    :title="client.id"
  >
    {{ client.id }}
  </span>
</template>
