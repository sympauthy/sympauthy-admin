import Ajv, { type JSONSchemaType } from 'ajv'
import { type ErrorResource, errorResourceSchema } from '@/client/model/ErrorResource'
import { ErrorApiResponse, makeErrorApiResponse } from '@/client/ErrorApiResponse'
import { translateMessage } from '@/i18n'
import { SuccessApiResponse } from '@/client/SuccessApiResponse'
import { useAuthStore } from '@/stores/useAuthStore'

export interface QueryOptions {
  path: string
  timeoutInMs?: number
}

export interface PostQueryOptions {
  body: any
}

export interface JsonQueryOptions<T> {
  schema: JSONSchemaType<T>
}

export class AbstractApi {
  private readonly ajv = new Ajv()

  async get<T>(options: QueryOptions & JsonQueryOptions<T>): Promise<SuccessApiResponse<T> | ErrorApiResponse> {
    const response = await this.fetchWithRetry('get', options)
    return this.parseResponseContent(response, options)
  }

  async post<T>(options: QueryOptions & PostQueryOptions & JsonQueryOptions<T>): Promise<SuccessApiResponse<T> | ErrorApiResponse> {
    const response = await this.fetchWithRetry('post', options, options)
    return this.parseResponseContent(response, options)
  }

  async put<T>(options: QueryOptions & PostQueryOptions & JsonQueryOptions<T>): Promise<SuccessApiResponse<T> | ErrorApiResponse> {
    const response = await this.fetchWithRetry('put', options, options)
    return this.parseResponseContent(response, options)
  }

  async delete(options: QueryOptions): Promise<SuccessApiResponse<void> | ErrorApiResponse> {
    const response = await this.fetchWithRetry('delete', options)
    if (response instanceof ErrorApiResponse) {
      return response
    }
    if (!response.ok) {
      return this.parseErrorResponseContent(response, options)
    }
    return new SuccessApiResponse<void>(undefined)
  }

  private async fetch(
    method: 'get' | 'put' | 'post' | 'delete',
    options: QueryOptions,
    postOptions?: PostQueryOptions
  ): Promise<Response | ErrorApiResponse> {
    const url = this.getUrl(options)
    const requestInit = this.getRequestInit(method, postOptions)

    try {
      return await fetch(url, requestInit)
    } catch (error: any) {
      console.error(`Failed to fetch ${url}.`, error)
      return makeErrorApiResponse('api.unknown')
    }
  }

  private getUrl(options: QueryOptions): string {
    const url = new URL(`${document.location.protocol}//${document.location.host}`)
    url.pathname = options.path
    return url.toString()
  }

  private getRequestInit(
    method: string,
    postOptions?: PostQueryOptions
  ): RequestInit {
    const init: RequestInit = {
      method: method,
      headers: this.makeHeaders(postOptions),
      credentials: 'same-origin'
    }
    if (postOptions?.body !== undefined) {
      init.body = JSON.stringify(postOptions.body)
    }
    return init
  }

  private makeHeaders(postOptions?: PostQueryOptions): Headers {
    const headers = new Headers()
    headers.set('Accept', 'application/json')
    if (postOptions?.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      headers.set('Authorization', `Bearer ${authStore.accessToken}`)
    }
    return headers
  }

  private async fetchWithRetry(
    method: 'get' | 'put' | 'post' | 'delete',
    options: QueryOptions,
    postOptions?: PostQueryOptions
  ): Promise<Response | ErrorApiResponse> {
    const response = await this.fetch(method, options, postOptions)
    if (response instanceof Response && response.status === 401) {
      const authStore = useAuthStore()
      const renewed = await authStore.trySilentRenew()
      if (renewed) {
        return await this.fetch(method, options, postOptions)
      }
      return makeErrorApiResponse('api.unauthorized')
    }
    return response
  }

  async parseResponseContent<T>(
    response: Response | ErrorApiResponse,
    options: QueryOptions & JsonQueryOptions<T>
  ): Promise<SuccessApiResponse<T> | ErrorApiResponse> {
    if (response instanceof ErrorApiResponse) {
      return response
    }

    const okCheckResult = await this.checkResponseOk(response, options)
    if (okCheckResult !== undefined) {
      return okCheckResult
    }

    const contentTypeCheckResult = await this.checkContentType(
      response, options, 'application/json'
    )
    if (contentTypeCheckResult !== undefined) {
      return contentTypeCheckResult
    }

    const content = await response.json()
    if (options.schema) {
      const validate = this.ajv.compile(options.schema)
      if (!validate(content)) {
        console.error(
          'Server responded with content not expected schema while fetching path %o.',
          options.path,
          JSON.stringify(options.schema),
          JSON.stringify(content)
        )
        return makeErrorApiResponse('api.unknown')
      }
    }
    return new SuccessApiResponse(content)
  }

  async checkResponseOk(response: Response, options: QueryOptions): Promise<ErrorApiResponse | undefined> {
    if (!response.ok) {
      return this.parseErrorResponseContent(response, options)
    }
  }

  async checkContentType(response: Response, options: QueryOptions, expectedContentType: string): Promise<ErrorApiResponse | undefined> {
    const contentType = response.headers.get('Content-Type')
    if (!contentType || !contentType.includes(expectedContentType)) {
      console.error(
        `Server responded with unexpected content-type ${contentType} while fetching path ${options.path}.`
      )
      return makeErrorApiResponse('api.unknown')
    }
  }

  private async parseErrorResponseContent(response: Response, options: QueryOptions) {
    const checkContentTypeResult = await this.checkContentType(
      response, options, 'application/json'
    )
    if (checkContentTypeResult !== undefined) {
      return checkContentTypeResult
    }

    const content = await response.json()
    console.error(
      `Server responded with status ${response.status} while fetching path ${options.path}: ${JSON.stringify(content)}`
    )
    return this.convertResponseToError(content, response)
  }

  private convertResponseToError(content: any, response: Response): ErrorApiResponse {
    if (this.ajv.validate(errorResourceSchema, content)) {
      const error = content as ErrorResource
      return new ErrorApiResponse(
        error.error_code,
        error.details || translateMessage('api.unknown'),
        error.description,
        error,
        response
      )
    } else {
      return new ErrorApiResponse(
        'api.unknown',
        translateMessage('api.unknown'),
        undefined,
        undefined,
        response
      )
    }
  }
}
