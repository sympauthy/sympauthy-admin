import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import {
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/collection'
import { type ScopeListResource, scopeListResourceSchema } from '../model/ScopeListResource'

export class ScopeApi extends AbstractApi {
  async listScopes(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<ScopeListResource> | ErrorApiResponse> {
    return this.get<ScopeListResource>({
      path: '/api/v1/admin/scopes',
      params: this.toQueryParams(params),
      schema: scopeListResourceSchema
    })
  }

  async getScopeCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/scopes/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }
}
