import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import { type ConsentListResource, consentListResourceSchema } from '../model/ConsentListResource'

export class ConsentApi extends AbstractApi {
  async listConsents(
    userId: string,
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<ConsentListResource> | ErrorApiResponse> {
    return this.get<ConsentListResource>({
      path: `/api/v1/admin/users/${userId}/consents`,
      params: this.toQueryParams(params),
      schema: consentListResourceSchema
    })
  }

  async getConsentCapabilities(
    userId: string
  ): Promise<SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse> {
    return this.get<CollectionCapabilitiesResource>({
      path: `/api/v1/admin/users/${userId}/consents/capabilities`,
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async revokeConsent(
    userId: string,
    audienceId: string
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.delete({
      path: `/api/v1/admin/users/${userId}/consents/${audienceId}`
    })
  }
}
