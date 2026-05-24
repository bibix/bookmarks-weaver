# AGENTS.md

Notes for any AI agent or contributor picking up this repo.

## Project shape

- React 19 + TypeScript, Vite, Tailwind CSS, Yarn 4 (PnP).
- Dependencies: `handlebars`, `@blocknote/*`, `react-i18next`,
  `i18next-browser-languagedetector`, `lucide-react`.
- All processing is client-side; nothing is sent to a server.

## What this app does

It is a **bookmark file generator**. The user composes a template (folders,
bookmarks, comments) with handlebars-style references; references become
variables in a tables section; the result is a Netscape `bookmarks.html` file
the user can download.

The full source of truth for the design is [design/architecture.md](design/architecture.md).
Read it before making non-trivial changes.

## Conventions

- Place design and architecture notes under `design/`.
- Place runnable shell scripts under `bin/`. Use git-bash conventions; prefer
  writing a script there first when a command will be repeated.
- The project respects `.aiignore` (gitignore-style) for assistant context.
- Tailwind is preferred; ad-hoc component styles live in `src/index.css` under
  `.bw-*` / `.hb-*` classes. **Never use CSS-in-JS**.
- Accessibility is mandatory: native semantic elements, ARIA labels on every
  interactive control, color is never the only signal, layouts must reflow up
  to 200% text scale.

## Where things live

- App state and history: `src/contexts/AppStateContext.tsx`.
- Theme (light/dark/system + 5 palettes + text scale): `src/contexts/ThemeContext.tsx`.
- Template parsing and rendering: `src/utils/handlebars.ts`.
- Cross-product tree generation: `src/utils/generator.ts`.
- Netscape file export: `src/utils/bookmarks.ts`.
- The four page sections are wired up in `src/App.tsx`.

## Build / dev

- `bash bin/install.sh` — yarn install.
- `bash bin/dev.sh` — start Vite dev server.
- `bash bin/build.sh` — type-check + production build.

Note: this repo pins `nodeLinker: node-modules` in `.yarnrc.yml`. Don't
switch back to Yarn PnP — its experimental ESM loader crashes on Node 24
with `EBADF: bad file descriptor`.

## What NOT to do

- Don't reintroduce the previous URL-parsing workflow — the spec has moved on
  to template-driven generation.
- Don't add server-side processing. Everything runs in the browser.
- Don't replace handlebars rendering with the npm `handlebars` package without
  first solving the `{{foo}}` vs `{{foo.bar}}` dual-context-shape problem
  documented in `design/architecture.md`.
- Don't drop the wavy-underline feedback in the HandlebarsInput — that's a
  spec requirement, not a polish.
- Don't rip the template editor off BlockNote. Folder / Bookmark / Comment
  are `createReactBlockSpec` blocks reachable via the slash menu — see
  `design/architecture.md` and `src/components/template/`.
