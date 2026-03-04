import { translateMessage } from '@/i18n'
import type { ErrorResource } from '@/client/model/ErrorResource'

/**
 *
 *
 * The causes of the failed may be one of the following:
 * - the fetch did not reach the server.
 * - the server responded with a non-success HTTP status.
 * - the content responded by the server does not match the one expected by the client.
 */
export class ErrorApiResponse {
  constructor(
    /**
     * A code identifying the error.
     */
    readonly errorCode: string,
    /**
     * A message containing technical details about the error.
     */
    readonly details: string,
    /**
     * A message explaining the error to the end-user. It may contain information on how to recover from the issue.
     */
    readonly description?: string,
    /**
     * The original error responded by the authorization server.
     * Only present if the error is actually originated from the authorization server.
     */
    readonly error?: ErrorResource,
    /**
     * The original response
     */
    readonly response?: Response
  ) {
  }
}

export function makeErrorApiResponse(errorCode: string, descriptionKey?: string): ErrorApiResponse {
  return new ErrorApiResponse(
    errorCode,
    translateMessage(errorCode),
    descriptionKey ? translateMessage(descriptionKey) : undefined
  )
}

export function getErrorMessage(e: ErrorApiResponse): string {
  return e.description ?? e.details ?? e.errorCode
}

export function getErrorMessageForProperties(e: any): Record<string, string> | undefined {
  if (e instanceof ErrorApiResponse && e.error?.properties !== undefined) {
    const errorMessages: Record<string, string> = {}
    for (const property of e.error.properties) {
      if (property.description !== undefined) {
        errorMessages[property.path] = property.description
      }
    }
    return errorMessages
  } else {
    return undefined
  }
}
