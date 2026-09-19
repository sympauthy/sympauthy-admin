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
  activeClasses: 'border-transparent bg-primary text-on-primary hover:bg-primary-hover',
  loadingClasses: 'border-transparent bg-primary text-on-primary cursor-wait',
  submittingClasses: 'border-transparent bg-primary text-on-primary cursor-wait',
  disabledClasses: 'border-transparent bg-disabled text-on-disabled pointer-events-none'
})

export const secondaryColoredButton: ButtonStyle = Object.freeze({
  activeClasses: 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200',
  loadingClasses: 'border-gray-200 bg-gray-100 text-gray-700 cursor-wait',
  submittingClasses: 'border-gray-200 bg-gray-100 text-gray-700 cursor-wait',
  disabledClasses: 'border-transparent bg-disabled text-on-disabled pointer-events-none'
})

export const dangerColoredButton: ButtonStyle = Object.freeze({
  activeClasses: 'border-transparent bg-red-600 text-white hover:bg-red-700',
  loadingClasses: 'border-transparent bg-red-600 text-white cursor-wait',
  submittingClasses: 'border-transparent bg-red-600 text-white cursor-wait',
  disabledClasses: 'border-transparent bg-disabled text-on-disabled pointer-events-none'
})
