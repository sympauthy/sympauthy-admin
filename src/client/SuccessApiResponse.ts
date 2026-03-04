/**
 * A class containing a successful response from the API you fetched.
 *
 * A response is considered successful:
 * - if the server responded with a success HTTP status code.
 * - the content responded by the server matches the one expected by the client.
 */
export class SuccessApiResponse<T> {
  constructor(
    readonly content: T
  ) {
  }
}

export function isSuccess<T>(o: any): o is SuccessApiResponse<T> {
  return o instanceof SuccessApiResponse
}
