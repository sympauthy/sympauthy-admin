import { AbstractApi } from '@/client/AbstractApi'
import {
  type ClientListResource,
  clientListResourceSchema,
} from '@/client/model/ClientListResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export class ClientApi extends AbstractApi {
  async listClients(
    page: number = 0,
    size: number = 20,
  ): Promise<SuccessApiResponse<ClientListResource> | ErrorApiResponse> {
    return this.get<ClientListResource>({
      path: '/api/v1/admin/clients',
      params: {
        page: page.toString(),
        size: size.toString(),
      },
      schema: clientListResourceSchema,
    })
  }
}
