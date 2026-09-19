import { AbstractApi } from '@/shared/api/AbstractApi'
import { type ClaimListResource, claimListResourceSchema } from '@/client/model/ClaimListResource'
import type { SuccessApiResponse } from '@/shared/api/SuccessApiResponse'
import type { ErrorApiResponse } from '@/shared/api/ErrorApiResponse'

export class ClaimApi extends AbstractApi {
  async listClaims(
    page: number = 0,
    size: number = 20,
    origin?: string
  ): Promise<SuccessApiResponse<ClaimListResource> | ErrorApiResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString()
    }
    if (origin) {
      params.origin = origin
    }
    return this.get<ClaimListResource>({
      path: '/api/v1/admin/claims',
      params,
      schema: claimListResourceSchema
    })
  }
}
