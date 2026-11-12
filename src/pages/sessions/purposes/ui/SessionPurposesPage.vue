<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckIcon, MinusIcon } from '@heroicons/vue/20/solid'
import {
  purposeDescription,
  purposeLabel,
  purposeProgressColor,
  purposeProgressLabel,
  useInteractiveFlowSessionDetailStore
} from '@/entities/session'
import { ScopeTag, ScopeTypeLegend } from '@/entities/scope'
import { SaCard, SaDefinitionRow, SaEmptyValue, SaTag } from '@sympauthy/design'
import { purposeEntries } from '../model/purposeEntries'

/**
 * The purposes one session carries, how far each of them got, and what the session holds for each.
 *
 * The session is fetched by the record's shell above this route, which renders nothing until it has
 * arrived — so the store always holds one here. The tab names this view, so nothing here repeats
 * the name as a heading.
 */
const { t } = useI18n()
const store = useInteractiveFlowSessionDetailStore()

const purposes = computed(() =>
  (store.session?.purposes ?? []).map((progress) => ({
    progress,
    label: purposeLabel(progress.purpose),
    description: purposeDescription(progress.purpose),
    ...purposeEntries(progress, store.session?.client_id, (count) =>
      t('pages.sessionPurposes.scopeCount', count)
    )
  }))
)
</script>

<template>
  <!-- Every purpose is rendered expanded, pending ones included: an empty field on a purpose that
       has not run yet is itself the answer to how far the session got. -->
  <div v-if="store.session" class="space-y-4">
    <SaCard v-for="(purpose, purposeIndex) in purposes" :key="purposeIndex" :padded="false">
      <div
        class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 sm:px-6"
      >
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-gray-900">{{ purpose.label }}</h2>
          <p v-if="purpose.description" class="text-sm text-gray-600">
            {{ purpose.description }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <ScopeTypeLegend v-if="purpose.listsScopes" />
          <SaTag :color="purposeProgressColor(purpose.progress.status)">
            {{ purposeProgressLabel(purpose.progress.status) }}
          </SaTag>
        </div>
      </div>

      <p
        v-if="purpose.rows.length === 0 && purpose.checks.length === 0"
        class="px-4 py-3 text-sm text-gray-500 sm:px-6"
      >
        {{ t('pages.sessionPurposes.noDebugInformation') }}
      </p>

      <!-- The values, and beside them from lg: what the session withholds, which a narrower card
           reads after them. -->
      <div v-else class="lg:grid lg:grid-cols-3">
        <dl
          v-if="purpose.rows.length > 0"
          class="divide-y divide-gray-200"
          :class="purpose.checks.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'"
        >
          <!-- An entry is never dropped: a field that holds nothing keeps its label, since a field
               that has gone missing and a field that is empty are different things. -->
          <SaDefinitionRow
            v-for="row in purpose.rows"
            :key="row.code"
            :mono="row.value.kind === 'text' && row.value.mono"
          >
            <template #label>
              {{ row.label }}
              <span
                v-if="row.caption"
                class="block text-sm font-normal tracking-normal text-gray-600 normal-case"
              >
                {{ row.caption }}
              </span>
            </template>
            <SaEmptyValue v-if="row.value.kind === 'empty'" />
            <div v-else-if="row.value.kind === 'scopes'" class="flex flex-wrap gap-1">
              <ScopeTag v-for="scope in row.value.scopes" :key="scope" :type="row.value.scopeType">
                {{ scope }}
              </ScopeTag>
            </div>
            <div v-else-if="row.value.kind === 'tags'" class="flex flex-wrap gap-1">
              <SaTag v-for="tag in row.value.tags" :key="tag" color="gray">{{ tag }}</SaTag>
            </div>
            <time v-else-if="row.value.kind === 'date'" :datetime="row.value.datetime">
              {{ row.value.text }}
            </time>
            <span v-else>{{ row.value.text }}</span>
          </SaDefinitionRow>
        </dl>

        <!-- What the request carried: whether it held each value the server does not publish, since
             that value exists so that only the client and the browser hold it, and the invitation it
             named. -->
        <section
          v-if="purpose.checks.length > 0"
          :aria-label="t('pages.sessionPurposes.checks')"
          class="space-y-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6 lg:rounded-br-lg"
          :class="
            purpose.rows.length > 0 ? 'lg:border-t-0 lg:border-l' : 'lg:col-span-3 lg:rounded-b-lg'
          "
        >
          <h3 class="sa-field-label">{{ t('pages.sessionPurposes.checks') }}</h3>
          <ul class="space-y-3">
            <li v-for="check in purpose.checks" :key="check.code" class="flex gap-2.5 text-sm">
              <span
                aria-hidden="true"
                class="inline-flex size-5 flex-none items-center justify-center rounded-full"
                :class="
                  check.state === 'present'
                    ? 'bg-tag-green-fill text-tag-green'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                <CheckIcon v-if="check.state === 'present'" class="size-3.5" />
                <MinusIcon v-else class="size-3.5" />
              </span>
              <div class="min-w-0">
                <p class="font-medium text-gray-900">
                  {{ check.label }}
                  <span :class="check.state === 'present' ? 'text-tag-green' : 'text-gray-700'">
                    {{ t(`pages.sessionPurposes.presence.${check.state}`) }}
                  </span>
                  <span
                    v-if="check.detail"
                    class="ml-1 font-mono font-normal break-all text-gray-700"
                  >
                    {{ check.detail }}
                  </span>
                </p>
                <p v-if="check.help" class="text-gray-600">{{ check.help }}</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </SaCard>
  </div>
</template>
