import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import {
  type UserProviderLinkListResource,
  userProviderLinkListResourceSchema
} from '@/entities/user/model/UserProviderLinkListResource'
import {
  type UserProviderLinkStartResource,
  userProviderLinkStartResourceSchema
} from '@/entities/user/model/UserProviderLinkStartResource'

export interface ProviderLinkStartInput {
  client_id: string
  return_uri: string
  cancel_uri?: string
}

export class UserProviderLinkApi extends AbstractApi {
  async listProviderLinks(
    userId: string,
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<UserProviderLinkListResource> | ErrorApiResponse> {
    return this.get<UserProviderLinkListResource>({
      path: `/api/v1/admin/users/${userId}/providers`,
      params: this.toQueryParams(params),
      schema: userProviderLinkListResourceSchema
    })
  }

  async getProviderLinkCapabilities(
    userId: string
  ): Promise<SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse> {
    return this.get<CollectionCapabilitiesResource>({
      path: `/api/v1/admin/users/${userId}/providers/capabilities`,
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async unlinkProvider(
    userId: string,
    providerId: string
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.delete({
      path: `/api/v1/admin/users/${userId}/providers/${providerId}`
    })
  }

  async startProviderLink(
    userId: string,
    providerId: string,
    input: ProviderLinkStartInput
  ): Promise<SuccessApiResponse<UserProviderLinkStartResource> | ErrorApiResponse> {
    return this.post<UserProviderLinkStartResource>({
      path: `/api/v1/admin/users/${userId}/providers/${providerId}/link`,
      body: input,
      schema: userProviderLinkStartResourceSchema
    })
  }
}
