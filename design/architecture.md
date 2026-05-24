# Bookmarks Weaver – Architecture

## Goal

Client-side React + TypeScript + Tailwind app that lets the user describe a
bookmark tree as a **template** with handlebars-style variables, populate the
variables in tables, and export a Netscape `bookmarks.html` file with the
generated cross-product of folders and bookmarks.

## Page sections

The page is split into four labelled sections, matching the product spec.

1. **Output file name** — a single text input. The default value is
   `bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html`. Date placeholders are resolved at
   download time. A live preview shows the resolved name.
2. **Template** — a block editor with three custom block kinds:
   - **Folder block** — a nestable list item with a single handlebars-aware
     name field. Folders can contain other folders, bookmarks and comments.
   - **Bookmark block** — a card with handlebars-aware fields for `title`,
     `url`, `description`, plus list editors for `tags` and `keywords`.
   - **Comment block** — a free-text note. Comments do not affect generation
     output other than appearing as an HTML comment in the export.
3. **Variables** — one rendered block per variable. Each block contains a
   single table; the header row is bold, monospace and uses the variable's
   background colour. Variables are created (and columns appended) automatically
   from the references found in the template. Renaming a variable or column
   rewrites every matching reference in the template tree.
4. **Generated bookmarks** — an expandable folder tree resolved from the
   template plus the variables, with a Download button on top.

## State model

`AppState` (see [src/types.ts](../src/types.ts)) is the single source of truth:

```ts
{
  outputFileName: string
  template: TemplateNode[]                // root-level children
  variables: Variable[]
}
```

`TemplateNode` is a discriminated union of `folder | bookmark | comment`.
`Variable` is always a table of `columns` × `rows` (strings). When a variable
has a single column, references can use the bare name (`{{x}}`); when it has
multiple columns, references must use dotted notation (`{{x.col}}`).

Mutations flow through `AppStateContext`. Every mutation that touches the
template runs through `syncVariablesWithTemplate(state)` which scans the
template for `{{var}}` / `{{var.col}}` references and:
- creates a missing variable (with one row),
- appends a missing column (and a blank cell in every existing row).

This satisfies "A new variable is added or updated whenever the user uses the
handlebars values" from the spec.

History is provided by `useHistory` (unchanged from the prior iteration);
`Ctrl+Z` / `Ctrl+Shift+Z` are bound globally except when typing in an input or
textarea (the native editor undo is more useful there).

## Handlebars parsing & rendering

`src/utils/handlebars.ts` contains a small, focused parser and renderer. We
intentionally do **not** use the `handlebars` npm package at runtime, because:

- We only need the `{{name}}` and `{{name.column}}` forms.
- We need a richer parse result for the UI (segment kind, position, validity,
  whether the referenced variable exists) than `Handlebars.compile` exposes.
- Using our own renderer keeps variable lookup semantics simple, with no
  conflict between "use foo as a string" and "use foo.bar as a property".

`parseTemplate(source, index)` returns a list of segments — `text`, valid
`ref`, or `invalid`. The HandlebarsInput component renders each segment as a
positioned overlay above the underlying `<input>`:

- valid references → coloured pill (same colour as their variable),
- valid syntax but unknown variable/column → double-wavy orange underline,
- malformed expression → red wavy underline.

## Generation

`src/utils/generator.ts` walks the template tree. At each node it collects
the variable references that are not already bound by an enclosing folder and
produces the cross-product of their rows. Folders introduce new bindings;
bookmarks loop over their own un-bound references. This matches the spec's
example: a folder template `{{cluster}}` with values `aaa, bbb` and a nested
`{{index}}` with values `1, 2` produces a 2 × 2 tree.

`src/utils/bookmarks.ts` renders the resolved tree as a Netscape bookmarks
file. Descriptions go into `<DD>` tags; tags become the `TAGS=` attribute on
the `<A>` element; keywords are emitted as a per-bookmark HTML comment so they
round-trip through tools that only consume Netscape HTML.

## Theming, accessibility, i18n

The Theme / i18n / accessibility infrastructure is carried over from the
earlier iteration: light / dark / system, default + three color-blindness
palettes + high-contrast, 0.85×–1.6× text scaling, English / Polish / German /
Spanish / Italian translations through react-i18next, a skip-link, semantic
landmarks, ARIA labels on every interactive element, and live-region
announcements for issues in handlebars expressions.

## Deviation from "blocknotejs"

The product brief calls for `blocknotejs`. The package is installed but we do
not use it for editing because the requirement is for **bespoke** folder /
bookmark / comment blocks with embedded structured inputs (URL, tags,
keywords), which would require a substantial custom `createReactBlockSpec`
schema and slash-menu wiring to feel right inside BlockNote. Instead, the
template editor is hand-rolled with the same block-based UX: each block is
its own rounded card, can be added or removed, and the folder block nests its
children as an indented list. The HandlebarsInput component delivers the
spec's "red wiggly / double-orange wiggly" feedback that BlockNote does not
provide out of the box.

## File layout

```
src/
  main.tsx                       React entry
  App.tsx                        Sections wiring
  index.css                      Tailwind directives + component CSS
  types.ts                       Shared types
  i18n/
    index.ts
    locales/{en,pl,de,es,it}.json
  contexts/
    ThemeContext.tsx
    AppStateContext.tsx
  hooks/
    useHistory.ts
  utils/
    handlebars.ts                Parser, renderer, identifier helpers
    generator.ts                 Cross-product tree generation
    bookmarks.ts                 Netscape HTML export
    color.ts                     Stable colour assignment + uid
  components/
    Header.tsx
    SkipLink.tsx
    Section.tsx
    ThemeControls.tsx
    LanguageSwitcher.tsx
    TextSizeControl.tsx
    FilenameInput.tsx
    HandlebarsInput.tsx
    VariablesSection.tsx
    VariableTable.tsx
    PreviewTree.tsx
    ResultsSection.tsx
    template/
      TemplateEditor.tsx
      TemplateNodeView.tsx
      FolderBlock.tsx
      BookmarkBlock.tsx
      CommentBlock.tsx
      TagListEditor.tsx
```
