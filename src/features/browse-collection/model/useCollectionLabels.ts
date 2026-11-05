import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  SaFilterLabels,
  SaFilterOperator,
  SaFilterType,
  SaSortLabels
} from '@sympauthy/design'

/**
 * The message key an operator is labelled from, for a field of [type].
 *
 * The four comparisons read differently over a moment than over a quantity — *is on or after*
 * rather than *is at least* — so a date's keys are their own; every other type reads the generic
 * wording, and [translateMessageOr] is not involved because the panel owns all of these strings.
 */
function operatorLabelKey(operator: SaFilterOperator, type: SaFilterType): string {
  const dated = type === 'date' || type === 'date_time'
  return dated ? `common.operators.date.${operator}` : `common.operators.${operator}`
}

/** The words the package's filters and order are drawn with, from the panel's bundle. */
export function useCollectionLabels() {
  const { t } = useI18n()

  const filters = computed<SaFilterLabels>(() => ({
    list: t('common.collection.activeFilters'),
    clear: t('common.collection.clearFilters'),
    add: t('common.addFilter'),
    searchFields: t('common.collection.searchFields'),
    searchValues: t('common.collection.searchValues'),
    noMatch: t('common.list.noMatch'),
    operator: t('common.collection.operator'),
    value: t('common.collection.value'),
    selectValue: t('common.collection.selectValue'),
    addValue: t('common.collection.addValue'),
    removeValue: t('common.remove'),
    yes: t('common.yes'),
    no: t('common.no'),
    removeFilter: () => t('common.collection.removeFilter'),
    operatorName: (operator, type) => t(operatorLabelKey(operator, type))
  }))

  const sort = computed<SaSortLabels>(() => ({
    sort: t('common.collection.sort'),
    search: t('common.collection.searchOrders'),
    noMatch: t('common.list.noMatch'),
    ascending: t('common.collection.ascending'),
    descending: t('common.collection.descending')
  }))

  return { filters, sort }
}
