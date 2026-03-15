import { AbstractApi } from '@/client/AbstractApi'
import {
  type UserListResource,
  userListResourceSchema,
} from '@/client/model/UserListResource'
import {
  type UserDetailResource,
  userDetailResourceSchema,
} from '@/client/model/UserDetailResource'
import {
  type UserClaimListResource,
  userClaimListResourceSchema,
} from '@/client/model/UserClaimListResource'
import type { SuccessApiResponse } from '@/client/SuccessApiResponse'
import type { ErrorApiResponse } from '@/client/ErrorApiResponse'

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
  standard?: string
  [key: string]: string | number | undefined
}

export class UserApi extends AbstractApi {
  async logoutUser(
    userId: string,
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.postVoid({
      path: `/api/v1/admin/users/${userId}/logout`,
    })
  }

  async logoutUserClient(
    userId: string,
    clientId: string,
  ): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    return this.postVoid({
      path: `/api/v1/admin/users/${userId}/logout/${clientId}`,
    })
  }

  async getUser(
    userId: string,
  ): Promise<SuccessApiResponse<UserDetailResource> | ErrorApiResponse> {
    return this.get<UserDetailResource>({
      path: `/api/v1/admin/users/${userId}`,
      schema: userDetailResourceSchema,
    })
  }

  async listUsers(
    params: ListUsersParams = {},
  ): Promise<SuccessApiResponse<UserListResource> | ErrorApiResponse> {
    const queryParams: Record<string, string> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        queryParams[key] = value.toString()
      }
    }
    return this.get<UserListResource>({
      path: '/api/v1/admin/users',
      params: queryParams,
      schema: userListResourceSchema,
    })
  }

  async listUserClaims(
    userId: string,
    params: ListUserClaimsParams = {},
  ): Promise<SuccessApiResponse<UserClaimListResource> | ErrorApiResponse> {
    const queryParams: Record<string, string> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        queryParams[key] = value.toString()
      }
    }
    return this.get<UserClaimListResource>({
      path: `/api/v1/admin/users/${userId}/claims`,
      params: queryParams,
      schema: userClaimListResourceSchema,
    })
  }
}
