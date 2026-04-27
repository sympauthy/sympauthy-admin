import { AbstractApi } from '@/client/AbstractApi'
import {
  type UserProviderLinkListResource,
  userProviderLinkListResourceSchema
} from '@/client/model/UserProviderLinkListResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

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
}
