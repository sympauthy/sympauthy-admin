<script lang="ts" setup>
import { ref, computed, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaAlert, SaDialog, SaField, SaSelect } from '@sympauthy/design'
import { CommonButton, OneTimeSecret } from '@/shared/ui'
import { useClientStore } from '@/entities/client'
import { UserMfaApi, type MfaEnrollmentInput } from '@/entities/user'
import { isSuccess, getErrorMessage } from '@/shared/api'

interface Props {
  open: boolean
  userId: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const { t } = useI18n()
const clientFieldId = useId()
const returnUrlFieldId = useId()
const cancelUrlFieldId = useId()
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
    error.value = getErrorMessage(response)
  }

  submitting.value = false
}
</script>

<template>
  <SaDialog
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

        <SaAlert v-if="displayError" color="danger" class="mb-4">
          {{ displayError }}
        </SaAlert>

        <div class="space-y-4">
          <SaField :for="clientFieldId" :label="t('pages.userDetail.enrollMfaClient')">
            <SaSelect
              :id="clientFieldId"
              v-model="clientId"
              :disabled="clientStore.allClientsLoading"
            >
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
            </SaSelect>
          </SaField>

          <SaAlert v-if="clientId && !hasRedirectUris" color="warning">
            {{ t('pages.userDetail.enrollMfaNoRedirectUris') }}
          </SaAlert>

          <SaField :for="returnUrlFieldId" :label="t('pages.userDetail.enrollMfaReturnUrl')">
            <SaSelect :id="returnUrlFieldId" v-model="returnUri" :disabled="!hasRedirectUris">
              <option value="" disabled>
                {{ t('pages.userDetail.enrollMfaSelectReturnUrl') }}
              </option>
              <option v-for="uri in redirectUris" :key="uri" :value="uri">
                {{ uri }}
              </option>
            </SaSelect>
          </SaField>

          <SaField :for="cancelUrlFieldId" :label="t('pages.userDetail.enrollMfaCancelUrl')">
            <SaSelect :id="cancelUrlFieldId" v-model="cancelUri" :disabled="!hasRedirectUris">
              <option value="">
                {{ t('pages.userDetail.enrollMfaNoCancelUrl') }}
              </option>
              <option v-for="uri in redirectUris" :key="uri" :value="uri">
                {{ uri }}
              </option>
            </SaSelect>
          </SaField>
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
          variant="secondary"
          :label="t('common.cancel')"
          :disabled="submitting"
          @click="$emit('close')"
        />
        <CommonButton
          variant="primary"
          :label="t('pages.userDetail.enrollMfaGenerate')"
          :submitting="submitting"
          :disabled="!!clientId && !hasRedirectUris"
          @click="onSubmit"
        />
      </template>
      <CommonButton
        v-else
        variant="primary"
        :label="t('pages.userDetail.enrollMfaDone')"
        @click="$emit('close')"
      />
    </template>
  </SaDialog>
</template>
