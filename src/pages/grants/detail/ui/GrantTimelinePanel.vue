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
import { clientReferenceName } from '@/entities/client'
import { compareApiDates, formatDate, formatTime, isoDateTime } from '@/shared/lib'

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
      detail: t('pages.grantDetail.timeline.authenticatedAt', {
        client: clientReferenceName(grant.client)
      })
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

interface TimelineEntry extends TimelineEvent {
  /** The latest event of all, whose dot is filled. */
  latest: boolean
  /** The last event of its day, where the rail stops. */
  lastOfDay: boolean
}

/** The events under the day each happened on, so a date is read once above them. */
const days = computed(() => {
  const grouped: { date: string; entries: TimelineEntry[] }[] = []
  events.value.forEach((event, index) => {
    const date = formatDate(event.at)
    const next = events.value[index + 1]
    const entry: TimelineEntry = {
      ...event,
      latest: next === undefined,
      lastOfDay: next === undefined || formatDate(next.at) !== date
    }
    const day = grouped[grouped.length - 1]
    if (day?.date === date) {
      day.entries.push(entry)
    } else {
      grouped.push({ date, entries: [entry] })
    }
  })
  return grouped
})
</script>

<template>
  <SaDetailSection :title="t('pages.grantDetail.timeline.title')">
    <SaCard>
      <div class="space-y-4">
        <section v-for="day in days" :key="day.date" class="space-y-4">
          <h3 class="sa-field-label">{{ day.date }}</h3>
          <ol>
            <li v-for="event in day.entries" :key="event.key" class="flex gap-3">
              <!-- The rail: a dot per event, filled on the latest, and the line down to the next one
                   that day. -->
              <div aria-hidden="true" class="flex w-5 shrink-0 flex-col items-center">
                <span
                  class="mt-1.5 size-2.5 rounded-full border-2 border-primary"
                  :class="event.latest ? 'bg-primary' : 'bg-white'"
                />
                <span v-if="!event.lastOfDay" class="mt-1 w-px flex-1 bg-gray-200" />
              </div>
              <div
                class="flex min-w-0 flex-col gap-0.5 text-sm"
                :class="{ 'pb-5': !event.lastOfDay }"
              >
                <span class="font-medium text-gray-900">{{ event.title }}</span>
                <span v-if="event.detail" class="text-gray-600">{{ event.detail }}</span>
                <RecordLink
                  v-if="event.userId"
                  mono
                  truncate
                  class="self-start"
                  :name="event.userId"
                  :to="{ name: 'userDetail', params: { userId: event.userId } }"
                />
                <time :datetime="isoDateTime(event.at)" class="font-mono text-xs text-gray-600">
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
