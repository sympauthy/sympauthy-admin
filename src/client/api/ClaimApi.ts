import { AbstractApi } from '@/client/AbstractApi'
import {
  type ClaimListResource,
  claimListResourceSchema,
} from '@/client/model/ClaimListResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export class ClaimApi extends AbstractApi {
  async listClaims(
    page: number = 0,
    size: number = 20,
  ): Promise<SuccessApiResponse<ClaimListResource> | ErrorApiResponse> {
    return this.get<ClaimListResource>({
      path: '/api/v1/admin/claims',
      params: {
        page: page.toString(),
        size: size.toString(),
      },
      schema: claimListResourceSchema,
    })
  }
}
