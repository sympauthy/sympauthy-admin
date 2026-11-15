<script lang="ts" setup>
import { ref, computed, watch, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaAlert, SaDialog, SaField, SaInput, SaSelect } from '@sympauthy/design'
import { CommonButton, OneTimeSecret } from '@/shared/ui'
import { clientChoiceLabel, useClientStore } from '@/entities/client'
import { UserProviderLinkApi, type ProviderLinkStartInput } from '@/entities/user'
import { isSuccess, getErrorMessage } from '@/shared/api'
import { useClientReturnUris } from '../model/useClientReturnUris'

interface Props {
  open: boolean
  userId: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

const { t } = useI18n()
const providerFieldId = useId()
const clientFieldId = useId()
const returnUriFieldId = useId()
const clientStore = useClientStore()
const providerLinkApi = new UserProviderLinkApi()

const phase = ref<'form' | 'success'>('form')
const providerId = ref('')
const clientId = ref('')
const returnUri = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const redirectUrl = ref('')

const {
  returnUris,
  defaultReturnUri,
  loading: returnUrisLoading,
  error: returnUrisError
} = useClientReturnUris(clientId)
// The default is offered as the empty value, so choosing it sends no `return_uri` at all.
const otherReturnUris = computed(() =>
  returnUris.value.filter((uri) => uri !== defaultReturnUri.value)
)
const declaresNoReturnUri = computed(
  () =>
    !!clientId.value &&
    !returnUrisLoading.value &&
    !returnUrisError.value &&
    returnUris.value.length === 0
)
const cannotStart = computed(
  () => !!clientId.value && (returnUrisLoading.value || returnUris.value.length === 0)
)

const displayError = computed(
  () => error.value ?? returnUrisError.value ?? clientStore.allClientsError
)

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
      submitting.value = false
      error.value = null
      redirectUrl.value = ''
      clientStore.fetchAllClients()
    }
  }
)

// Reset the return URI whenever the client changes — its options come from the selected client.
watch(clientId, () => {
  returnUri.value = ''
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
  if (!returnUri.value && !defaultReturnUri.value) {
    error.value = t('pages.userDetail.linkProviderReturnUriRequired')
    return
  }

  submitting.value = true

  const input: ProviderLinkStartInput = {
    client_id: clientId.value
  }
  if (returnUri.value) {
    input.return_uri = returnUri.value
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
          {{ t('pages.userDetail.linkProviderDescription') }}
        </p>

        <SaAlert v-if="displayError" color="danger" class="mb-4">
          {{ displayError }}
        </SaAlert>

        <div class="space-y-4">
          <SaField
            :for="providerFieldId"
            :label="t('pages.userDetail.linkProviderProviderId')"
            :hint="t('pages.userDetail.linkProviderProviderIdHelp')"
          >
            <SaInput
              :id="providerFieldId"
              v-model="providerId"
              :placeholder="t('pages.userDetail.linkProviderProviderIdPlaceholder')"
            />
          </SaField>

          <SaField :for="clientFieldId" :label="t('pages.userDetail.linkProviderClient')">
            <SaSelect
              :id="clientFieldId"
              v-model="clientId"
              :disabled="clientStore.allClientsLoading"
            >
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
                {{ clientChoiceLabel(client) }}
              </option>
            </SaSelect>
          </SaField>

          <SaAlert v-if="declaresNoReturnUri" color="warning" urgent>
            {{ t('pages.userDetail.linkProviderNoReturnUris') }}
          </SaAlert>

          <SaField
            :for="returnUriFieldId"
            :label="t('pages.userDetail.linkProviderReturnUri')"
            :hint="t('pages.userDetail.linkProviderReturnUriHelp')"
          >
            <SaSelect
              :id="returnUriFieldId"
              v-model="returnUri"
              :disabled="!clientId || cannotStart"
            >
              <option v-if="defaultReturnUri" value="">
                {{ t('pages.userDetail.linkProviderDefaultReturnUri', { uri: defaultReturnUri }) }}
              </option>
              <option v-else value="" disabled>
                {{
                  returnUrisLoading
                    ? t('common.loading')
                    : t('pages.userDetail.linkProviderSelectReturnUri')
                }}
              </option>
              <option v-for="uri in otherReturnUris" :key="uri" :value="uri">
                {{ uri }}
              </option>
            </SaSelect>
          </SaField>
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
          variant="secondary"
          :label="t('common.cancel')"
          :disabled="submitting"
          @click="$emit('close')"
        />
        <CommonButton
          variant="primary"
          :label="t('pages.userDetail.linkProviderGenerate')"
          :submitting="submitting"
          :disabled="cannotStart"
          @click="onSubmit"
        />
      </template>
      <CommonButton
        v-else
        variant="primary"
        :label="t('pages.userDetail.linkProviderDone')"
        @click="$emit('close')"
      />
    </template>
  </SaDialog>
</template>
