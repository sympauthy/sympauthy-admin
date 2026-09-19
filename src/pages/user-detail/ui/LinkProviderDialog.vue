<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BaseDialog,
  CommonAlert,
  CommonButton,
  FormField,
  FormInput,
  FormSelect,
  OneTimeSecret,
  primaryColoredButton,
  secondaryColoredButton
} from '@/shared/ui'
import { useClientStore } from '@/entities/client'
import { UserProviderLinkApi, type ProviderLinkStartInput } from '@/entities/user'
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
  clientStore.allClients.find((client) => client.client_id === clientId.value)
)
const redirectUris = computed(() => selectedClient.value?.allowed_redirect_uris ?? [])
const hasRedirectUris = computed(() => redirectUris.value.length > 0)

const displayError = computed(() => error.value ?? clientStore.allClientsError)

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
    <template #default>
      <!-- Form phase -->
      <template v-if="phase === 'form'">
        <p class="mb-4 text-sm text-gray-600">
          {{ t('pages.userDetail.linkProviderDescription') }}
        </p>

        <CommonAlert v-if="displayError" color="danger" class="mb-4">
          {{ displayError }}
        </CommonAlert>

        <div class="space-y-4">
          <FormField
            :label="t('pages.userDetail.linkProviderProviderId')"
            :hint="t('pages.userDetail.linkProviderProviderIdHelp')"
          >
            <FormInput
              v-model="providerId"
              :placeholder="t('pages.userDetail.linkProviderProviderIdPlaceholder')"
            />
          </FormField>

          <FormField :label="t('pages.userDetail.linkProviderClient')">
            <FormSelect v-model="clientId" :disabled="clientStore.allClientsLoading">
              <option value="" disabled>
                {{
                  clientStore.allClientsLoading
                    ? t('common.loading')
                    : t('pages.userDetail.linkProviderSelectClient')
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
            {{ t('pages.userDetail.linkProviderNoRedirectUris') }}
          </CommonAlert>

          <FormField :label="t('pages.userDetail.linkProviderReturnUrl')">
            <FormSelect v-model="returnUri" :disabled="!hasRedirectUris">
              <option value="" disabled>
                {{ t('pages.userDetail.linkProviderSelectReturnUrl') }}
              </option>
              <option v-for="uri in redirectUris" :key="uri" :value="uri">
                {{ uri }}
              </option>
            </FormSelect>
          </FormField>

          <FormField :label="t('pages.userDetail.linkProviderCancelUrl')">
            <FormSelect v-model="cancelUri" :disabled="!hasRedirectUris">
              <option value="">
                {{ t('pages.userDetail.linkProviderNoCancelUrl') }}
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
        <template #warning>{{ t('pages.userDetail.linkProviderLinkWarning') }}</template>
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
          :label="t('pages.userDetail.linkProviderGenerate')"
          :submitting="submitting"
          :disabled="!!clientId && !hasRedirectUris"
          @click="onSubmit"
        />
      </template>
      <CommonButton
        v-else
        :button-style="primaryColoredButton"
        :label="t('pages.userDetail.linkProviderDone')"
        @click="$emit('close')"
      />
    </template>
  </BaseDialog>
</template>
