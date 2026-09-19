import { defineStore } from 'pinia'
import { useCollection } from '@/shared/collection'
import {
  isSuccess,
  type SuccessApiResponse,
  type ErrorApiResponse,
  getErrorMessage
} from '@/shared/api'
import { InvitationApi, type CreateInvitationInput } from '../api/InvitationApi'
import type { CreatedInvitationResource } from './CreatedInvitationResource'
import type { InvitationListResource } from './InvitationListResource'
import type { InvitationResource } from './InvitationResource'

export const useInvitationStore = defineStore('invitations', () => {
  const api = new InvitationApi()

  const invitations = useCollection<InvitationResource, InvitationListResource>({
    capabilities: () => api.getInvitationCapabilities(),
    page: (params) => api.listInvitations(params),
    items: (content) => content.invitations
  })

  async function createInvitation(
    input: CreateInvitationInput
  ): Promise<SuccessApiResponse<CreatedInvitationResource> | ErrorApiResponse> {
    return api.createInvitation(input)
  }

  async function revokeInvitation(invitationId: string): Promise<boolean> {
    const response = await api.revokeInvitation(invitationId)

    if (isSuccess(response)) {
      await invitations.fetch(invitations.page)
      return true
    }
    invitations.error = getErrorMessage(response as ErrorApiResponse)
    return false
  }

  return {
    invitations,
    createInvitation,
    revokeInvitation
  }
})
