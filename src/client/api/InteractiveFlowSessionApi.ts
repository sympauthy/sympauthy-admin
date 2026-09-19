import { AbstractApi } from '@/shared/api/AbstractApi'
import {
  type InteractiveFlowSessionListResource,
  interactiveFlowSessionListResourceSchema
} from '@/client/model/InteractiveFlowSessionListResource'
import {
  type InteractiveFlowSessionDetailResource,
  interactiveFlowSessionDetailResourceSchema
} from '@/client/model/InteractiveFlowSessionDetailResource'
import {
  type InteractiveFlowSessionSecurityContextListResource,
  interactiveFlowSessionSecurityContextListResourceSchema
} from '@/client/model/InteractiveFlowSessionSecurityContextListResource'
import type { SuccessApiResponse } from '@/shared/api/SuccessApiResponse'
import type { ErrorApiResponse } from '@/shared/api/ErrorApiResponse'

export interface ListInteractiveFlowSessionSecurityContextsParams {
  page?: number
  size?: number
  [key: string]: string | number | undefined
}

export interface ListInteractiveFlowSessionsParams {
  page?: number
  size?: number
  /**
   * Partial, case-insensitive, across the address and user agent of every place the session was
   * driven from, and the initiating client id.
   */
  q?: string
  purpose?: string
  status?: string
  /** Identifier of the user the session identified. */
  user?: string
  /** Exact client id. A value naming no configured client is answered with a 400. */
  client?: string
  /** Sort direction over the date the session started: `asc` or `desc`. */
  order?: string
  [key: string]: string | number | undefined
}

export class InteractiveFlowSessionApi extends AbstractApi {
  async listSessions(
    params: ListInteractiveFlowSessionsParams = {}
  ): Promise<SuccessApiResponse<InteractiveFlowSessionListResource> | ErrorApiResponse> {
    const queryParams = this.toQueryParams(params)
    return this.get<InteractiveFlowSessionListResource>({
      path: '/api/v1/admin/interactive-flow-sessions',
      params: queryParams,
      schema: interactiveFlowSessionListResourceSchema
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
    params: ListInteractiveFlowSessionSecurityContextsParams = {}
  ): Promise<
    SuccessApiResponse<InteractiveFlowSessionSecurityContextListResource> | ErrorApiResponse
  > {
    const queryParams = this.toQueryParams(params)
    return this.get<InteractiveFlowSessionSecurityContextListResource>({
      path: `/api/v1/admin/interactive-flow-sessions/${sessionId}/security-contexts`,
      params: queryParams,
      schema: interactiveFlowSessionSecurityContextListResourceSchema
    })
  }
}
