<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonButton from '@/components/CommonButton.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import { primaryColoredButton, secondaryColoredButton } from '@/styles/ButtonStyle'
import { useAudienceStore } from '@/stores/useAudienceStore'
import { useInvitationStore } from '@/stores/useInvitationStore'
import { isSuccess } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

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
const invitationStore = useInvitationStore()

const phase = ref<'form' | 'success'>('form')
const audience = ref('')
const expiresAt = ref('')
const note = ref('')
const claimsJson = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)
const createdToken = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
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

  const response = await invitationStore.createInvitation(input)

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
              {{ t('pages.invitations.createTitle') }}
            </h3>

            <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {{ error }}
            </div>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.invitations.audience') }}
                </label>
                <select
                  v-model="audience"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                >
                  <option value="" disabled>
                    {{ t('pages.invitations.selectAudience') }}
                  </option>
                  <option
                    v-for="a in audienceStore.audiences"
                    :key="a.audience_id"
                    :value="a.audience_id"
                  >
                    {{ a.audience_id }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.invitations.expiresAtLabel') }}
                </label>
                <input
                  v-model="expiresAt"
                  type="datetime-local"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.invitations.noteLabel') }}
                </label>
                <textarea
                  v-model="note"
                  rows="2"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pages.invitations.claimsLabel') }}
                </label>
                <textarea
                  v-model="claimsJson"
                  rows="3"
                  :placeholder="t('pages.invitations.claimsPlaceholder')"
                  class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                />
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
                @click="onSubmit"
              >
                <template #submitting>
                  {{ t('pages.invitations.create') }}
                </template>
                {{ t('pages.invitations.create') }}
              </CommonButton>
            </div>
          </template>

          <!-- Success phase -->
          <template v-else>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ t('pages.invitations.invitationCreated') }}
            </h3>

            <div
              class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              {{ t('pages.invitations.tokenWarning') }}
            </div>

            <div
              class="mb-6 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
            >
              <code class="flex-1 text-sm break-all">{{ createdToken }}</code>
              <CopyToClipboard :value="createdToken" />
            </div>

            <div class="flex justify-end">
              <CommonButton :button-style="primaryColoredButton" @click="$emit('close')">
                {{ t('pages.invitations.done') }}
              </CommonButton>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
