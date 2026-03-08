# Execution Plan - Bookmarks Weaver

## 1. Project Initialization & Infrastructure
- [x] Initialize React + Vite project with TypeScript.
- [x] Setup TailwindCSS.
- [x] Setup i18next for multi-language support (EN, PL, DE, ES, IT).
- [x] Setup theme context (Light/Dark mode, color-blind support, text scaling).
- [x] Create layout components (Header, Main container, Footer).

## 2. Core Components Development
- [x] Create custom BlockNote components:
    - [x] `CommentBlock`: For user comments.
    - [x] `FolderBlock`: Templated folder name.
    - [x] `BookmarkBlock`: Title, URL, Description, Tags, Keywords.
- [x] Create Table management:
    - [x] Separate BlockNote editor for each variable table.
    - [x] Dynamic table creation/update based on template variables.

## 3. Handlebars Engine & Validation
- [x] Implement Handlebars parsing and validation.
- [x] Implement BlockNote decoration for Handlebars:
    - [x] Red wiggly line for invalid syntax.
    - [x] Orange double wiggly line for missing variables.

## 4. Variable Resolution Logic
- [x] Develop logic to resolve templates against variable tables (Cartesian product or simple iteration).
- [x] Handle nested folder structure resolution.

## 5. Bookmarks File Generation
- [x] Implement Netscape Bookmarks (HTML) export.
- [x] Implement File download functionality.

## 6. UI Sections Implementation
- [x] Section 1: Output file name (with Handlebars support for date).
- [x] Section 2: Template Section (Main BlockNote editor).
- [x] Section 3: Variables Section (List of BlockNote tables).
- [x] Section 4: Generated Output Preview with Download button.

## 7. UI/UX Refinement & Stability
- [x] Fix "RangeError: Position undefined out of range" by making CommentBlock focusable.
- [x] Limit BlockNote editor in Template section to Folder, Bookmark, and Comment blocks.
- [x] Fix CSS loading issue by adding `postcss.config.js`.
- [x] Correct "skewed" layout using `mx-auto` and better container spacing.
- [x] Synchronize BlockNote theme with dark/light mode toggle via `appState`.
- [x] Improve visual hierarchy with card-like sections and shadow effects.
- [x] Enhance accessibility with better focus states and interactive elements.
- [x] Fix "Nothing is displayed" bug by restoring missing `appState` import and properties.

## 8. Final Verification
- [ ] A11y check (WCAG 2.1 Level AA).
- [ ] Responsive design check (Mobile/Desktop).
- [ ] Multi-language check.
- [ ] Dark/Light mode and color theme check.
- [ ] Performance check (large variable tables).
