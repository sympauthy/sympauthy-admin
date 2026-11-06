/**
 * The nearest ancestor of [element] that scrolls vertically, which in the panel is the app shell's
 * box rather than the window.
 */
export function scrollParent(element: Element): Element | null {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const { overflowY } = getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent
    }
  }
  return null
}
