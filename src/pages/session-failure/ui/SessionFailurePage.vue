<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CommonCard,
  DefinitionList,
  DefinitionRow,
  DetailSection,
  EmptyValue,
  HelpTooltip
} from '@/shared/ui'
import {
  interactiveFlowSessionEndedInFailure,
  useInteractiveFlowSessionDetailStore
} from '@/entities/session'

/**
 * Why one session ended where it did: what the server failed it with, and the code naming it.
 *
 * The session is fetched by the record's shell above this route, which renders nothing until it has
 * arrived — so the store always holds one here. The tab names this view, so nothing here repeats
 * the name as a heading.
 */
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()

// Both branches below are read against a session that is there, so the null the store starts on is
// answered once here rather than by each of them.
const endedInFailure = computed(
  () => !!store.session && interactiveFlowSessionEndedInFailure(store.session.status)
)
const notEndedInFailure = computed(() => !!store.session && !endedInFailure.value)

// The values interpolated into the two messages are published raw beside them, and a failure
// carrying none draws no card at all rather than an empty one.
const errorValues = computed(() => store.session?.error_values ?? {})
const hasErrorValues = computed(() => Object.keys(errorValues.value).length > 0)
</script>

<template>
  <!-- The strip above offers this tab to a session that ended in a failure, but the route stays
       reachable by hand — one that has not is told so rather than shown a row of empty fields. -->
  <CommonCard v-if="notEndedInFailure">
    <p class="text-sm text-gray-600">{{ t('pages.sessionFailure.notFailed') }}</p>
  </CommonCard>

  <!-- The failure is what the record says it is, and the status beside the record's identifier
       already says it — so this reads as a record's fields rather than as an alert, which would
       say the panel itself had gone wrong. Each field carries its own explanation: what separates
       a code from a message, and an operator's message from the person's, is the whole of what
       this view is read for, and it must not cost a trip to the tab's own tooltip. -->
  <div v-else-if="store.session" class="space-y-6">
    <DefinitionList>
      <DefinitionRow mono>
        <template #label>
          {{ t('pages.sessionFailure.errorDetailsId.label') }}
          <HelpTooltip>
            <p>{{ t('pages.sessionFailure.errorDetailsId.help') }}</p>
          </HelpTooltip>
        </template>
        <span v-if="store.session.error_details_id">{{ store.session.error_details_id }}</span>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow>
        <template #label>
          {{ t('pages.sessionFailure.errorDetails.label') }}
          <HelpTooltip>
            <p>{{ t('pages.sessionFailure.errorDetails.help') }}</p>
          </HelpTooltip>
        </template>
        <span v-if="store.session.error_details">{{ store.session.error_details }}</span>
        <EmptyValue v-else />
      </DefinitionRow>
      <DefinitionRow>
        <template #label>
          {{ t('pages.sessionFailure.errorDescription.label') }}
          <HelpTooltip>
            <p>{{ t('pages.sessionFailure.errorDescription.help') }}</p>
          </HelpTooltip>
        </template>
        <span v-if="store.session.error_description">{{ store.session.error_description }}</span>
        <EmptyValue v-else />
      </DefinitionRow>
    </DefinitionList>

    <DetailSection v-if="hasErrorValues" :title="t('pages.sessionFailure.values.label')">
      <template #help>
        <HelpTooltip>
          <p>{{ t('pages.sessionFailure.values.help') }}</p>
        </HelpTooltip>
      </template>
      <DefinitionList>
        <DefinitionRow v-for="(value, key) in errorValues" :key="key" mono>
          <template #label>
            <span class="font-mono break-all normal-case">{{ key }}</span>
          </template>
          {{ value }}
        </DefinitionRow>
      </DefinitionList>
    </DetailSection>
  </div>
</template>
