<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BaseDialog,
  CommonAlert,
  CommonButton,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  OneTimeSecret,
  primaryColoredButton,
  secondaryColoredButton
} from '@/shared/ui'
import { useAudienceStore } from '@/entities/audience'
import { InvitationApi } from '@/entities/invitation'
import { isSuccess, type ErrorApiResponse, getErrorMessage } from '@/shared/api'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const { t } = useI18n()
const audienceStore = useAudienceStore()
const api = new InvitationApi()

const phase = ref<'form' | 'success'>('form')
const audience = ref('')
const expiresAt = ref('')
const note = ref('')
const claimsJson = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const createdToken = ref('')

const dialogTitle = computed(() =>
  phase.value === 'form'
    ? t('pages.invitations.createTitle')
    : t('pages.invitations.invitationCreated')
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // The audiences are read when the dialog opens rather than with the page behind it: the list
      // page takes its own filters from the capability document and needs none of them.
      audienceStore.fetchAllAudiences()
      phase.value = 'form'
      audience.value = ''
      expiresAt.value = ''
      note.value = ''
      claimsJson.value = ''
      submitting.value = false
      error.value = null
      createdToken.value = ''
    }
  }
)

async function onSubmit() {
  error.value = null

  if (!audience.value) {
    error.value = t('pages.invitations.audienceRequired')
    return
  }

  let claims: Record<string, string> | undefined
  if (claimsJson.value.trim()) {
    try {
      const parsed = JSON.parse(claimsJson.value.trim())
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        error.value = t('pages.invitations.invalidJson')
        return
      }
      claims = parsed
    } catch {
      error.value = t('pages.invitations.invalidJson')
      return
    }
  }

  submitting.value = true

  const input: {
    audience_id: string
    expires_at?: string
    claims?: Record<string, string>
    note?: string
  } = {
    audience_id: audience.value
  }

  if (expiresAt.value) {
    input.expires_at = new Date(expiresAt.value).toISOString()
  }
  if (claims) {
    input.claims = claims
  }
  if (note.value.trim()) {
    input.note = note.value.trim()
  }

  const response = await api.createInvitation(input)

  if (isSuccess(response)) {
    createdToken.value = response.content.token
    phase.value = 'success'
    emit('created')
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
        <CommonAlert v-if="error" color="danger" class="mb-4">
          {{ error }}
        </CommonAlert>

        <div class="space-y-4">
          <FormField :label="t('pages.invitations.audience')">
            <FormSelect v-model="audience">
              <option value="" disabled>
                {{ t('pages.invitations.selectAudience') }}
              </option>
              <option
                v-for="a in audienceStore.allAudiences"
                :key="a.audience_id"
                :value="a.audience_id"
              >
                {{ a.audience_id }}
              </option>
            </FormSelect>
          </FormField>

          <FormField :label="t('pages.invitations.expiresAtLabel')">
            <FormInput v-model="expiresAt" type="datetime-local" />
          </FormField>

          <FormField :label="t('pages.invitations.noteLabel')">
            <FormTextarea v-model="note" :rows="2" />
          </FormField>

          <FormField :label="t('pages.invitations.claimsLabel')">
            <FormTextarea
              v-model="claimsJson"
              mono
              :rows="3"
              :placeholder="t('pages.invitations.claimsPlaceholder')"
            />
          </FormField>
        </div>
      </template>

      <!-- Success phase -->
      <OneTimeSecret v-else :value="createdToken">
        <template #warning>{{ t('pages.invitations.tokenWarning') }}</template>
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
          :label="t('pages.invitations.create')"
          :submitting="submitting"
          @click="onSubmit"
        />
      </template>
      <CommonButton
        v-else
        :button-style="primaryColoredButton"
        :label="t('pages.invitations.done')"
        @click="$emit('close')"
      />
    </template>
  </BaseDialog>
</template>
