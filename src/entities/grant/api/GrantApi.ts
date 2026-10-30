import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import { type GrantListResource, grantListResourceSchema } from '../model/GrantListResource'
import { type GrantDetailResource, grantDetailResourceSchema } from '../model/GrantDetailResource'
import {
  type RevokedGrantsResource,
  revokedGrantsResourceSchema
} from '../model/RevokedGrantsResource'

/**
 * The grants a revocation reaches. Each set sent narrows the others, an absent one narrows nothing
 * and an empty one leaves no grant to revoke; the server refuses a body sending none of them.
 */
export interface RevokeGrantsInput {
  grant_ids?: string[]
  user_ids?: string[]
  client_ids?: string[]
  audience_ids?: string[]
}

export class GrantApi extends AbstractApi {
  async listGrants(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<GrantListResource> | ErrorApiResponse> {
    return this.get<GrantListResource>({
      path: '/api/v1/admin/grants',
      params: this.toQueryParams(params),
      schema: grantListResourceSchema
    })
  }

  async getGrantCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/grants/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async getGrant(
    grantId: string
  ): Promise<SuccessApiResponse<GrantDetailResource> | ErrorApiResponse> {
    return this.get<GrantDetailResource>({
      path: `/api/v1/admin/grants/${grantId}`,
      schema: grantDetailResourceSchema
    })
  }

  async revokeGrants(
    input: RevokeGrantsInput
  ): Promise<SuccessApiResponse<RevokedGrantsResource> | ErrorApiResponse> {
    return this.post<RevokedGrantsResource>({
      path: '/api/v1/admin/grants/revoke',
      body: input,
      schema: revokedGrantsResourceSchema
    })
  }
}
