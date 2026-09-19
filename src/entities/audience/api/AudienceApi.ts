import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import {
  type AudienceListResource,
  audienceListResourceSchema
} from '@/entities/audience/model/AudienceListResource'

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
