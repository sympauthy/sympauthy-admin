import { AbstractApi } from '@/client/AbstractApi'
import {
  type UserListResource,
  userListResourceSchema,
} from '@/client/model/UserListResource'
import {
  type UserResource,
  userResourceSchema,
} from '@/client/model/UserResource'
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

export class UserApi extends AbstractApi {
  async getUser(
    userId: string,
  ): Promise<SuccessApiResponse<UserResource> | ErrorApiResponse> {
    return this.get<UserResource>({
      path: `/api/v1/admin/users/${userId}`,
      schema: userResourceSchema,
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
}
