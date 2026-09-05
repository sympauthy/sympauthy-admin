import { onBeforeUnmount, onMounted, onUpdated, type Ref } from 'vue'

// Metrics used before the table has rendered any row, matching the `px-6 py-3` header cells shared
// by every table of the admin panel. The row height is the one of the tallest kind of row (a row
// holding action buttons): overestimating leaves a gap under the last row until the real height is
// known, where underestimating would request more rows than fit and make the table scroll.
const FALLBACK_HEADER_HEIGHT = 40
const FALLBACK_ROW_HEIGHT = 72

// A viewport height change smaller than this is ignored: a horizontal scrollbar appearing or
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
  const { enabled = () => true, minSize = 5, maxSize = 100, onChange } = options

  let currentSize = 0
  // 0 until measured from real rows. Reset whenever the viewport is resized, since a breakpoint
  // change alters the cell padding.
  let rowHeight = 0
  let observedHeight = 0
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

  function measureHeaderHeight(element: HTMLElement): number {
    const header = element.querySelector<HTMLElement>('thead')
    return header ? header.getBoundingClientRect().height : FALLBACK_HEADER_HEIGHT
  }

  function measure() {
    const element = viewport.value
    if (!element || !enabled()) {
      return
    }

    const available = element.clientHeight - measureHeaderHeight(element)
    if (available <= 0) {
      return
    }

    // Measured once per viewport size: rows rendered after a size change were themselves sized by
    // the previous measurement, so measuring them again could make the page size oscillate.
    if (rowHeight === 0) {
      rowHeight = measureRowHeight(element)
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
    measure()

    if (!viewport.value) {
      return
    }
    observer = new ResizeObserver(() => {
      const height = viewport.value?.clientHeight ?? 0
      if (Math.abs(height - observedHeight) < RESIZE_THRESHOLD) {
        return
      }
      observedHeight = height
      rowHeight = 0
      requestAnimationFrame(measure)
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
