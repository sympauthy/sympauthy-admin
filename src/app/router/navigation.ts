/** One page the sidebar offers. */
export interface NavEntry {
  /** The route it opens. Its `requiredScopes` are what decides whether it is drawn. */
  name: string
  label: string
}

/** A group of entries under one heading, hidden when none of its entries is drawn. */
export interface NavSection {
  label: string
  entries: NavEntry[]
}

/**
 * The panel's own index of its pages: the sections the sidebar draws, in the order it draws them.
 *
 * The router reads the same list to decide where `/` lands — the first entry the token can open —
 * so a page reachable from the sidebar is a page the panel can land on, and the two cannot
 * disagree about which comes first.
 */
export const navSections: NavSection[] = [
  {
    label: 'nav.sectionUsers',
    entries: [
      { name: 'users', label: 'nav.users' },
      { name: 'invitations', label: 'nav.invitations' }
    ]
  },
  {
    label: 'nav.sectionConfiguration',
    entries: [
      { name: 'audiences', label: 'nav.audiences' },
      { name: 'clients', label: 'nav.clients' },
      { name: 'claims', label: 'nav.claims' },
      { name: 'scopes', label: 'nav.scopes' }
    ]
  },
  {
    label: 'nav.sectionDiagnostics',
    entries: [{ name: 'sessions', label: 'nav.sessions' }]
  }
]

/** Every entry of [navSections], flattened, in the order the sidebar offers them. */
export const navEntries: NavEntry[] = navSections.flatMap((section) => section.entries)
