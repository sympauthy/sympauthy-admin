import { AbstractApi } from '@/client/AbstractApi'
import {
  type ScopeListResource,
  scopeListResourceSchema,
} from '@/client/model/ScopeListResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export class ScopeApi extends AbstractApi {
  async listScopes(
    page: number = 0,
    size: number = 20,
    type?: string,
    enabled?: string,
  ): Promise<SuccessApiResponse<ScopeListResource> | ErrorApiResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
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
      schema: scopeListResourceSchema,
    })
  }
}
