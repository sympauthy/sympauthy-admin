import type { NamedValue } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

const getNavigatorLanguage = () => {
  if (navigator.languages && navigator.languages.length) {
    return navigator.languages[0]
  } else {
    // @ts-expect-error navigator.userLanguage is a legacy IE property not in DOM types
    return navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en'
  }
}

export const i18n = createI18n({
  locale: getNavigatorLanguage(),
  fallbackLocale: 'en',
  messages: messages,

  // Remove warning when translation is missing
  fallbackWarn: false,
  missingWarn: false
})

export function translateMessage(messageKey: string, values?: NamedValue): string {
  if (!values) {
    values = {}
  }
  const { t } = i18n.global
  return t(messageKey, values)
}

/**
 * Translates a message, falling back to a label the API supplied when this admin panel holds no
 * translation for it. The fallback is returned as it arrived: a label written by the server is data
 * rather than a message format.
 */
export function translateMessageOr(messageKey: string, fallback: string): string {
  const { t } = i18n.global
  // A key this panel does not know resolves to the key itself.
  const message = t(messageKey)
  return message === messageKey ? fallback : message
}
