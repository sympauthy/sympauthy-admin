import type { NamedValue } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

const getNavigatorLanguage = () => {
  if (navigator.languages && navigator.languages.length) {
    return navigator.languages[0]
  } else {
    // @ts-ignore
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
