import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { type ErrorApiResponse, isSuccess } from '@/shared/api'
import { setLanguage } from '@/shared/i18n'
import { setDateDisplay } from '@/shared/lib'
import { OwnClaimApi } from '../api/OwnClaimApi'
import {
  DEFAULT_PREFERENCES,
  isSavedAfter,
  PREFERENCES_CLAIM,
  type Preferences,
  readPreferencesDocument,
  type SavedPreferences,
  toPreferencesDocument
} from './Preferences'

/**
 * Why the server did not keep a copy of the preferences. `refused` is any answer it gave, which
 * trying again will not change; `unreachable` is no answer at all, which the next try may get.
 */
export type PreferencesNotKept = 'refused' | 'unreachable'

/** What the browser keeps for one operator: their document, and whether the server took it. */
interface BrowserCopy {
  saved: SavedPreferences
  taken: boolean
}

// The stylesheet follows the device on its own. A script asks the same query for what a stylesheet
// cannot choose: which logo a screen outside the shell draws on its ground.
const darkDevice = window.matchMedia('(prefers-color-scheme: dark)')
const deviceIsDark = ref(darkDevice.matches)
darkDevice.addEventListener('change', (event) => {
  deviceIsDark.value = event.matches
})

/** Keyed by the operator's `sub`, so a second operator on the same browser never reads the first's. */
function storageKey(operator: string): string {
  return `sympauthy-admin.preferences.${operator}`
}

// Storage can be refused outright, by a private window or a policy, and a preference the browser
// cannot keep is then the account's alone rather than a screen that fails to draw.
function readBrowserCopy(operator: string): BrowserCopy | undefined {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(operator)) ?? 'null')
    const saved = readPreferencesDocument(stored?.document)
    return saved ? { saved, taken: stored.taken === true } : undefined
  } catch {
    return undefined
  }
}

function writeBrowserCopy(operator: string, copy: BrowserCopy): void {
  const { preferences, updatedAt } = copy.saved
  // An undated document stays undated: stamping it now would make it newer than the account it
  // was read from, and the next startup would write it back for nothing.
  const document = toPreferencesDocument(preferences, updatedAt)
  try {
    localStorage.setItem(storageKey(operator), JSON.stringify({ document, taken: copy.taken }))
  } catch (error) {
    console.error('Could not keep the preferences in this browser.', error)
  }
}

// A failure the server answered carries the response it came in, and is a refusal whatever it says:
// none of them is the operator's to change. One with none never reached the server.
function notKept(response: ErrorApiResponse): PreferencesNotKept {
  return response.response === undefined ? 'unreachable' : 'refused'
}

