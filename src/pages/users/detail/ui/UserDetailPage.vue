<script lang="ts" setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserApi, type UserDetailResource } from '@/entities/user'
import { getErrorMessage, isSuccess } from '@/shared/api'
import { useBreadcrumb, useIsPhone } from '@/shared/lib'
import UserSummaryPanel from './UserSummaryPanel.vue'
import { LogoutDialog } from '@/features/logout-user'
import EnrollMfaDialog from './EnrollMfaDialog.vue'
import LinkProviderDialog from './LinkProviderDialog.vue'
import { SaAlert, SaLoadingState, SaPageActions } from '@sympauthy/design'
import { type ActionItem, ActionsDropdown, RecordTabs } from '@/shared/ui'
import {
  ArrowRightStartOnRectangleIcon,
  InformationCircleIcon,
  LinkIcon,
  ShieldCheckIcon
} from '@heroicons/vue/20/solid'
import { useUserViews } from '../model/useUserViews'

/**
 * One account: its summary, and a tab per collection hanging off it. Each tab is a route of its
 * own, so the view an operator is on is addressable and survives a reload.
 *
 * The summary stays above the tabs rather than being a tab of its own — it is what identifies the
 * record, and every tab is read against it. A phone has no room for the three together, so it opens
 * on the summary and a list of the views, and each view fills a screen of its own.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const api = new UserApi()
const { setLabel } = useBreadcrumb()
const isPhone = useIsPhone()
const views = useUserViews()

const user = ref<UserDetailResource | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const userId = computed(() => route.params.userId as string)
const logoutOpen = ref(false)
const enrollMfaOpen = ref(false)
const linkProviderOpen = ref(false)

const isOverview = computed(() => route.name === 'userDetail')
// What explains the view on screen, which a phone reads from the menu: it has no tab to draw it beside.
const help = computed(() =>
  isPhone.value ? views.value.find(({ name }) => name === route.name)?.help : undefined
)

// The route opens the first view on a wider screen, and this does the same for a phone turned or a
// window widened while the list of views is open.
watch([isPhone, isOverview], ([phone, overview]) => {
  if (!phone && overview) {
    router.replace({ name: 'userClaims', params: route.params })
  }
})

// Enrolling a factor and linking a provider each fill a tab under this record, and are listed
// here beside forcing a logout all the same: they are what an operator does to the account, and a
// menu they have to open a tab to find is one they have to know about first.
const actions = computed<ActionItem[]>(() => [
  ...(help.value
    ? [{ key: 'help', label: t(`${help.value}.about`), icon: InformationCircleIcon }]
    : []),
  {
    key: 'enrollMfa',
    label: t('pages.userDetail.enrollMfa'),
    icon: ShieldCheckIcon,
    startsGroup: help.value !== undefined,
    // Its dialog picks the client the person returns to from the configuration's clients.
    requiredScopes: ['admin:users:write', 'admin:config:read']
  },
  {
    key: 'linkProvider',
    label: t('pages.userDetail.linkProvider'),
    icon: LinkIcon,
    requiredScopes: ['admin:users:write', 'admin:config:read']
  },
  {
    key: 'logout',
    label: t('pages.userDetail.forceLogout'),
    icon: ArrowRightStartOnRectangleIcon,
    danger: true,
    requiredScopes: ['admin:grants:write']
  }
])

function onAction(key: string) {
  if (key === 'help') {
    window.open(t(`${help.value}.helpLinkUrl`), '_blank', 'noopener,noreferrer')
  } else if (key === 'enrollMfa') {
    enrollMfaOpen.value = true
  } else if (key === 'linkProvider') {
    linkProviderOpen.value = true
  } else if (key === 'logout') {
    logoutOpen.value = true
  }
}

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
    error.value = getErrorMessage(response)
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
    <SaLoadingState v-if="loading" :label="t('common.loading')" />

    <!-- Error state -->
    <SaAlert v-else-if="error" color="danger">
      {{ error }}
    </SaAlert>

    <!-- Content -->
    <template v-else-if="user">
      <SaPageActions>
        <ActionsDropdown :actions="actions" @action="onAction" />
      </SaPageActions>
      <UserSummaryPanel v-if="!isPhone || isOverview" class="shrink-0" :user="user" />
      <RecordTabs v-if="!isPhone" :tabs="views" :label="t('pages.userDetail.views')" />
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
