---
description: How a standard in `docs/` is written — the shape of a rule, and what a standard
  states in place of code.
paths:
  - "docs/*-standard.md"
  - ".claude/rules/*-standard.md"
---

# Documentation standard

How a standard in `docs/` is written — a document named `<subject>-standard.md`. The other documents
there are descriptions, and [the index](index.md) says what each of them covers.

## Shape of a standard

**A standard is named `<subject>-standard.md` and holds one subject's rules.** Link to the standard
that owns a neighbouring rule.

**A rule leads in bold, and at most two sentences follow it.** Those sentences carry further
directive — what to write, what to name, what to do next.

```markdown
**A page showing a collection is built from `CollectionPage`, and `CollectionPage` is the page's
root element.** Nothing wraps it, so the toolbar and the table fill the height the layout gives
them.
```

**A rule is written as what to do.** State the form the reader has to produce.

**An example shows a compliant case, in five lines or fewer.** Add one where showing the form is
shorter than stating it.

**Enumerable rules go in a table.** Keep a cell to a value or a short phrase, and write anything
longer as a paragraph.

**What a standard deliberately leaves open is written down in a closing section.** Name the subject
and say that it is open.

**A standard ends with a horizontal rule and a link back to the index.**

## Frontmatter

**A standard opens with frontmatter.** The block carries two keys, and the heading under it names
the standard.

```yaml
---
description: <what the standard governs, in one line>
paths:
  - "<a glob from the repository root>"
---
```

**`description` says what the standard governs, in one line.** Write it so that it stays true when a
rule inside changes. Continue it on an indented line past 100 columns.

**`paths` lists quoted globs, and it is what loads the standard.** A standard reaches an agent when
a file one of its globs matches is read. Keep every glob matching something, and move a glob when
the slice it names moves.

**The key is spelled `paths`, the way the tooling that reads it spells it.** Rename it here when
what reads it renames it.

## What a standard names

**A shape carries the rule.** Write the pattern a name, a path or a key must match — `…Api`,
`use…Store`, `pages.<route>.<key>`. The shape is the whole instruction.

**A name that is itself the rule is written as it is.** The base class an API client extends, the
component a dialog is built on and the segment a file belongs in are named directly.

**A place the rule sends the reader to is named in full.** Spell out the file, the component or the
folder the change is unfinished without — the slice's `index.ts` a new export is added to, the
bundle a new string is written in.

**A set that will grow is described by its criterion**, with the source of truth named as
authoritative: the route table, the exported public API, the configuration. Name a member as an
illustration of the criterion.

```markdown
**A slice publishes its public API from its `index.ts`.** What a slice publishes today is that file.
```

**A set that will grow is never counted.** A rule saying *both*, *twice* or *the third page* is
false the day a fourth entity, page or locale arrives, so write it at any size — *once per locale*,
*a bundle per locale* — and let the criterion say what the members are.

## What a standard sends elsewhere

**A rule the code breaks is still written as the rule.** File the breach as an issue and leave the
standard unqualified.

**A follow-up is filed once the tracker has been searched for one that covers it.** Broaden an
existing issue where it is too narrow.

**A departure is documented where it departs.** The component that breaks a pattern carries the
reason in [its own comment](general-code-standard.md#comments). A carve-out belongs in a standard
when a second case would also fall under it.

**A fact about one component is documented in that component**, as a
[comment](general-code-standard.md#comments). A standard carries what has a shape.

## A standard says what is true now

**A standard describes the design as it stands.** Write what to build today.

**A standard is edited in place.** Rewrite the sentence that stopped being true, so that one
question has one answer.

**The history stays in git and in the tracker.** Both hold the previous version beside the change
that caused it and the discussion that settled it.

## Mechanics

**Wrap at 100 columns and write headings in sentence case.**

**Write plain Markdown.** Keep to what GitHub and an IDE both render.

**Link between documents relatively, keeping the `.md`.** Link to the [public
documentation](https://sympauthy.github.io) with an absolute URL.

**A new standard joins [the index](index.md)'s standards section in the same commit, and is
symlinked into `.claude/rules/`.** The symlink carries the [frontmatter](#frontmatter) with it.

## What this standard does not cover

**Descriptions.** [The index](index.md) names them, and nothing here says how one is written.

**The public documentation.** It is written in another repository, and nothing here governs it.

**The README.** It addresses somebody setting the project up, not somebody changing it.

**Diagrams.** No document draws one, and no format is set for the first that does.

**Checking.** Nothing verifies a link, a glob or an anchor; each is kept true by whoever moves what
it names.

---

← [Design documentation](index.md)
