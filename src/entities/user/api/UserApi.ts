import { AbstractApi } from '@/shared/api/AbstractApi'
import { type UserListResource, userListResourceSchema } from '@/entities/user/model/UserListResource'
import {
  type UserDetailResource,
  userDetailResourceSchema
} from '@/entities/user/model/UserDetailResource'
import {
  type UserClaimListResource,
  userClaimListResourceSchema
} from '@/entities/user/model/UserClaimListResource'
import type { SuccessApiResponse } from '@/shared/api/SuccessApiResponse'
import type { ErrorApiResponse } from '@/shared/api/ErrorApiResponse'

export interface ListUsersParams {
  page?: number
  size?: number
  claims?: string
  q?: string
  status?: string
  sort?: string
  order?: string
  [key: string]: string | number | undefined
}

export interface ListUserClaimsParams {
  page?: number
  size?: number
  claim_id?: string
  identifier?: string
  required?: string
  collected?: string
  verified?: string
  origin?: string
  [key: string]: string | number | undefined
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
    const queryParams = this.toQueryParams(params)
    return this.get<UserListResource>({
      path: '/api/v1/admin/users',
      params: queryParams,
      schema: userListResourceSchema
    })
  }

  async listUserClaims(
    userId: string,
    params: ListUserClaimsParams = {}
  ): Promise<SuccessApiResponse<UserClaimListResource> | ErrorApiResponse> {
    const queryParams = this.toQueryParams(params)
    return this.get<UserClaimListResource>({
      path: `/api/v1/admin/users/${userId}/claims`,
      params: queryParams,
      schema: userClaimListResourceSchema
    })
  }
}
