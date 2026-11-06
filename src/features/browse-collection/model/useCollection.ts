import { computed, onUnmounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  saFilterKnownFields,
  useSaFilters,
  useSaListGrows,
  useSaSort,
  type SaFilters,
  type SaSort
} from '@sympauthy/design'
import {
  getErrorMessage,
  isSuccess,
  type CollectionCapabilitiesResource,
  type CollectionPageResource,
  type ErrorApiResponse,
  type SuccessApiResponse
} from '@/shared/api'
import { collectionQueryParams, collectionSortKeys } from './CollectionCriteria'
import {
  collectionReturnWithin,
  keepCollectionReturn,
  takeCollectionReturn
} from './CollectionReturn'

/**
 * A criteria change waits this long before it is asked of the server, so that the letters of a word
 * being typed are one request, and so that a filter switching operator does not ask once for the new
 * operator against the old value. Paging, sorting and resizing are not delayed: each is one
 * deliberate act.
 */
const CRITERIA_DELAY_IN_MS = 250

/**
 * The rows a phone's list asks for at a time. It more than fills a phone, so the first page does not
 * ask for the second as soon as it lands, and the list's end is reached only once it is scrolled.
 */
const GROWING_PAGE_SIZE = 20

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
   * What tells one record from another, as the row's `:key` does. A list that grows adds pages read
   * by offset, and a record that moved ahead of the rows already read comes back on the next page:
   * it is listed once.
   */
  key: (item: T) => string
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
  /** The rows a page holds: those that fit the card from `sm:`, and a phone's own below it. */
  readonly size: number
  total: number
  readonly totalPages: number
  /**
   * Whether the list grows as it is scrolled, below `sm:`, rather than paging. Each page it asks
   * for is then added below the rows it holds, and [page] is the last one added.
   */
  readonly grows: boolean
  /** Whether the server holds rows past the last one drawn. */
  readonly hasMore: boolean
  /** True while the page [fetchMore] asked for is on its way, which leaves the rows in place. */
  moreLoading: boolean
  /** Why the last page [fetchMore] asked for could not be added. */
  moreError: string | null
  /**
   * Whether the screen has made its first read through [load], and so has what its rows are drawn
   * with: a list handed back is only scrolled or grown from then.
   */
  readonly opened: boolean
  capabilities: CollectionCapabilitiesResource | null
  /** Set where the document could not be read; the records are still listed without it. */
  capabilitiesError: string | null
  /** The free text the collection is searched by. */
  query: string
  /** What narrows it, over the fields the collection filters on that the package can draw. */
  readonly filters: SaFilters
  /** The order it reads in, which is the collection's own where none was asked. */
  readonly sort: SaSort
  readonly searchable: boolean
  /** What a column over [field] hands `SaTableHeader` as `filteredLabel`. */
  filteredLabel: (field: string) => string | undefined
  /**
   * The first read of the screen: the first page, unless the operator came back to a phone's list
   * from one of its rows, which finds it as they left it.
   */
  load: () => Promise<void>
  /** Reads [page] in place of the rows. A list that grows reads its first page again. */
  fetch: (page?: number) => Promise<void>
  /** Adds the page after the last one read below the rows, on a list that grows. */
  fetchMore: () => Promise<void>
  setSize: (size: number) => void
  setSearch: (query: string) => void
  /** Where the operator had scrolled a phone's list to when they left it, to put them back. */
  readonly returnedScroll: number | null
  /** Records where the list is scrolled to as the screen is left, for [returnedScroll]. */
  keepScroll: (scrollTop: number) => void
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
 *
 * The one thing that outlives the screen is a phone's list left for one of its rows: it is kept
 * while the operator stays under that row, and handed back to the screen they return to.
 */
