import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import { type ClaimListResource, claimListResourceSchema } from '../model/ClaimListResource'

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
