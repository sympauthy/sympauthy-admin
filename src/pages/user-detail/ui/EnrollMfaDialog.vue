<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BaseDialog,
  CommonAlert,
  CommonButton,
  FormField,
  FormSelect,
  OneTimeSecret,
  primaryColoredButton,
  secondaryColoredButton
} from '@/shared/ui'
import { useClientStore } from '@/entities/client'
import { UserMfaApi, type MfaEnrollmentInput } from '@/entities/user'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'

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
  clientStore.allClients.find((client) => client.client_id === clientId.value)
)
const redirectUris = computed(() => selectedClient.value?.allowed_redirect_uris ?? [])
const hasRedirectUris = computed(() => redirectUris.value.length > 0)

const displayError = computed(() => error.value ?? clientStore.allClientsError)

const dialogTitle = computed(() =>
  phase.value === 'form'
    ? t('pages.userDetail.enrollMfa')
    : t('pages.userDetail.enrollMfaGenerated')
)

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
  <BaseDialog
    :open="open"
    :title="dialogTitle"
    :dismiss-disabled="submitting"
    @close="$emit('close')"
  >
    <template #default>
      <!-- Form phase -->
      <template v-if="phase === 'form'">
        <p class="mb-4 text-sm text-gray-600">
          {{ t('pages.userDetail.enrollMfaDescription') }}
        </p>

        <CommonAlert v-if="displayError" color="danger" class="mb-4">
          {{ displayError }}
        </CommonAlert>

        <div class="space-y-4">
          <FormField :label="t('pages.userDetail.enrollMfaClient')">
            <FormSelect v-model="clientId" :disabled="clientStore.allClientsLoading">
              <option value="" disabled>
                {{
                  clientStore.allClientsLoading
                    ? t('common.loading')
                    : t('pages.userDetail.enrollMfaSelectClient')
                }}
              </option>
              <option
                v-for="client in clientStore.allClients"
                :key="client.client_id"
                :value="client.client_id"
              >
                {{ client.client_id }}
              </option>
            </FormSelect>
          </FormField>

          <CommonAlert v-if="clientId && !hasRedirectUris" color="warning">
            {{ t('pages.userDetail.enrollMfaNoRedirectUris') }}
          </CommonAlert>

          <FormField :label="t('pages.userDetail.enrollMfaReturnUrl')">
            <FormSelect v-model="returnUri" :disabled="!hasRedirectUris">
              <option value="" disabled>
                {{ t('pages.userDetail.enrollMfaSelectReturnUrl') }}
              </option>
              <option v-for="uri in redirectUris" :key="uri" :value="uri">
                {{ uri }}
              </option>
            </FormSelect>
          </FormField>

          <FormField :label="t('pages.userDetail.enrollMfaCancelUrl')">
            <FormSelect v-model="cancelUri" :disabled="!hasRedirectUris">
              <option value="">
                {{ t('pages.userDetail.enrollMfaNoCancelUrl') }}
              </option>
              <option v-for="uri in redirectUris" :key="uri" :value="uri">
                {{ uri }}
              </option>
            </FormSelect>
          </FormField>
        </div>
      </template>

      <!-- Success phase -->
      <OneTimeSecret v-else :value="redirectUrl">
        <template #warning>{{ t('pages.userDetail.enrollMfaLinkWarning') }}</template>
      </OneTimeSecret>
    </template>

    <template #actions>
      <template v-if="phase === 'form'">
        <CommonButton
          :button-style="secondaryColoredButton"
          :label="t('common.cancel')"
          :disabled="submitting"
          @click="$emit('close')"
        />
        <CommonButton
          :button-style="primaryColoredButton"
          :label="t('pages.userDetail.enrollMfaGenerate')"
          :submitting="submitting"
          :disabled="!!clientId && !hasRedirectUris"
          @click="onSubmit"
        />
      </template>
      <CommonButton
        v-else
        :button-style="primaryColoredButton"
        :label="t('pages.userDetail.enrollMfaDone')"
        @click="$emit('close')"
      />
    </template>
  </BaseDialog>
</template>
