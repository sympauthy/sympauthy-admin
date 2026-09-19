import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import {
  type InteractiveFlowSessionListResource,
  interactiveFlowSessionListResourceSchema
} from '@/entities/session/model/InteractiveFlowSessionListResource'
import {
  type InteractiveFlowSessionDetailResource,
  interactiveFlowSessionDetailResourceSchema
} from '@/entities/session/model/InteractiveFlowSessionDetailResource'
import {
  type InteractiveFlowSessionSecurityContextListResource,
  interactiveFlowSessionSecurityContextListResourceSchema
} from '@/entities/session/model/InteractiveFlowSessionSecurityContextListResource'

export class InteractiveFlowSessionApi extends AbstractApi {
  async listSessions(
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<InteractiveFlowSessionListResource> | ErrorApiResponse> {
    return this.get<InteractiveFlowSessionListResource>({
      path: '/api/v1/admin/interactive-flow-sessions',
      params: this.toQueryParams(params),
      schema: interactiveFlowSessionListResourceSchema
    })
  }

  async getSessionCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/interactive-flow-sessions/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async getSession(
    sessionId: string
  ): Promise<SuccessApiResponse<InteractiveFlowSessionDetailResource> | ErrorApiResponse> {
    return this.get<InteractiveFlowSessionDetailResource>({
      path: `/api/v1/admin/interactive-flow-sessions/${sessionId}`,
      schema: interactiveFlowSessionDetailResourceSchema
    })
  }

  async listSessionSecurityContexts(
    sessionId: string,
    params: CollectionParams = {}
  ): Promise<
    SuccessApiResponse<InteractiveFlowSessionSecurityContextListResource> | ErrorApiResponse
  > {
    return this.get<InteractiveFlowSessionSecurityContextListResource>({
      path: `/api/v1/admin/interactive-flow-sessions/${sessionId}/security-contexts`,
      params: this.toQueryParams(params),
      schema: interactiveFlowSessionSecurityContextListResourceSchema
    })
  }

  async getSessionSecurityContextCapabilities(
    sessionId: string
  ): Promise<SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse> {
    return this.get<CollectionCapabilitiesResource>({
      path: `/api/v1/admin/interactive-flow-sessions/${sessionId}/security-contexts/capabilities`,
      schema: collectionCapabilitiesResourceSchema
    })
  }
}
