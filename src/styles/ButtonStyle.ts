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
  activeClasses: 'bg-(--color-primary) text-(--color-on-primary) hover:brightness-125 transition-all',
  loadingClasses: 'bg-(--color-primary) text-(--color-on-primary) cursor-wait',
  submittingClasses: 'bg-(--color-primary) text-(--color-on-primary) cursor-wait',
  disabledClasses: 'bg-(--color-disabled) text-(--color-on-disabled) pointer-events-none'
})

export const secondaryColoredButton: ButtonStyle = Object.freeze({
  activeClasses: 'bg-gray-100 text-gray-700 hover:brightness-125 transition-all',
  loadingClasses: 'bg-gray-100 text-gray-700 cursor-wait',
  submittingClasses: 'bg-gray-100 text-gray-700 cursor-wait',
  disabledClasses: 'bg-(--color-disabled) text-(--color-on-disabled) pointer-events-none'
})

export const dangerColoredButton: ButtonStyle = Object.freeze({
  activeClasses: 'bg-red-600 text-white hover:brightness-125 transition-all',
  loadingClasses: 'bg-red-600 text-white cursor-wait',
  submittingClasses: 'bg-red-600 text-white cursor-wait',
  disabledClasses: 'bg-(--color-disabled) text-(--color-on-disabled) pointer-events-none'
})
