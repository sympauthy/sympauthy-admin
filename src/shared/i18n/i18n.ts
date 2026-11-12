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
  // The Composition API mode, which vue-i18n 12 leaves as the only one. Every component here reads
  // the global bundle through a no-argument `useI18n()`, which resolves to the same scope either
  // way, so the mode is a choice about which versions this panel can take rather than about what a
  // screen renders.
  legacy: false,

  locale: getNavigatorLanguage(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: messages,

  // Remove warning when translation is missing
  fallbackWarn: false,
  missingWarn: false
})

/**
 * Renders the panel in [language], or in the browser's where it is `undefined`, from the next render
 * on. The document's `lang` follows the bundle the screens are read from.
 */
export function setLanguage(language: string | undefined): void {
  i18n.global.locale.value = language ?? getNavigatorLanguage()
  document.documentElement.lang = currentLocale()
}

/** The languages a bundle exists for, each one a language the operator can choose. */
export function availableLanguages(): string[] {
  return [...(i18n.global.availableLocales as string[])].sort()
}

/**
 * The language asked for, whether or not a bundle exists for it: the browser's, or the one the
 * operator chose. A date written in the language's own format is written in this one, so a French
 * browser reading the English bundle keeps French dates.
 */
export function requestedLocale(): string {
  return i18n.global.locale.value
}

/**
 * The locale the panel is actually rendering in, which is what a request asks the server to answer
 * in.
 *
 * It is the locale a bundle exists for rather than the one the browser asked for. A deployment
 * shipping only `en.json` renders English for a French browser through the fallback, and asking the
 * server for French would put French field names inside an English screen — the mixed answer this
 * exists to prevent. A language the bundles hold under a plain tag answers a regional one: `fr-CA`
 * is served by `fr` where there is an `fr`.
 */
export function currentLocale(): string {
  const requested = requestedLocale()
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
