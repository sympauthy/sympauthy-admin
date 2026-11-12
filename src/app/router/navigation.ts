/** One page the sidebar offers. */
export interface NavEntry {
  /** The route it opens. Its `requiredScopes` decide whether it is drawn enabled or disabled. */
  name: string
  label: string
  /**
   * `false` for a page about the panel rather than the server, which `/` never lands on: the
   * preferences open under no scope, so landing there would hide the no-access page from a token
   * that opens nothing else.
   */
  landing?: boolean
}

/** A group of entries under one heading. */
export interface NavSection {
  label: string
  entries: NavEntry[]
}

/**
 * The panel's own index of its pages: the sections the sidebar draws, in the order it draws them —
 * the most used first, sections and the entries in each alike.
 *
 * The router reads the same list to decide where `/` lands — the first entry the token can open
 * that is not marked `landing: false` — so the sidebar and the landing cannot disagree about which
 * comes first.
 */
export const navSections: NavSection[] = [
  {
    label: 'nav.sectionUsers',
    entries: [
      { name: 'users', label: 'nav.users' },
      { name: 'grants', label: 'nav.grants' },
      { name: 'invitations', label: 'nav.invitations' }
    ]
  },
  {
    label: 'nav.sectionDiagnostics',
    entries: [{ name: 'sessions', label: 'nav.sessions' }]
  },
  {
    label: 'nav.sectionConfiguration',
    entries: [
      { name: 'clients', label: 'nav.clients' },
      { name: 'claims', label: 'nav.claims' },
      { name: 'scopes', label: 'nav.scopes' },
      { name: 'audiences', label: 'nav.audiences' }
    ]
  },
  {
    label: 'nav.sectionAdmin',
    entries: [{ name: 'preferences', label: 'nav.preferences', landing: false }]
  }
]

/** Every entry of [navSections], flattened, in the order the sidebar offers them. */
export const navEntries: NavEntry[] = navSections.flatMap((section) => section.entries)
