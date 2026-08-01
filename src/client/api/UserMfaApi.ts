import { AbstractApi } from '@/client/AbstractApi'
import {
  type UserMfaMethodListResource,
  userMfaMethodListResourceSchema
} from '@/client/model/UserMfaMethodListResource'
import {
  type UserMfaEnrollmentResource,
  userMfaEnrollmentResourceSchema
} from '@/client/model/UserMfaEnrollmentResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

export interface MfaEnrollmentInput {
  client_id: string
  return_uri: string
  cancel_uri?: string
}

export class UserMfaApi extends AbstractApi {
  async listMfaMethods(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<SuccessApiResponse<UserMfaMethodListResource> | ErrorApiResponse> {
    return this.get<UserMfaMethodListResource>({
      path: `/api/v1/admin/users/${userId}/mfa`,
      params: {
        page: page.toString(),
        size: size.toString()
      },
      schema: userMfaMethodListResourceSchema
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
