<script lang="ts" setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserApi, type UserDetailResource } from '@/entities/user'
import { getErrorMessage, isSuccess, type ErrorApiResponse } from '@/shared/api'
import { useBreadcrumb } from '@/shared/lib'
import UserSummaryPanel from './UserSummaryPanel.vue'
import { LogoutDialog } from '@/features/logout-user'
import EnrollMfaDialog from './EnrollMfaDialog.vue'
import LinkProviderDialog from './LinkProviderDialog.vue'
import {
  ActionsDropdown,
  CommonAlert,
  LoadingState,
  PageActions,
  RecordTabs,
  type ActionItem,
  type RecordTab
} from '@/shared/ui'
import { ArrowRightStartOnRectangleIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/vue/20/solid'

/**
 * One account: its summary, and a tab per collection hanging off it. Each tab is a route of its
 * own, so the view an operator is on is addressable and survives a reload.
 *
 * The summary stays above the tabs rather than being a tab of its own — it is what identifies the
 * record, and every tab is read against it.
 */
const route = useRoute()
const { t } = useI18n()
const api = new UserApi()
const { setLabel } = useBreadcrumb()

const user = ref<UserDetailResource | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const userId = computed(() => route.params.userId as string)
const logoutOpen = ref(false)
const enrollMfaOpen = ref(false)
const linkProviderOpen = ref(false)

// Enrolling a factor and linking a provider each fill a tab under this record, and are listed
// here beside forcing a logout all the same: they are what an operator does to the account, and a
// menu they have to open a tab to find is one they have to know about first.
const actions = computed<ActionItem[]>(() => [
  { key: 'enrollMfa', label: t('pages.userDetail.enrollMfa'), icon: ShieldCheckIcon },
  { key: 'linkProvider', label: t('pages.userDetail.linkProvider'), icon: LinkIcon },
  {
    key: 'logout',
    label: t('pages.userDetail.forceLogout'),
    icon: ArrowRightStartOnRectangleIcon,
    danger: true
  }
])

function onAction(key: string) {
  if (key === 'enrollMfa') {
    enrollMfaOpen.value = true
  } else if (key === 'linkProvider') {
    linkProviderOpen.value = true
  } else if (key === 'logout') {
    logoutOpen.value = true
  }
}

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
  // The record is nulled before the next one is read, which is what unmounts the tab below and
  // mounts it again on the account being opened.
  user.value = null
  loading.value = true
  error.value = null

  const response = await api.getUser(id)

  if (isSuccess(response)) {
    user.value = response.content
    const identifier = user.value.identifier_claims
      ? Object.values(user.value.identifier_claims)[0]
      : undefined
    setLabel(identifier != null ? String(identifier) : id)
  } else {
    error.value = getErrorMessage(response as ErrorApiResponse)
  }

  loading.value = false
}

// The shell stays mounted while the operator moves between tabs; only a different account is
// re-read. Moving from one tab to another must not refetch the record.
watch(userId, load)

onMounted(() => load(userId.value))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4">
    <!-- Loading state -->
    <LoadingState v-if="loading" />

    <!-- Error state -->
    <CommonAlert v-else-if="error" color="danger">
      {{ error }}
    </CommonAlert>

    <!-- Content -->
    <template v-else-if="user">
      <PageActions>
        <ActionsDropdown :actions="actions" @action="onAction" />
      </PageActions>
      <UserSummaryPanel class="shrink-0" :user="user" />
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
