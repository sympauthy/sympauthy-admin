<script lang="ts" setup>
import { computed } from 'vue'
import { TableRecord } from '@/shared/ui'
import { type ClientReferenceResource, clientReferenceName } from '../model/ClientReferenceResource'

/**
 * A client naming the row it heads, in a `primary` cell: by its display name with its identifier
 * under it, or by its identifier alone, in monospace, where the configuration gives it no name.
 */
const props = defineProps<{
  client: ClientReferenceResource
}>()

const named = computed(() => !!props.client.display_name)
</script>

<template>
  <TableRecord
    :class="{ 'font-mono': !named }"
    :name="clientReferenceName(client)"
    :detail="named ? client.id : undefined"
    :to="{ name: 'clientDetail', params: { clientId: client.id } }"
  />
</template>
