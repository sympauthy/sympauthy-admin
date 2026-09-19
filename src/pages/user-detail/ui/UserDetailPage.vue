<script lang="ts" setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserDetailStore } from '@/entities/user'
import { useBreadcrumb } from '@/shared/lib'
import UserSummaryPanel from './UserSummaryPanel.vue'
import { LogoutDialog } from '@/features/logout-user'
import EnrollMfaDialog from './EnrollMfaDialog.vue'
import LinkProviderDialog from './LinkProviderDialog.vue'
import { CommonAlert, LoadingState, RecordTabs, type RecordTab } from '@/shared/ui'

/**
 * One account: its summary, and a tab per collection hanging off it. Each tab is a route of its
 * own, so the view an operator is on is addressable and survives a reload.
 *
 * The summary stays above the tabs rather than being a tab of its own — it is what identifies the
 * record, and every tab is read against it.
 */
const route = useRoute()
const { t } = useI18n()
const store = useUserDetailStore()
const { setLabel } = useBreadcrumb()

const userId = computed(() => route.params.userId as string)
const logoutOpen = ref(false)
const enrollMfaOpen = ref(false)
const linkProviderOpen = ref(false)

// A tab names its own view and carries that view's explanation, both read under the route it opens.
const tabs = computed<RecordTab[]>(() => {
  const params = { userId: userId.value }
  return (['userClaims', 'userConsents', 'userMfa', 'userProviders'] as const).map((name) => ({
    label: t(`pages.${name}.title`),
    to: { name, params },
    help: {
      keypath: `pages.${name}.help`,
      linkText: t(`pages.${name}.helpLinkText`),
      linkUrl: t(`pages.${name}.helpLinkUrl`)
    }
  }))
})

async function load(id: string) {
  store.$reset()
  await store.fetchUser(id)
  if (store.user) {
    const identifier = store.user.identifier_claims
      ? Object.values(store.user.identifier_claims)[0]
      : undefined
    setLabel(identifier != null ? String(identifier) : id)
  }
}

// The shell stays mounted while the operator moves between tabs; only a different account is
// re-read. Moving from one tab to another must not refetch the record.
watch(userId, load)

onMounted(() => load(userId.value))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <!-- Loading state -->
    <LoadingState v-if="store.loading" />

    <!-- Error state -->
    <CommonAlert v-else-if="store.error" color="danger">
      {{ store.error }}
    </CommonAlert>

    <!-- Content -->
    <template v-else-if="store.user">
      <UserSummaryPanel
        class="shrink-0"
        :user="store.user"
        @logout="logoutOpen = true"
        @enroll-mfa="enrollMfaOpen = true"
        @link-provider="linkProviderOpen = true"
      />
      <RecordTabs :tabs="tabs" />
      <!-- The tab fills what the summary and the strip leave, so its table scrolls rather than the
           page. -->
      <div class="min-h-0 flex-1">
        <RouterView />
      </div>
    </template>
  </div>

  <LogoutDialog :user-id="userId" :open="logoutOpen" @close="logoutOpen = false" />
  <EnrollMfaDialog :user-id="userId" :open="enrollMfaOpen" @close="enrollMfaOpen = false" />
  <LinkProviderDialog
    :user-id="userId"
    :open="linkProviderOpen"
    @close="linkProviderOpen = false"
  />
</template>
