import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import {
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/collection'
import {
  type ClientListResource,
  clientListResourceSchema
} from '@/entities/client/model/ClientListResource'
import {
  type ClientDetailResource,
  clientDetailResourceSchema
} from '@/entities/client/model/ClientDetailResource'

export class ClientApi extends AbstractApi {
  async listClients(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<ClientListResource> | ErrorApiResponse> {
    return this.get<ClientListResource>({
      path: '/api/v1/admin/clients',
      params: this.toQueryParams(params),
      schema: clientListResourceSchema
    })
  }

  async getClientCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/clients/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async getClient(
    clientId: string
  ): Promise<SuccessApiResponse<ClientDetailResource> | ErrorApiResponse> {
    return this.get<ClientDetailResource>({
      path: `/api/v1/admin/clients/${clientId}`,
      schema: clientDetailResourceSchema
    })
  }
}
