import { AbstractApi } from '@/client/AbstractApi'
import {
  type InvitationListResource,
  invitationListResourceSchema
} from '@/client/model/InvitationListResource'
import {
  type CreatedInvitationResource,
  createdInvitationResourceSchema
} from '@/client/model/CreatedInvitationResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export interface CreateInvitationInput {
  audience_id: string
  expires_at?: string
  claims?: Record<string, string>
  note?: string
}

export class InvitationApi extends AbstractApi {
  async listInvitations(
    page: number = 0,
    size: number = 20,
    status?: string,
    audience?: string
  ): Promise<SuccessApiResponse<InvitationListResource> | ErrorApiResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString()
    }
    if (status) {
      params.status = status
    }
    if (audience) {
      params.audience_id = audience
    }
    return this.get<InvitationListResource>({
      path: '/api/v1/admin/invitations',
      params,
      schema: invitationListResourceSchema
    })
  }

  async createInvitation(
    input: CreateInvitationInput
  ): Promise<SuccessApiResponse<CreatedInvitationResource> | ErrorApiResponse> {
    return this.post<CreatedInvitationResource>({
      path: '/api/v1/admin/invitations',
      body: input,
      schema: createdInvitationResourceSchema
    })
  }

  async revokeInvitation(
    invitationId: string
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.postVoid({
      path: `/api/v1/admin/invitations/${invitationId}/revoke`
    })
  }
}
