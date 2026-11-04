<script lang="ts" setup>
import { ref, watch, computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { SaAlert, SaDialog, SaField, SaInput, SaSelect, SaTextarea } from '@sympauthy/design'
import { CommonButton, DocHelpTooltip, OneTimeSecret } from '@/shared/ui'
import { AudienceApi, type AudienceResource } from '@/entities/audience'
import { fetchAllPages } from '@/shared/api'
import { InvitationApi } from '../api/InvitationApi'
import { isSuccess, getErrorMessage } from '@/shared/api'

interface Props {
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const { t } = useI18n()
const audienceFieldId = useId()
const expiresAtFieldId = useId()
const noteFieldId = useId()
const claimsFieldId = useId()
const api = new InvitationApi()
const audienceApi = new AudienceApi()

// Every audience there is, because the caller picks one — not the page of them a screen lists.
const allAudiences = ref<AudienceResource[]>([])

async function fetchAllAudiences(): Promise<void> {
  const result = await fetchAllPages(
    (params) => audienceApi.listAudiences(params),
    (content) => content.audiences
  )
  allAudiences.value = result.items ?? []
}

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
      fetchAllAudiences()
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
        <SaAlert v-if="error" color="danger" class="mb-4">
          {{ error }}
        </SaAlert>

        <div class="space-y-4">
          <SaField :for="audienceFieldId" :label="t('pages.invitations.audience')">
            <template #help>
              <DocHelpTooltip term="terms.audience.id" />
            </template>
            <SaSelect :id="audienceFieldId" v-model="audience">
              <option value="" disabled>
                {{ t('pages.invitations.selectAudience') }}
              </option>
              <option v-for="a in allAudiences" :key="a.audience_id" :value="a.audience_id">
                {{ a.audience_id }}
              </option>
            </SaSelect>
          </SaField>

          <SaField :for="expiresAtFieldId" :label="t('pages.invitations.expiresAtLabel')">
            <SaInput :id="expiresAtFieldId" v-model="expiresAt" type="datetime-local" />
          </SaField>

          <SaField :for="noteFieldId" :label="t('pages.invitations.noteLabel')">
            <SaTextarea :id="noteFieldId" v-model="note" :rows="2" />
          </SaField>

          <SaField :for="claimsFieldId" :label="t('pages.invitations.claims.label')">
            <template #help>
              <DocHelpTooltip term="pages.invitations.claims" />
            </template>
            <SaTextarea
              :id="claimsFieldId"
              v-model="claimsJson"
              mono
              :rows="3"
              :placeholder="t('pages.invitations.claimsPlaceholder')"
            />
          </SaField>
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
          variant="secondary"
          :label="t('common.cancel')"
          :disabled="submitting"
          @click="$emit('close')"
        />
        <CommonButton
          variant="primary"
          :label="t('pages.invitations.create')"
          :submitting="submitting"
          @click="onSubmit"
        />
      </template>
      <CommonButton
        v-else
        variant="primary"
        :label="t('pages.invitations.done')"
        @click="$emit('close')"
      />
    </template>
  </SaDialog>
</template>
