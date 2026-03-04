export type ButtonStyle = {
  /**
   * CSS classes applied to the button when it is active.
   */
  activeClasses: string
  /**
   * CSS classes applied to the button when it is loading.
   */
  loadingClasses: string
  /**
   * CSS classes applied to the button when it is submitting.
   */
  submittingClasses: string
  /**
   * CSS classes applied to the button when it is disabled.
   */
  disabledClasses: string
}

export const primaryColoredButton: ButtonStyle = Object.freeze({
  activeClasses: 'bg-[--color-primary] text-[color:var(--color-on-primary)]',
  loadingClasses: 'bg-[--color-primary] text-[--color-on-primary] cursor-wait',
  submittingClasses: 'bg-[--color-primary] text-[--color-on-primary] cursor-wait',
  disabledClasses: 'bg-[--color-disabled] text-[--color-on-disabled] pointer-events-none'
})
