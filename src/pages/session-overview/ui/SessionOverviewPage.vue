<script lang="ts" setup>
import { useInteractiveFlowSessionDetailStore } from '@/entities/session'
import SessionFailurePanel from './SessionFailurePanel.vue'
import SessionPurposesPanel from './SessionPurposesPanel.vue'

/**
 * What a session holds besides its summary and the places it was driven from: why it failed where
 * it did, and the purposes it went through.
 *
 * The session itself is fetched by the record's shell above this route, which renders nothing until
 * it has arrived — so the store always holds one here.
 */
const store = useInteractiveFlowSessionDetailStore()
</script>

<template>
  <div v-if="store.session" class="space-y-6">
    <SessionFailurePanel v-if="store.session.status === 'failed'" :session="store.session" />
    <SessionPurposesPanel :session="store.session" />
  </div>
</template>
