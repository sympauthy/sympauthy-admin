import { AbstractApi, type ErrorApiResponse, type SuccessApiResponse } from '@/shared/api'
import { type OwnClaimsResource, ownClaimsResourceSchema } from '../model/OwnClaimsResource'

/**
 * The claims of the operator the token was issued for, on the user surface rather than the admin
 * one: no admin scope gates it, so an operator whose token opens no screen still reads and writes
 * their own.
 */
export class OwnClaimApi extends AbstractApi {
  async getOwnClaims(): Promise<SuccessApiResponse<OwnClaimsResource> | ErrorApiResponse> {
    return this.get<OwnClaimsResource>({
      path: '/api/v1/user/claims',
      schema: ownClaimsResourceSchema
    })
  }

  async updateOwnClaims(
    claims: Record<string, unknown>
  ): Promise<SuccessApiResponse<OwnClaimsResource> | ErrorApiResponse> {
    return this.patch<OwnClaimsResource>({
      path: '/api/v1/user/claims',
      body: claims,
      schema: ownClaimsResourceSchema
    })
  }
}
