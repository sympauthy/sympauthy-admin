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

const FALLBACK_LOCALE = 'en'

export const i18n = createI18n({
  locale: getNavigatorLanguage(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: messages,

  // Remove warning when translation is missing
  fallbackWarn: false,
  missingWarn: false
})

/**
 * The locale the panel is actually rendering in, which is what a request asks the server to answer
 * in.
 *
 * It is the locale a bundle exists for rather than the one the browser asked for. A deployment
 * shipping only `en.json` renders English for a French browser through the fallback, and asking the
 * server for French would put French field names inside an English screen — the mixed answer this
 * exists to prevent. A language the bundles hold under a plain tag answers a regional one: `fr-CA`
 * is served by `fr` where there is an `fr`.
 *
 * `i18n.global.locale` is a string under the legacy mode and a ref under the composition one, and
 * which of the two this is depends on the version rather than on anything written here.
 */
export function currentLocale(): string {
  const locale = i18n.global.locale
  const requested = typeof locale === 'string' ? locale : locale.value
  const available = i18n.global.availableLocales as string[]

  if (available.includes(requested)) {
    return requested
  }
  const language = requested.split('-')[0]
  return available.find((candidate) => candidate.split('-')[0] === language) ?? FALLBACK_LOCALE
}

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
