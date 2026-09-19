import type { CollectionPageResource } from './CollectionPageResource'
import type { ErrorApiResponse } from './ErrorApiResponse'
import { isSuccess, type SuccessApiResponse } from './SuccessApiResponse'

/**
 * The page size a complete read walks a collection in. It is not the one a page displays: nothing
 * is rendered from it, so it is set to reach the end in as few requests as a deployment's ceiling
 * allows.
 */
const COMPLETE_READ_PAGE_SIZE = 100

/**
 * Every record of a collection, for a picker that has to offer all of them.
 *
 * It is not what a screen lists — a screen asks for the page it can show — so what it answers goes
 * in state of its own rather than in the collection's rows, or a dialog filling it would replace
 * what the page behind it is displaying.
 *
 * Resolves to the records, or to the message of the first request that failed.
 */
export async function fetchAllPages<T, R extends CollectionPageResource>(
  read: (params: {
    page: number
    size: number
  }) => Promise<SuccessApiResponse<R> | ErrorApiResponse>,
  items: (content: R) => T[]
): Promise<{ items: T[]; error: null } | { items: null; error: ErrorApiResponse }> {
  const accumulated: T[] = []
  let page = 0
  let total = 0

  do {
    const response = await read({ page, size: COMPLETE_READ_PAGE_SIZE })
    if (!isSuccess<R>(response)) {
      return { items: null, error: response as ErrorApiResponse }
    }

    const read_ = items(response.content)
    accumulated.push(...read_)
    total = response.content.total
    page++

    // A page that came back empty ends the walk whatever `total` says, and so does a server that
    // capped the size below the one asked for — either would otherwise re-request the same window
    // until the count was reached.
    if (read_.length === 0 || response.content.size < 1) {
      break
    }
  } while (accumulated.length < total)

  return { items: accumulated, error: null }
}
