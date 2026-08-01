<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonButton from '@/components/CommonButton.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import { primaryColoredButton, secondaryColoredButton } from '@/styles/ButtonStyle'
import { useClientStore } from '@/stores/useClientStore'
import { UserMfaApi, type MfaEnrollmentInput } from '@/client/api/UserMfaApi'
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
const userMfaApi = new UserMfaApi()

const phase = ref<'form' | 'success'>('form')
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

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      phase.value = 'form'
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

  if (!clientId.value) {
    error.value = t('pages.userDetail.enrollMfaClientRequired')
    return
  }
  if (!returnUri.value) {
    error.value = t('pages.userDetail.enrollMfaReturnUrlRequired')
    return
  }

  submitting.value = true

  const input: MfaEnrollmentInput = {
    client_id: clientId.value,
    return_uri: returnUri.value
  }
  if (cancelUri.value) {
    input.cancel_uri = cancelUri.value
  }

  const response = await userMfaApi.enrollMfa(props.userId, input)

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
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <!-- Form phase -->
          <template v-if="phase === 'form'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ t('pages.userDetail.enrollMfa') }}
            </h3>

            <p class="text-sm text-gray-600 mb-4">
              {{ t('pages.userDetail.enrollMfaDescription') }}
            </p>

            <div v-if="displayError" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {{ displayError }}
            </div>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.userDetail.enrollMfaClient') }}
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
                        : t('pages.userDetail.enrollMfaSelectClient')
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
                {{ t('pages.userDetail.enrollMfaNoRedirectUris') }}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.userDetail.enrollMfaReturnUrl') }}
                </label>
                <select
                  v-model="returnUri"
                  :disabled="!hasRedirectUris"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="" disabled>
                    {{ t('pages.userDetail.enrollMfaSelectReturnUrl') }}
                  </option>
                  <option v-for="uri in redirectUris" :key="uri" :value="uri">
                    {{ uri }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.userDetail.enrollMfaCancelUrl') }}
                </label>
                <select
                  v-model="cancelUri"
                  :disabled="!hasRedirectUris"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary) disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">
                    {{ t('pages.userDetail.enrollMfaNoCancelUrl') }}
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
                  {{ t('pages.userDetail.enrollMfaGenerate') }}
                </template>
                {{ t('pages.userDetail.enrollMfaGenerate') }}
              </CommonButton>
            </div>
          </template>

          <!-- Success phase -->
          <template v-else>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ t('pages.userDetail.enrollMfaGenerated') }}
            </h3>

            <div
              class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              {{ t('pages.userDetail.enrollMfaLinkWarning') }}
            </div>

            <div
              class="mb-6 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
            >
              <code class="flex-1 text-sm break-all">{{ redirectUrl }}</code>
              <CopyToClipboard :value="redirectUrl" />
            </div>

            <div class="flex justify-end">
              <CommonButton :button-style="primaryColoredButton" @click="$emit('close')">
                {{ t('pages.userDetail.enrollMfaDone') }}
              </CommonButton>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
