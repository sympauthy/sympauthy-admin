import { computed, reactive, ref, type Ref } from 'vue'
import {
  getErrorMessage,
  isSuccess,
  type CollectionCapabilitiesResource,
  type CollectionPageResource,
  type ErrorApiResponse,
  type SuccessApiResponse
} from '@/shared/api'
import { knownCollectionFilters, type CollectionFilter } from './CollectionFilter'
import {
  collectionQueryParams,
  effectiveSortKeys,
  emptyCollectionCriteria,
  isCriterionComplete,
  type CollectionCriteria,
  type CollectionCriterion,
  type CollectionSortKey
} from './CollectionCriteria'
import { defaultCollectionOperator } from './CollectionOperatorUtils'

/**
 * A criteria change waits this long before it is asked of the server, so that the letters of a word
 * being typed are one request, and so that a filter switching operator does not ask once for the new
 * operator against the old value. Paging, sorting and resizing are not delayed: each is one
 * deliberate act.
 */
const CRITERIA_DELAY_IN_MS = 250

type ApiResponse<T> = Promise<SuccessApiResponse<T> | ErrorApiResponse>

/**
 * Where one collection is read from: the document saying what it accepts, the call answering a page
 * of it, and where the records sit in that answer.
 *
 * Each function is called at the moment it is needed rather than bound once, so a collection under
 * a parent path reads whichever record the page it belongs to is showing.
 */
export interface CollectionSource<T, R extends CollectionPageResource> {
  capabilities: () => ApiResponse<CollectionCapabilitiesResource>
  page: (params: Record<string, string | number | undefined>) => ApiResponse<R>
  items: (content: R) => T[]
  /**
   * Parameters the collection reads for something other than a criterion — `/admin/users`'s
   * `claims`, which selects what is published rather than what is kept.
   */
  selection?: () => Record<string, string | number | undefined>
}

/**
 * One collection: the records a page holds, what the caller asked of it, and what it says it
 * accepts.
 *
 * A page holds one per collection it lists and hands it to `CollectionPage` whole, so what one
 * screen asked of a collection is never what another screen reads. Nothing outside here builds a
 * query parameter.
 */
export interface Collection<T> {
  items: T[]
  loading: boolean
  error: string | null
  page: number
  size: number
  total: number
  readonly totalPages: number
  capabilities: CollectionCapabilitiesResource | null
  /** Set where the document could not be read; the records are still listed without it. */
  capabilitiesError: string | null
  criteria: CollectionCriteria
  /** The fields the collection filters on that this panel knows how to render. */
  readonly filters: CollectionFilter[]
  readonly searchable: boolean
  /** The order the collection reads in, which is the collection's own where none was asked. */
  readonly sortKeys: CollectionSortKey[]
  sortsOn: (field: string) => boolean
  fetch: (page?: number) => Promise<void>
  setSize: (size: number) => void
  setSearch: (query: string) => void
  /** The id of the criterion it opened, which is how the toolbar opens the one it just added. */
  addFilter: (field: string) => number | undefined
  updateFilter: (id: number, patch: Partial<Omit<CollectionCriterion, 'id'>>) => void
  removeFilter: (id: number) => void
  toggleSort: (field: string) => void
}

/**
 * The state of one collection, fetched from [source].
 *
 * It is held by the screen listing that collection and dies with it: the page an operator is on,
 * the filters they typed and the order they asked for belong to that screen, and a second screen
 * over the same records starts where its own caller left it.
 *
 * The capability document is requested beside the first page rather than before it: the first page
 * carries no criteria, so nothing about it waits on the document, and the toolbar appears when the
 * document lands.
 */
