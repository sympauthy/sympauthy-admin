import { AbstractApi } from '@/client/AbstractApi'
import {
  type ConsentListResource,
  consentListResourceSchema,
} from '@/client/model/ConsentListResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export class ConsentApi extends AbstractApi {
  async listConsents(
    userId: string,
    page: number = 0,
    size: number = 20,
  ): Promise<SuccessApiResponse<ConsentListResource> | ErrorApiResponse> {
    return this.get<ConsentListResource>({
      path: `/api/v1/admin/users/${userId}/consents`,
      params: {
        page: page.toString(),
        size: size.toString(),
      },
      schema: consentListResourceSchema,
    })
  }

  async revokeConsent(
    userId: string,
    clientId: string,
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.delete({
      path: `/api/v1/admin/users/${userId}/consents/${clientId}`,
    })
  }
}
