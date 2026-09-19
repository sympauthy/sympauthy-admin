import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import { type ScopeListResource, scopeListResourceSchema } from '../model/ScopeListResource'

export class ScopeApi extends AbstractApi {
  async listScopes(
    page: number = 0,
    size: number = 20,
    type?: string,
    enabled?: string
  ): Promise<SuccessApiResponse<ScopeListResource> | ErrorApiResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString()
    }
    if (type) {
      params.type = type
    }
    if (enabled) {
      params.enabled = enabled
    }
    return this.get<ScopeListResource>({
      path: '/api/v1/admin/scopes',
      params,
      schema: scopeListResourceSchema
    })
  }
}