export function useCollection<T, R extends CollectionPageResource>(
  source: CollectionSource<T, R>
): Collection<T> {
  const items = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(0)
  const size = ref(20)
  const total = ref(0)

  const capabilities = ref<CollectionCapabilitiesResource | null>(null)
  const capabilitiesError = ref<string | null>(null)
  const criteria = ref<CollectionCriteria>(emptyCollectionCriteria())

  // Set once a first response has arrived. A page size change before that would request a page the
  // component is about to request anyway.
  const loaded = ref(false)
  let capabilitiesInFlight = false
  let nextFilterId = 0
  let criteriaTimeout: ReturnType<typeof setTimeout> | undefined
  // Which page request is the current one. A response from any earlier one is dropped rather than
  // painted: two requests can be in flight — a debounced criteria change and a page click — and the
  // one that answers last is not the one the caller is waiting for.
  let currentRequest = 0

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))
  const filters = computed(() => knownCollectionFilters(capabilities.value))
  const searchable = computed(() => (capabilities.value?.search?.fields.length ?? 0) > 0)
  const sortKeys = computed(() => effectiveSortKeys(criteria.value, capabilities.value))

  function sortsOn(field: string): boolean {
    return capabilities.value?.sorts.some((sort) => sort.field === field) ?? false
  }

  /**
   * Reads the document, unless a read of it is already in flight.
   *
   * It describes the collection rather than a record, so it reads the same under every parent and
   * is asked for once rather than once per record — but a read that failed leaves nothing to keep,
   * and the next page request asks again rather than leaving the toolbar gone for good.
   */
  async function fetchCapabilities(): Promise<void> {
    if (capabilitiesInFlight) {
      return
    }
    capabilitiesInFlight = true
    const response = await source.capabilities()
    capabilitiesInFlight = false

    if (isSuccess<CollectionCapabilitiesResource>(response)) {
      capabilities.value = response.content
      capabilitiesError.value = null
    } else {
      capabilitiesError.value = getErrorMessage(response as ErrorApiResponse)
    }
  }

  async function fetch(requestedPage: number = 0): Promise<void> {
    if (!capabilities.value) {
      // Not awaited: the page being requested carries no criteria the document has to be read to
      // build, so the two travel together and the toolbar renders when the document lands.
      void fetchCapabilities()
    }

    const request = ++currentRequest
    loading.value = true
    error.value = null

    const response = await source.page({
      ...(source.selection?.() ?? {}),
      ...collectionQueryParams(criteria.value, requestedPage, size.value)
    })

    // A later request went out while this one was travelling, so this answer is to a question
    // nobody is asking any more.
    if (request !== currentRequest) {
      return
    }

    if (isSuccess<R>(response)) {
      items.value = source.items(response.content)
      page.value = response.content.page
      total.value = response.content.total
    } else {
      error.value = getErrorMessage(response as ErrorApiResponse)
      items.value = []
    }

    loaded.value = true
    loading.value = false
  }

  /**
   * Asks the first page again once the criteria have settled. A narrowed collection has a different
   * first page, so the one being read is never the one to come back to.
   */
  function refetchOnCriteriaChange() {
    if (criteriaTimeout) {
      clearTimeout(criteriaTimeout)
    }
    criteriaTimeout = setTimeout(() => void fetch(0), CRITERIA_DELAY_IN_MS)
  }

  function setSearch(query: string) {
    criteria.value.query = query
    refetchOnCriteriaChange()
  }

  function addFilter(field: string): number | undefined {
    const filter = filters.value.find((candidate) => candidate.field === field)
    if (!filter) {
      return undefined
    }
    const criterion: CollectionCriterion = {
      id: nextFilterId++,
      field,
      operator: defaultCollectionOperator(filter.type, filter.operators),
      value: '',
      values: []
    }
    criteria.value.filters.push(criterion)
    // A filter the caller has just opened holds no value yet and narrows nothing — unless its
    // operator takes none, which a field admitting `is_null` first opens on: that one is
    // answerable the moment it is added, and waiting for an edit that may never come would leave
    // a filter on the row that the list below it does not answer.
    if (isCriterionComplete(criterion)) {
      refetchOnCriteriaChange()
    }
    return criterion.id
  }

  function updateFilter(id: number, patch: Partial<Omit<CollectionCriterion, 'id'>>) {
    const criterion = criteria.value.filters.find((candidate) => candidate.id === id)
    if (!criterion) {
      return
    }
    const wasComplete = isCriterionComplete(criterion)
    Object.assign(criterion, patch)
    // A criterion unanswerable on both sides of the patch was left out of the request before and
    // is left out of it after, so asking again would ask what is already on screen — and would
    // take the caller back to its first page to do it. Trying two operators before typing a value
    // is that case, and it is the common one.
    if (wasComplete || isCriterionComplete(criterion)) {
      refetchOnCriteriaChange()
    }
  }

  function removeFilter(id: number) {
    const criterion = criteria.value.filters.find((candidate) => candidate.id === id)
    if (!criterion) {
      return
    }
    criteria.value.filters = criteria.value.filters.filter((candidate) => candidate.id !== id)
    // One that was never answerable was never sent, and dropping it widens nothing. A filter the
    // caller opened and left closes that way, so this is the path most removals take.
    if (isCriterionComplete(criterion)) {
      refetchOnCriteriaChange()
    }
  }

  /**
   * Reads the collection on [field], ascending, then descending, then back to the order the
   * collection takes on its own. A header names one key at a time; the criteria hold a list because
   * the grammar does.
   */
  function toggleSort(field: string) {
    const current = criteria.value.sort
    const only = current.length === 1 && current[0].field === field ? current[0] : undefined
    if (!only) {
      criteria.value.sort = [{ field, descending: false }]
    } else if (!only.descending) {
      criteria.value.sort = [{ field, descending: true }]
    } else {
      criteria.value.sort = []
    }
    void fetch(0)
  }

  // Adjusts the number of items per page. The page holding the first item currently displayed is
  // requested again, so resizing the viewport keeps the operator roughly in place.
  function setSize(newSize: number) {
    if (newSize < 1 || newSize === size.value) {
      return
    }
    const firstItem = page.value * size.value
    size.value = newSize
    if (loaded.value) {
      void fetch(Math.floor(firstItem / newSize))
    }
  }

  return reactive({
    items,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    capabilities,
    capabilitiesError,
    criteria,
    filters,
    searchable,
    sortKeys,
    sortsOn,
    fetch,
    setSize,
    setSearch,
    addFilter,
    updateFilter,
    removeFilter,
    toggleSort
  }) as Collection<T>
}
