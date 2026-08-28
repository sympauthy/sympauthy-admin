<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDialog from '@/components/BaseDialog.vue'
import CommonButton from '@/components/CommonButton.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import { primaryColoredButton, secondaryColoredButton } from '@/styles/ButtonStyle'
import { useClientStore } from '@/stores/useClientStore'
import { UserProviderLinkApi, type ProviderLinkStartInput } from '@/client/api/UserProviderLinkApi'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

interface Props {
  open: boolean
  userId: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const { t } = useI18n()
const clientStore = useClientStore()
const providerLinkApi = new UserProviderLinkApi()

const phase = ref<'form' | 'success'>('form')
const providerId = ref('')
const clientId = ref('')
const returnUri = ref('')
const cancelUri = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const redirectUrl = ref('')

const selectedClient = computed(() =>
  clientStore.clients.find((client) => client.client_id === clientId.value)
)
const redirectUris = computed(() => selectedClient.value?.allowed_redirect_uris ?? [])
const hasRedirectUris = computed(() => redirectUris.value.length > 0)

const displayError = computed(() => error.value ?? clientStore.error)

const dialogTitle = computed(() =>
  phase.value === 'form'
    ? t('pages.userDetail.linkProvider')
    : t('pages.userDetail.linkProviderGenerated')
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      phase.value = 'form'
      providerId.value = ''
      clientId.value = ''
      returnUri.value = ''
      cancelUri.value = ''
      submitting.value = false
      error.value = null
      redirectUrl.value = ''
      clientStore.fetchAllClients()
    }
  }
)

// Reset the URL pickers whenever the client changes — their options come from the selected client.
watch(clientId, () => {
  returnUri.value = ''
  cancelUri.value = ''
})

async function onSubmit() {
  error.value = null

  if (!providerId.value.trim()) {
    error.value = t('pages.userDetail.linkProviderProviderIdRequired')
    return
  }
  if (!clientId.value) {
    error.value = t('pages.userDetail.linkProviderClientRequired')
    return
  }
  if (!returnUri.value) {
    error.value = t('pages.userDetail.linkProviderReturnUrlRequired')
    return
  }

  submitting.value = true

  const input: ProviderLinkStartInput = {
    client_id: clientId.value,
    return_uri: returnUri.value
  }
  if (cancelUri.value) {
    input.cancel_uri = cancelUri.value
  }

  const response = await providerLinkApi.startProviderLink(
    props.userId,
    providerId.value.trim(),
    input
  )

  if (isSuccess(response)) {
    redirectUrl.value = response.content.redirect_url
    phase.value = 'success'
  } else {
    error.value = getErrorMessage(response as ErrorApiResponse)
  }

  submitting.value = false
}
</script>

<template>
  <BaseDialog
    :open="open"
    :title="dialogTitle"
    :dismiss-disabled="submitting"
    @close="$emit('close')"
  >
    <!-- Form phase -->
    <template v-if="phase === 'form'">
      <p class="text-sm text-gray-600 mb-4">
        {{ t('pages.userDetail.linkProviderDescription') }}
      </p>

      <div v-if="displayError" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
        {{ displayError }}
      </div>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('pages.userDetail.linkProviderProviderId') }}
          </label>
          <input
            v-model="providerId"
            type="text"
            :placeholder="t('pages.userDetail.linkProviderProviderIdPlaceholder')"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
          />
          <p class="mt-1 text-xs text-gray-500">
            {{ t('pages.userDetail.linkProviderProviderIdHelp') }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('pages.userDetail.linkProviderClient') }}
          </label>
          <select
            v-model="clientId"
            :disabled="clientStore.loading"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="" disabled>
              {{
                clientStore.loading
                  ? t('common.loading')
                  : t('pages.userDetail.linkProviderSelectClient')
              }}
            </option>
            <option
              v-for="client in clientStore.clients"
              :key="client.client_id"
              :value="client.client_id"
            >
              {{ client.client_id }}
            </option>
          </select>
        </div>

        <div
          v-if="clientId && !hasRedirectUris"
          class="rounded-md bg-amber-50 p-3 text-sm text-amber-800"
        >
          {{ t('pages.userDetail.linkProviderNoRedirectUris') }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('pages.userDetail.linkProviderReturnUrl') }}
          </label>
          <select
            v-model="returnUri"
            :disabled="!hasRedirectUris"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="" disabled>
              {{ t('pages.userDetail.linkProviderSelectReturnUrl') }}
            </option>
            <option v-for="uri in redirectUris" :key="uri" :value="uri">
              {{ uri }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('pages.userDetail.linkProviderCancelUrl') }}
          </label>
          <select
            v-model="cancelUri"
            :disabled="!hasRedirectUris"
            class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="">
              {{ t('pages.userDetail.linkProviderNoCancelUrl') }}
            </option>
            <option v-for="uri in redirectUris" :key="uri" :value="uri">
              {{ uri }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <CommonButton
          :button-style="secondaryColoredButton"
          :disabled="submitting"
          @click="$emit('close')"
        >
          {{ t('common.cancel') }}
        </CommonButton>
        <CommonButton
          :button-style="primaryColoredButton"
          :submitting="submitting"
          :disabled="!!clientId && !hasRedirectUris"
          @click="onSubmit"
        >
          <template #submitting>
            {{ t('pages.userDetail.linkProviderGenerate') }}
          </template>
          {{ t('pages.userDetail.linkProviderGenerate') }}
        </CommonButton>
      </div>
    </template>

    <!-- Success phase -->
    <template v-else>
      <div class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        {{ t('pages.userDetail.linkProviderLinkWarning') }}
      </div>

      <div class="mb-6 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
        <code class="flex-1 text-sm break-all">{{ redirectUrl }}</code>
        <CopyToClipboard :value="redirectUrl" />
      </div>

      <div class="flex justify-end">
        <CommonButton :button-style="primaryColoredButton" @click="$emit('close')">
          {{ t('pages.userDetail.linkProviderDone') }}
        </CommonButton>
      </div>
    </template>
  </BaseDialog>
</template>
