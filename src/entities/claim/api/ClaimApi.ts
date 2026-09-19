import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import {
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/collection'
import { type ClaimListResource, claimListResourceSchema } from '../model/ClaimListResource'

export class ClaimApi extends AbstractApi {
  async listClaims(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<ClaimListResource> | ErrorApiResponse> {
    return this.get<ClaimListResource>({
      path: '/api/v1/admin/claims',
      params: this.toQueryParams(params),
      schema: claimListResourceSchema
    })
  }

  async getClaimCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/claims/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }
}
