import { AbstractApi } from '@/client/AbstractApi'
import {
  type UserProviderLinkListResource,
  userProviderLinkListResourceSchema
} from '@/client/model/UserProviderLinkListResource'
import {
  type UserProviderLinkStartResource,
  userProviderLinkStartResourceSchema
} from '@/client/model/UserProviderLinkStartResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export interface ProviderLinkStartInput {
  client_id: string
  return_uri: string
  cancel_uri?: string
}

export class UserProviderLinkApi extends AbstractApi {
  async listProviderLinks(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<SuccessApiResponse<UserProviderLinkListResource> | ErrorApiResponse> {
    return this.get<UserProviderLinkListResource>({
      path: `/api/v1/admin/users/${userId}/providers`,
      params: {
        page: page.toString(),
        size: size.toString()
      },
      schema: userProviderLinkListResourceSchema
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
