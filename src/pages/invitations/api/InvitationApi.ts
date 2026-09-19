import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import {
  type InvitationListResource,
  invitationListResourceSchema
} from '../model/InvitationListResource'
import {
  type CreatedInvitationResource,
  createdInvitationResourceSchema
} from '../model/CreatedInvitationResource'

export interface CreateInvitationInput {
  audience_id: string
  expires_at?: string
  claims?: Record<string, string>
  note?: string
}

export class InvitationApi extends AbstractApi {
  async listInvitations(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<InvitationListResource> | ErrorApiResponse> {
    return this.get<InvitationListResource>({
      path: '/api/v1/admin/invitations',
      params: this.toQueryParams(params),
      schema: invitationListResourceSchema
    })
  }

  async getInvitationCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/invitations/capabilities',
      schema: collectionCapabilitiesResourceSchema
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
