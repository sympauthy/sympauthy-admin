<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaCard, SaDetailSection } from '@sympauthy/design'
import { RecordLink } from '@/shared/ui'
import {
  grantConsentedByLabel,
  grantGrantedByLabel,
  grantRevokedByLabel,
  grantTypeLabel,
  type GrantDetailResource
} from '@/entities/grant'
import { compareApiDates, formatDate, formatTime } from '@/shared/lib'

const props = defineProps<{
  grant: GrantDetailResource
}>()

const { t } = useI18n()

interface TimelineEvent {
  key: string
  at: string
  title: string
  detail?: string
  /** The administrator who acted, for a revocation one of them made. */
  userId?: string
}

/**
 * What happened to the grant, from the moments it records, earliest first. A moment the grant does
 * not carry is not an event: nobody consents to a client credentials grant, and nothing is revoked
 * of a live one.
 */
const events = computed<TimelineEvent[]>(() => {
  const { grant } = props
  const all: TimelineEvent[] = []
  // A grant a flow granted is created as its code is exchanged, in the same second, so its
  // creation is only an event of its own on a grant no flow granted: client credentials, an exchange.
  if (!grant.granted_at) {
    all.push({
      key: 'created',
      at: grant.created_at,
      title: t('pages.grantDetail.timeline.created'),
      detail: grantTypeLabel(grant.grant_type)
    })
  }
  if (grant.consented_at) {
    all.push({
      key: 'consented',
      at: grant.consented_at,
      title: t('pages.grantDetail.timeline.consented'),
      detail: grant.consented_by ? grantConsentedByLabel(grant.consented_by) : undefined
    })
  }
  if (grant.authenticated_at) {
    all.push({
      key: 'authenticated',
      at: grant.authenticated_at,
      title: t('pages.grantDetail.timeline.authenticated'),
      detail: t('pages.grantDetail.timeline.authenticatedAt', { client: grant.client_id })
    })
  }
  if (grant.granted_at) {
    all.push({
      key: 'granted',
      at: grant.granted_at,
      title: t('pages.grantDetail.timeline.granted'),
      detail: grant.granted_by ? grantGrantedByLabel(grant.granted_by) : undefined
    })
  }
  if (grant.revoked_at) {
    all.push({
      key: 'revoked',
      at: grant.revoked_at,
      title: t('pages.grantDetail.timeline.revoked'),
      detail: grant.revoked_by ? grantRevokedByLabel(grant.revoked_by) : undefined,
      userId: grant.revoked_by_user_id ?? undefined
    })
  }
  // A grant past its lifetime expired at the moment it states; one that has not yet reached it
  // has that moment in the summary, as something still to come.
  if (grant.status === 'expired' && grant.expires_at) {
    all.push({
      key: 'expired',
      at: grant.expires_at,
      title: t('pages.grantDetail.timeline.expired')
    })
  }
  return all.sort((a, b) => compareApiDates(a.at, b.at))
})

/** The events under the day each happened on, so a date is read once above them. */
const days = computed(() => {
  const grouped: { date: string; events: TimelineEvent[] }[] = []
  for (const event of events.value) {
    const date = formatDate(event.at)
    const day = grouped[grouped.length - 1]
    if (day?.date === date) {
      day.events.push(event)
    } else {
      grouped.push({ date, events: [event] })
    }
  }
  return grouped
})

const lastKey = computed(() => events.value[events.value.length - 1]?.key)
</script>

<template>
  <SaDetailSection :title="t('pages.grantDetail.timeline.title')">
    <SaCard>
      <div class="space-y-4">
        <section v-for="day in days" :key="day.date" class="space-y-4">
          <h3 class="sa-field-label">{{ day.date }}</h3>
          <ol>
            <li v-for="(event, index) in day.events" :key="event.key" class="flex gap-3">
              <!-- The rail: a dot per event, filled on the latest, and the line down to the next one
                   that day. -->
              <div aria-hidden="true" class="flex w-5 shrink-0 flex-col items-center">
                <span
                  class="mt-1.5 size-2.5 rounded-full border-2 border-primary"
                  :class="event.key === lastKey ? 'bg-primary' : 'bg-white'"
                />
                <span v-if="index < day.events.length - 1" class="mt-1 w-px flex-1 bg-gray-200" />
              </div>
              <div
                class="flex min-w-0 flex-col gap-0.5 text-sm"
                :class="index < day.events.length - 1 ? 'pb-5' : ''"
              >
                <span class="font-medium text-gray-900">{{ event.title }}</span>
                <span v-if="event.detail" class="text-gray-600">{{ event.detail }}</span>
                <RecordLink
                  v-if="event.userId"
                  mono
                  truncate
                  class="self-start"
                  :title="event.userId"
                  :name="event.userId"
                  :to="{ name: 'userDetail', params: { userId: event.userId } }"
                />
                <time :datetime="event.at" class="font-mono text-xs text-gray-600">
                  {{ formatTime(event.at) }}
                </time>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </SaCard>
  </SaDetailSection>
</template>
