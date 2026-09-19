import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import {
  type AudienceListResource,
  audienceListResourceSchema
} from '@/entities/audience/model/AudienceListResource'

export class AudienceApi extends AbstractApi {
  async listAudiences(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<AudienceListResource> | ErrorApiResponse> {
    return this.get<AudienceListResource>({
      path: '/api/v1/admin/audiences',
      params: this.toQueryParams(params),
      schema: audienceListResourceSchema
    })
  }

  async getAudienceCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/audiences/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }
}
