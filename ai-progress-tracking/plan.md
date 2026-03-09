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
- [x] Switch BlockNote to use strict schemas from scratch, avoiding all unnecessary 'basic blocks' in both Template and Variable sections.
- [x] Improve visual hierarchy with card-like sections and shadow effects.
- [x] Enhance accessibility with better focus states and interactive elements.
- [x] Fix "Nothing is displayed" bug by restoring missing `appState` import and properties.
- [x] Fix "Uncaught RangeError: Position undefined out of range" by adding `paragraph` back to schema (for stability) but hiding it from UI.
- [x] Fix "Comment and Folder components are not editable/viewable" by adding min-height and proper contentRef handling.
- [x] Fix "Initial loaded comment does not work" by correcting BlockNote initial content format.
- [x] Remove "Emoji from Others menu" by explicitly disabling emojiPicker and other default UI components in BlockNoteView.
- [x] Fix "Folder component placeholder does not disappear" by adding focus-based CSS and empty-check improvements.
- [x] Implement "Column-specific shades" for Handlebars highlighting and variable table headers.
- [x] Implement "Rich text highlighting" for Bookmark block fields (Title, URL, etc.) using a custom overlay component.
- [x] Fix "Variable resolution logic" to include bookmark deduplication for correct sibling looping.
- [x] Update "Netscape Bookmarks generator" to include KEYWORDS attribute and support date variables (yyyy, mm, dd) in all templates.
- [x] Refine "Custom Block placeholders" to disappear correctly on focus or when content is present.
- [x] Increase application maximum width to `1400px` for better display of long URLs and wider bookmark components.
- [x] Remove Folder placeholder and improve its visual identification for direct editability.
- [x] Robustify variable resolution and folder looping logic in `generator.ts`, including trimming and robust merging.
- [x] Extend `FolderBlock` from `BulletListItem` to support editor nesting/indentation (Tab/Shift-Tab).
- [x] Fix "Untitled Folder" rendering by more robust extraction of text from folder blocks in `generator.ts`.
- [x] Fix variable highlighting in `FolderBlock` by updating `HandlebarsHighlighter` to use `.variable-tag` class and support built-ins.
- [x] Enhance `FolderBlock` with a placeholder and focus state to make it clear where to enter the name.

## 8. Final Verification
- [x] A11y check (WCAG 2.1 Level AA).
- [x] Responsive design check (Mobile/Desktop).
- [x] Multi-language check.
- [x] Dark/Light mode and color theme check.
- [x] Performance check (large variable tables).
- [x] Build and project stability verification.
