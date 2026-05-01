import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { InvitationApi, type CreateInvitationInput } from '@/client/api/InvitationApi'
import type { InvitationResource } from '@/client/model/InvitationResource'
import type { CreatedInvitationResource } from '@/client/model/CreatedInvitationResource'
import { isSuccess, type SuccessApiResponse } from '@/client/SuccessApiResponse'
import { type ErrorApiResponse, getErrorMessage } from '@/client/ErrorApiResponse'

export const useInvitationStore = defineStore('invitations', () => {
  const api = new InvitationApi()

  const invitations = ref<InvitationResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)

  const statusFilter = ref('')
  const audienceFilter = ref('')

  const totalPages = computed(() => Math.ceil(total.value / size.value))

  async function fetchInvitations(requestedPage: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    const response = await api.listInvitations(
      requestedPage,
      size.value,
      statusFilter.value || undefined,
      audienceFilter.value || undefined
    )

    if (isSuccess(response)) {
      invitations.value = response.content.invitations
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      invitations.value = []
    }

    loading.value = false
  }

  function setStatusFilter(value: string) {
    statusFilter.value = value
    fetchInvitations(0)
  }

  function setAudienceFilter(value: string) {
    audienceFilter.value = value
    fetchInvitations(0)
  }

  function clearStatusFilter() {
    statusFilter.value = ''
    fetchInvitations(0)
  }

  function clearAudienceFilter() {
    audienceFilter.value = ''
    fetchInvitations(0)
  }

  async function createInvitation(
    input: CreateInvitationInput
  ): Promise<SuccessApiResponse<CreatedInvitationResource> | ErrorApiResponse> {
    return api.createInvitation(input)
  }

  async function revokeInvitation(invitationId: string): Promise<boolean> {
    const response = await api.revokeInvitation(invitationId)

    if (isSuccess(response)) {
      await fetchInvitations(page.value)
      return true
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      return false
    }
  }

  return {
    invitations,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    statusFilter,
    audienceFilter,
    fetchInvitations,
    setStatusFilter,
    setAudienceFilter,
    clearStatusFilter,
    clearAudienceFilter,
    createInvitation,
    revokeInvitation
  }
})
