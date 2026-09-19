import { onBeforeUnmount, onMounted, onUpdated, type Ref } from 'vue'

// Metrics used before the table has rendered any row, matching the `px-6 py-3` header cells shared
// by every table of the admin panel. The row height is the one of the tallest kind of row (a row
// holding action buttons): overestimating leaves a gap under the last row until the real height is
// known, where underestimating would request more rows than fit and make the table scroll.
const FALLBACK_HEADER_HEIGHT = 40
const FALLBACK_ROW_HEIGHT = 72

// A viewport change smaller than this is ignored, in either direction: a scrollbar appearing or
// disappearing resizes the viewport by ~15px and would otherwise feed back into the page size.
const RESIZE_THRESHOLD = 24

export interface AutoPageSizeOptions {
  /** Measuring is skipped entirely while this returns false. */
  enabled?: () => boolean
  minSize?: number
  maxSize?: number
  /** Called whenever the number of rows that fit the viewport changes. */
  onChange: (size: number) => void
}

/**
 * Derives the number of rows that fit the height of a table viewport, so a list can fill the page
 * without scrolling. `viewport` must be an element whose height is set by the layout (and not by
 * its content), otherwise the rows it receives would change the height it is measured from.
 */
export function useAutoPageSize(viewport: Ref<HTMLElement | null>, options: AutoPageSizeOptions) {
  const { enabled = () => true, minSize = 1, maxSize = 100, onChange } = options

  let currentSize = 0
  // 0 until measured from real rows, and the last known height whenever there are none to measure
  // — the loading, error and empty states render no row.
  let rowHeight = 0
  // Set once the table has been rendered, and never cleared: it says the metrics of the state the
  // rows are displayed in have been seen at least once, which `rowHeight` cannot say on its own
  // since a resize clears it.
  let tableRendered = false
  let observedHeight = 0
  let observedWidth = 0
  let observer: ResizeObserver | undefined

  function measureRowHeight(element: HTMLElement): number {
    const rows = element.querySelectorAll<HTMLElement>('tbody tr')
    if (rows.length === 0) {
      return 0
    }
    let total = 0
    for (const row of rows) {
      total += row.getBoundingClientRect().height
    }
    return total / rows.length
  }

  function measure() {
    const element = viewport.value
    if (!element || !enabled()) {
      return
    }

    const header = element.querySelector<HTMLElement>('thead')
    // The table is replaced by the loading, error or empty state, and the height it leaves is not
    // the one the rows are displayed in: its header is gone and so is the horizontal scrollbar a
    // wide table adds. Measuring it anyway would make the two states take turns forever, since the
    // size each one derives triggers a request that renders the other. Only the measurements taken
    // before the table has ever been rendered go ahead without one — they have nothing else to size
    // the first request from. A later resize is answered when the table comes back, which `onUpdated`
    // reports.
    if (!header && tableRendered) {
      return
    }
    tableRendered = tableRendered || header !== null

    const available =
      element.clientHeight -
      (header ? header.getBoundingClientRect().height : FALLBACK_HEADER_HEIGHT)
    if (available <= 0) {
      return
    }

    // Re-measured whenever there are rows to measure, rather than kept from the first reading. A
    // measurement taken as a breakpoint lands reads a layout half-left — a header that has not
    // reappeared, a padding that has not stepped — and a reading kept from then on would never be
    // corrected, since nothing clears it but another resize. What makes that safe is that a row's
    // height does not depend on how many rows were asked for, so a measurement cannot chase the
    // size it produced; `onUpdated` runs this again once the rows it asked for are on the screen,
    // and the second pass settles it.
    const measured = measureRowHeight(element)
    if (measured > 0) {
      rowHeight = measured
    }

    const fitting = Math.floor(available / (rowHeight || FALLBACK_ROW_HEIGHT))
    const size = Math.min(Math.max(fitting, minSize), maxSize)
    if (size !== currentSize) {
      currentSize = size
      onChange(size)
    }
  }

  onMounted(() => {
    if (!enabled()) {
      return
    }

    // Measured synchronously: child components are mounted before their parent, so the page size is
    // known before the page requests its first batch of items.
    observedHeight = viewport.value?.clientHeight ?? 0
    observedWidth = viewport.value?.clientWidth ?? 0
    measure()

    if (!viewport.value) {
      return
    }
    // Width is watched beside height because it decides how tall a row is: below `sm:` a row is
    // drawn as a card, so a window narrowed across that breakpoint at one height leaves the
    // measured row height describing a layout that is no longer on the screen.
    observer = new ResizeObserver(() => {
      const element = viewport.value
      if (!element) {
        return
      }
      const height = element.clientHeight
      const width = element.clientWidth
      if (
        Math.abs(height - observedHeight) < RESIZE_THRESHOLD &&
        Math.abs(width - observedWidth) < RESIZE_THRESHOLD
      ) {
        return
      }
      observedHeight = height
      observedWidth = width
      rowHeight = 0
      // Two frames, not one: the first is where the breakpoint's own layout lands, and measuring a
      // row in it reads the height of the arrangement being left rather than the one arriving.
      requestAnimationFrame(() => requestAnimationFrame(measure))
    })
    observer.observe(viewport.value)
  })

  // Rows are only rendered once the first response arrives: re-measuring on update replaces the
  // fallback row height by the real one.
  onUpdated(measure)

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = undefined
  })

  return { measure }
}