export function useCollection<T, R extends CollectionPageResource>(
  source: CollectionSource<T, R>
): Collection<T> {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const grows = useSaListGrows()

  // Read once: the path of this screen, which the one an operator returns to has to match.
  const listPath = route.path
  // Taken at every width, so that a list kept on a phone and come back to on a wider screen is
  // dropped rather than handed back long after.
  const kept = takeCollectionReturn(listPath)
  const returned = grows.value ? kept : undefined

  const items = ref((returned?.items as T[]) ?? []) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(returned?.page ?? 0)
  // The rows that fit the card from `sm:`, which `SaTable` measures and a phone does not.
  const fittingSize = ref(20)
  const size = computed(() => (grows.value ? GROWING_PAGE_SIZE : fittingSize.value))
  const total = ref(returned?.total ?? 0)
  const moreLoading = ref(false)
  const moreError = ref<string | null>(null)

  const capabilities = ref<CollectionCapabilitiesResource | null>(returned?.capabilities ?? null)
  const capabilitiesError = ref<string | null>(null)
  const query = ref(returned?.query ?? '')

  // Set once a first response has arrived. A page size change before that would request a page the
  // component is about to request anyway.
  const loaded = ref(returned !== undefined)
  // Consumed by the first `load`, which then reads nothing.
  let returning = returned !== undefined
  const opened = ref(false)
  const returnedScroll = returned?.scrollTop ?? null
  let scrollTop = 0
  let capabilitiesInFlight = false
  let criteriaTimeout: ReturnType<typeof setTimeout> | undefined
  // Which page request is the current one. A response from any earlier one is dropped rather than
  // painted: two requests can be in flight — a debounced criteria change and a page click — and the
  // one that answers last is not the one the caller is waiting for.
  let currentRequest = 0

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))
  const hasMore = computed(() => !error.value && page.value + 1 < totalPages.value)
  const searchable = computed(() => (capabilities.value?.search?.fields.length ?? 0) > 0)

  const filters = useSaFilters({
    fields: () => saFilterKnownFields(capabilities.value?.filters ?? []),
    onChange: refetchOnCriteriaChange,
    initial: returned?.filters
  })

  const sort = useSaSort({
    fields: () => capabilities.value?.sorts ?? [],
    defaultKeys: () => collectionSortKeys(capabilities.value?.default_sort),
    // One deliberate act, so it is not delayed.
    onChange: () => void fetch(0),
    initial: returned?.sort
  })

  function filteredLabel(field: string): string | undefined {
    return filters.isFiltered(field) ? t('common.collection.filtered') : undefined
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
      capabilitiesError.value = getErrorMessage(response)
    }
  }

  function readPage(requestedPage: number): ApiResponse<R> {
    return source.page({
      ...(source.selection?.() ?? {}),
      ...collectionQueryParams(
        { filters: filters.complete, sort: sort.asked, query: query.value },
        requestedPage,
        size.value
      )
    })
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
    moreLoading.value = false
    moreError.value = null

    // The table's wait replaces the rows and the scroll with them, so a list that grows starts over
    // from its first page rather than holding a later one alone.
    const response = await readPage(grows.value ? 0 : requestedPage)

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
      error.value = getErrorMessage(response)
      items.value = []
    }

    loaded.value = true
    loading.value = false
  }

  async function fetchMore(): Promise<void> {
    // A criterion waiting to be asked has already changed what a page is read under, and the first
    // page it reads replaces the rows: a page added now would belong to neither list.
    if (
      !grows.value ||
      !opened.value ||
      criteriaTimeout ||
      loading.value ||
      moreLoading.value ||
      !hasMore.value
    ) {
      return
    }

    const request = ++currentRequest
    moreLoading.value = true
    moreError.value = null

    const response = await readPage(page.value + 1)

    // Superseded by a read of the first page, which has reset the end of the list itself.
    if (request !== currentRequest) {
      return
    }

    if (isSuccess<R>(response)) {
      const listed = new Set(items.value.map(source.key))
      const added = source.items(response.content).filter((item) => !listed.has(source.key(item)))
      items.value = [...items.value, ...added]
      page.value = response.content.page
      total.value = response.content.total
    } else {
      // The rows already read stay: what failed is the page after them, and the end retries it.
      moreError.value = getErrorMessage(response)
    }

    moreLoading.value = false
  }

  function load(): Promise<void> {
    opened.value = true
    if (returning) {
      returning = false
      // A document that failed was not kept, and is asked for again as a first page would.
      if (!capabilities.value) {
        void fetchCapabilities()
      }
      return Promise.resolve()
    }
    return fetch(0)
  }

  /**
   * Asks the first page again once the criteria have settled. A narrowed collection has a different
   * first page, so the one being read is never the one to come back to.
   */
  function refetchOnCriteriaChange() {
    if (criteriaTimeout) {
      clearTimeout(criteriaTimeout)
    }
    criteriaTimeout = setTimeout(() => {
      criteriaTimeout = undefined
      void fetch(0)
    }, CRITERIA_DELAY_IN_MS)
  }

  function setSearch(typed: string) {
    query.value = typed
    refetchOnCriteriaChange()
  }

  // Adjusts the number of items per page. The page holding the first item currently displayed is
  // requested again, so resizing the viewport keeps the operator roughly in place.
  function setSize(newSize: number) {
    if (newSize < 1 || newSize === fittingSize.value) {
      return
    }
    const firstItem = page.value * fittingSize.value
    fittingSize.value = newSize
    if (loaded.value && !grows.value) {
      void fetch(Math.floor(firstItem / newSize))
    }
  }

  // Crossing `sm:` turns pages into a list that grows or back, and what was read is neither: the
  // first page is read again in the other way, and so is one still on its way, asked at the size
  // being left. A size `SaTable` measures on the way is asked from there too.
  watch(grows, () => {
    page.value = 0
    if (loaded.value || loading.value) {
      void fetch(0)
    }
  })

  function keepScroll(top: number) {
    scrollTop = top
  }

  // After the screen's children have gone, so that `CollectionPage` has recorded the scroll, and
  // after the navigation, so that where the operator went is known. Only a row of this list, or a
  // screen under it, is a place they come back from.
  //
  // A criterion still waiting is dropped with the screen, and the list is not kept: its rows were
  // read under what the operator had typed before.
  onUnmounted(() => {
    const pending = criteriaTimeout !== undefined
    clearTimeout(criteriaTimeout)
    criteriaTimeout = undefined

    const to = router.currentRoute.value.path
    if (
      pending ||
      !grows.value ||
      !loaded.value ||
      loading.value ||
      error.value ||
      to === listPath ||
      !collectionReturnWithin(to, listPath)
    ) {
      return
    }
    keepCollectionReturn(router, listPath, {
      items: items.value,
      page: page.value,
      total: total.value,
      query: query.value,
      filters: filters.criteria.map((criterion) => ({ ...criterion })),
      sort: sort.asked,
      capabilities: capabilities.value,
      scrollTop
    })
  })

  return reactive({
    items,
    loading,
    error,
    page,
    size,
    total,
    totalPages,
    grows,
    hasMore,
    moreLoading,
    moreError,
    opened,
    capabilities,
    capabilitiesError,
    query,
    filters,
    sort,
    searchable,
    filteredLabel,
    load,
    fetch,
    fetchMore,
    setSize,
    setSearch,
    returnedScroll,
    keepScroll
  }) as Collection<T>
}
