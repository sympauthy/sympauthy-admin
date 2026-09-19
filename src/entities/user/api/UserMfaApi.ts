import { AbstractApi, type SuccessApiResponse, type ErrorApiResponse } from '@/shared/api'
import {
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/collection'
import {
  type UserMfaMethodListResource,
  userMfaMethodListResourceSchema
} from '@/entities/user/model/UserMfaMethodListResource'
import {
  type UserMfaEnrollmentResource,
  userMfaEnrollmentResourceSchema
} from '@/entities/user/model/UserMfaEnrollmentResource'

export interface MfaEnrollmentInput {
  client_id: string
  return_uri: string
  cancel_uri?: string
}

export class UserMfaApi extends AbstractApi {
  async listMfaMethods(
    userId: string,
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<UserMfaMethodListResource> | ErrorApiResponse> {
    return this.get<UserMfaMethodListResource>({
      path: `/api/v1/admin/users/${userId}/mfa`,
      params: this.toQueryParams(params),
      schema: userMfaMethodListResourceSchema
    })
  }

  async getMfaCapabilities(
    userId: string
  ): Promise<SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse> {
    return this.get<CollectionCapabilitiesResource>({
      path: `/api/v1/admin/users/${userId}/mfa/capabilities`,
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async revokeMfaMethod(
    userId: string,
    mfaId: string
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.delete({
      path: `/api/v1/admin/users/${userId}/mfa/${mfaId}`
    })
  }

  async enrollMfa(
    userId: string,
    input: MfaEnrollmentInput
  ): Promise<SuccessApiResponse<UserMfaEnrollmentResource> | ErrorApiResponse> {
    return this.post<UserMfaEnrollmentResource>({
      path: `/api/v1/admin/users/${userId}/mfa/enrollment`,
      body: input,
      schema: userMfaEnrollmentResourceSchema
    })
  }
}
