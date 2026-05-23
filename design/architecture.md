# Bookmarks Weaver – Architecture

## Goal
Client-side React + TypeScript + Tailwind app that parses a URL into parts, lets the
user extract any substring into a named variable, defines values for those variables
as lists or tables, and generates a combinatorial set of URLs that can be exported as
a Netscape `bookmarks.html` file.

## State model
The single source of truth is `AppState`:

- `urlTemplate: string` – the URL as edited by the user, with `{name}` placeholders
  where variables have been extracted.
- `nameTemplate: string`, `folderTemplate: string`, `keywordsTemplate: string` –
  templates for the bookmark name, folder path and keywords.
- `variables: Variable[]` – ordered list of variables.
  - `ListVariable`: `{ id, name, kind: 'list', color, values: string[] }`
  - `TableVariable`: `{ id, name, kind: 'table', columns: { name, color, values[] }[] }`

`parseUrl(template)` returns a `ParsedUrl` derived view used by the UI.
`generateUrls(state)` cross-products list variables × table rows × templates and
returns `GeneratedBookmark[]`.

## History
`useHistory` wraps any reducer with an undo / redo stack (capped at 100 entries).
Snapshots are pushed on every committed change; `Ctrl+Z` / `Ctrl+Shift+Z` are bound
globally.

## Theming
`ThemeContext` exposes `mode` (light/dark/system), `palette` (default, deuteranopia,
protanopia, tritanopia, high-contrast) and `textScale` (0.85–1.5). Modes are applied
by toggling classes on `<html>`; the palette swaps the CSS variables consumed by
Tailwind utility classes via `var(--c-scheme)` etc.

## i18n
`react-i18next` with JSON resources under `src/i18n/locales/{lang}.json`. Detection
order: `localStorage` → `navigator.language` → `en`. Supported: en, pl, de, es, it.

## Accessibility
- Skip link, single `<h1>`, semantic landmarks (`<header>`, `<main>`, `<section>`,
  `<footer>`).
- All interactive elements are native `<button>`, `<input>`, `<textarea>`, `<select>`.
- Selection popup is keyboard reachable; `Esc` dismisses.
- Live region announces variable creation and number of generated URLs.
- Colors are paired with text labels everywhere (never colour alone).

## Files
```
src/
  main.tsx            – React entry, mounts <App/>
  App.tsx             – top-level layout + providers
  index.css           – Tailwind directives + CSS vars
  types.ts            – shared types
  i18n/
    index.ts          – i18next setup
    locales/{en,pl,de,es,it}.json
  contexts/
    ThemeContext.tsx
    AppStateContext.tsx
  hooks/
    useHistory.ts
    useSelectionPopup.ts
  utils/
    urlParser.ts      – parse / serialise URL template
    combinations.ts   – cross-product generation
    bookmarks.ts      – Netscape bookmarks file export
    color.ts          – stable colour assignment for variables
  components/
    Header.tsx
    SkipLink.tsx
    ThemeToggle.tsx
    PaletteSelect.tsx
    TextSizeControl.tsx
    LanguageSwitcher.tsx
    Section.tsx
    UrlInput.tsx
    HighlightedUrl.tsx
    SelectionPopup.tsx
    ParsedFragments.tsx
    Pill.tsx
    QueryParameter.tsx
    VariablesSection.tsx
    ListVariableEditor.tsx
    TableVariableEditor.tsx
    TemplateInputs.tsx
    ResultsSection.tsx
```