export const usePreferencesStore = defineStore('preferences', () => {
  const api = new OwnClaimApi()

  const preferences = shallowRef<Preferences>(DEFAULT_PREFERENCES)
  const darkModeAvailable = ref(true)
  /** The operator whose preferences are applied, once their browser copy has been. */
  const operator = ref<string | null>(null)
  /** Why the browser's copy is not on the account, from the write that failed until one succeeds. */
  const notKeptReason = ref<PreferencesNotKept | null>(null)
  // Counts the saves, so a startup still reading the account knows one ran under it: what the
  // operator just chose is never replaced by what the account held before they chose it.
  let saves = 0

  /** Whether the panel is drawn dark, for what the stylesheet cannot choose. */
  const dark = computed(
    () =>
      darkModeAvailable.value &&
      (preferences.value.theme === 'dark' ||
        (preferences.value.theme === 'system' && deviceIsDark.value))
  )

  function applyTheme(): void {
    const { dataset } = document.documentElement
    // A deployment whose stylesheet carries no dark values pins the page light: following a dark
    // device would draw the light values on a dark-scheme page.
    const theme = darkModeAvailable.value ? preferences.value.theme : 'light'
    if (theme === 'system') {
      delete dataset.theme
    } else {
      dataset.theme = theme
    }
  }

  function apply(next: Preferences): void {
    preferences.value = next
    applyTheme()
    setLanguage(next.language)
    setDateDisplay({ format: next.dateFormat, timeZone: next.timeZone })
  }

  /**
   * Whether this deployment draws dark at all, as its `brand.json` says. Called once, before the
   * first screen.
   */
  function setDarkModeAvailable(available: boolean): void {
    darkModeAvailable.value = available
    applyTheme()
  }

  /**
   * Applies the browser's copy of [stored]'s preferences, before anything is mounted. [stored] is
   * the operator the browser holds a session for, which [start] confirms once the guard has signed
   * them in, so the screens before it — the wait, the sign-in callback — are drawn with their copy.
   */
  function applyBrowserCopy(stored: string): void {
    const copy = readBrowserCopy(stored)
    if (copy !== undefined) {
      apply(copy.saved.preferences)
    }
  }

  async function writeToAccount(saved: SavedPreferences): Promise<ErrorApiResponse | undefined> {
    const document = toPreferencesDocument(
      saved.preferences,
      saved.updatedAt ?? new Date().toISOString()
    )
    const response = await api.updateOwnClaims({ [PREFERENCES_CLAIM]: document })
    return isSuccess(response) ? undefined : response
  }

  /**
   * Applies [signedIn]'s preferences: the browser's copy at once, so the screen is drawn with it,
   * then the account's where it wins. The browser's is written to the account where it was saved
   * more recently and the account has not taken it yet. Called on every navigation, and does
   * nothing for an operator already applied.
   */
  async function start(signedIn: string): Promise<void> {
    if (operator.value === signedIn) {
      return
    }
    operator.value = signedIn
    notKeptReason.value = null
    const copy = readBrowserCopy(signedIn)
    apply(copy?.saved.preferences ?? DEFAULT_PREFERENCES)

    const savesBefore = saves
    const superseded = () => operator.value !== signedIn || saves !== savesBefore
    const response = await api.getOwnClaims()
    if (superseded()) {
      return
    }
    if (!isSuccess(response)) {
      if (copy !== undefined && !copy.taken) {
        notKeptReason.value = notKept(response)
      }
      return
    }

    const account = readPreferencesDocument(response.content.claims[PREFERENCES_CLAIM])
    // A copy the account took and no longer matches was replaced there since, from another browser,
    // so the account wins whatever the two clocks say. Only a copy it never took is compared.
    const accountWins =
      account !== undefined &&
      (copy === undefined || copy.taken || isSavedAfter(account, copy.saved))
    if (accountWins) {
      apply(account.preferences)
      writeBrowserCopy(signedIn, { saved: account, taken: true })
    } else if (copy !== undefined && (account === undefined || isSavedAfter(copy.saved, account))) {
      const failure = await writeToAccount(copy.saved)
      if (superseded()) {
        return
      }
      writeBrowserCopy(signedIn, { saved: copy.saved, taken: failure === undefined })
      notKeptReason.value = failure ? notKept(failure) : null
    } else if (copy !== undefined && !copy.taken) {
      // Saved at the same moment as the account's: the account holds it already.
      writeBrowserCopy(signedIn, { saved: copy.saved, taken: true })
    }
  }

  /**
   * Applies [next] at once, then saves it to the account, and to the browser whatever the account
   * answered. Resolves to why the account did not keep it, or `undefined` where it did.
   */
  async function save(next: Preferences): Promise<PreferencesNotKept | undefined> {
    saves++
    // The operator who pressed Save, whoever is signed in once the account has answered.
    const savedBy = operator.value
    const saved: SavedPreferences = { preferences: next, updatedAt: new Date().toISOString() }
    apply(next)
    const failure = await writeToAccount(saved)
    if (savedBy !== null) {
      writeBrowserCopy(savedBy, { saved, taken: failure === undefined })
    }
    const reason = failure ? notKept(failure) : undefined
    if (savedBy === operator.value) {
      notKeptReason.value = reason ?? null
    }
    return reason
  }

  return {
    preferences,
    darkModeAvailable,
    dark,
    notKeptReason,
    setDarkModeAvailable,
    applyBrowserCopy,
    start,
    save
  }
})
