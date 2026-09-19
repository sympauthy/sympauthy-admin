import {
  AbstractApi,
  type SuccessApiResponse,
  type ErrorApiResponse,
  collectionCapabilitiesResourceSchema,
  type CollectionCapabilitiesResource,
  type CollectionParams
} from '@/shared/api'
import { type UserListResource, userListResourceSchema } from '../model/UserListResource'
import {
  type UserDetailResource,
  userDetailResourceSchema
} from '@/entities/user/model/UserDetailResource'
import {
  type UserClaimListResource,
  userClaimListResourceSchema
} from '@/entities/user/model/UserClaimListResource'

export interface ListUsersParams extends CollectionParams {
  /**
   * The claims embedded in each user, comma separated. It selects what is published rather than
   * what is kept, so it is not a criterion and is not resolved against the capability document.
   */
  claims?: string
}

export class UserApi extends AbstractApi {
  async logoutUser(userId: string): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.postVoid({
      path: `/api/v1/admin/users/${userId}/logout`
    })
  }

  async logoutUserClient(
    userId: string,
    clientId: string
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.postVoid({
      path: `/api/v1/admin/users/${userId}/logout/${clientId}`
    })
  }

  async getUser(
    userId: string
  ): Promise<SuccessApiResponse<UserDetailResource> | ErrorApiResponse> {
    return this.get<UserDetailResource>({
      path: `/api/v1/admin/users/${userId}`,
      schema: userDetailResourceSchema
    })
  }

  async listUsers(
    params: ListUsersParams = {}
  ): Promise<SuccessApiResponse<UserListResource> | ErrorApiResponse> {
    return this.get<UserListResource>({
      path: '/api/v1/admin/users',
      params: this.toQueryParams(params),
      schema: userListResourceSchema
    })
  }

  async getUserCapabilities(): Promise<
    SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse
  > {
    return this.get<CollectionCapabilitiesResource>({
      path: '/api/v1/admin/users/capabilities',
      schema: collectionCapabilitiesResourceSchema
    })
  }

  async listUserClaims(
    userId: string,
    params: CollectionParams = {}
  ): Promise<SuccessApiResponse<UserClaimListResource> | ErrorApiResponse> {
    return this.get<UserClaimListResource>({
      path: `/api/v1/admin/users/${userId}/claims`,
      params: this.toQueryParams(params),
      schema: userClaimListResourceSchema
    })
  }

  async getUserClaimCapabilities(
    userId: string
  ): Promise<SuccessApiResponse<CollectionCapabilitiesResource> | ErrorApiResponse> {
    return this.get<CollectionCapabilitiesResource>({
      path: `/api/v1/admin/users/${userId}/claims/capabilities`,
      schema: collectionCapabilitiesResourceSchema
    })
  }
}
