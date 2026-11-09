<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { InformationCircleIcon } from '@heroicons/vue/20/solid'
import { ClientApi, type ClientDetailResource } from '@/entities/client'
import { ScopeApi, type ScopeResource } from '@/entities/scope'
import { fetchAllPages, getErrorMessage, isSuccess } from '@/shared/api'
import { useBreadcrumb, useIsPhone } from '@/shared/lib'
import { type ActionItem, ActionsDropdown } from '@/shared/ui'
import ClientSummaryPanel from './ClientSummaryPanel.vue'
import ClientScopesPanel from './ClientScopesPanel.vue'
import ClientRedirectUrisPanel from './ClientRedirectUrisPanel.vue'
import ClientAuthorizationPanel from './ClientAuthorizationPanel.vue'
import { SaAlert, SaCard, SaLoadingState, SaPageActions } from '@sympauthy/design'

const { t } = useI18n()
const route = useRoute()
const api = new ClientApi()
const scopeApi = new ScopeApi()
const { setLabel } = useBreadcrumb()
const isPhone = useIsPhone()

const clientId = computed(() => route.params.clientId as string)

const client = ref<ClientDetailResource | null>(null)
// Every scope the deployment declares, read for the type each of the client's scopes is drawn as. A
// failure leaves them grey rather than the record unread: the names are what the section is for.
const scopes = ref<ScopeResource[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
// A grant, a session or a consent links here by the client it names, which the configuration may have
// stopped declaring since. That is an outcome of following the link rather than a failure, so it gets
// its own copy.
const notFound = ref(false)

// A phone's record menu opens on the help of what the screen shows, as a grant's does, and a client
// has no views and nothing an operator can do to it, so the link to what a client is fills it alone.
const actions = computed<ActionItem[]>(() =>
  isPhone.value
    ? [{ key: 'help', label: t('pages.clientDetail.about'), icon: InformationCircleIcon }]
    : []
)

function onAction(key: string) {
  if (key === 'help') {
    window.open(t('terms.client.type.helpLinkUrl'), '_blank', 'noopener,noreferrer')
  }
}

onMounted(async () => {
  loading.value = true

  const [response, scopesResult] = await Promise.all([
    api.getClient(clientId.value),
    fetchAllPages(
      (params) => scopeApi.listScopes(params),
      (content) => content.scopes
    )
  ])

  if (isSuccess(response)) {
    client.value = response.content
    scopes.value = scopesResult.items ?? []
    setLabel(client.value.client_id)
  } else if (response.response?.status === 404) {
    notFound.value = true
  } else {
    error.value = getErrorMessage(response)
  }

  loading.value = false
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <SaLoadingState v-if="loading" :label="t('common.loading')" />

    <!-- Undeclared state -->
    <SaCard v-else-if="notFound">
      <p class="text-sm text-gray-600">{{ t('pages.clientDetail.notFound') }}</p>
    </SaCard>

    <!-- Error state -->
    <SaAlert v-else-if="error" color="danger">
      {{ error }}
    </SaAlert>

    <!-- Content -->
    <div v-else-if="client" class="space-y-6">
      <SaPageActions v-if="actions.length > 0">
        <ActionsDropdown :actions="actions" @action="onAction" />
      </SaPageActions>
      <ClientSummaryPanel :client="client" />
      <ClientAuthorizationPanel :client="client" />
      <ClientScopesPanel :client="client" :scopes="scopes" />
      <ClientRedirectUrisPanel :client="client" />
    </div>
  </div>
</template>
