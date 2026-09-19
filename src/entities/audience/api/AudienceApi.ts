import { AbstractApi } from '@/shared/api/AbstractApi'
import {
  type AudienceListResource,
  audienceListResourceSchema
} from '@/entities/audience/model/AudienceListResource'
import type { SuccessApiResponse } from '@/shared/api/SuccessApiResponse'
import type { ErrorApiResponse } from '@/shared/api/ErrorApiResponse'

export class AudienceApi extends AbstractApi {
  async listAudiences(
    page: number = 0,
    size: number = 20
  ): Promise<SuccessApiResponse<AudienceListResource> | ErrorApiResponse> {
    return this.get<AudienceListResource>({
      path: '/api/v1/admin/audiences',
      params: {
        page: page.toString(),
        size: size.toString()
      },
      schema: audienceListResourceSchema
    })
  }
}
