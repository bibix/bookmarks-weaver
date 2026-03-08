# Bookmarks Weaver

A modern, client-side URL generator and templating tool built with React, TypeScript, and TailwindCSS.

## Features

- **Automatic URL Parsing**: Parses pasted URLs into scheme, domain, port, path, query parameters, and fragments.
- **Variable Substitution**: Select any part of the URL to create a variable and substitute it with multiple values.
- **Combinatorial Generation**: Automatically generates all possible URL combinations from lists and tables of variables.
- **Multi-language Support**: English, Polish, German, Spanish, and Italian.
- **Accessibility**: WCAG 2.1 Level AA compliant.
- **Themes**: Full support for Dark and Light modes.
- **Undo/Redo**: Full history management for all actions.
- **Bookmarks Export**: Download generated URLs as a browser-compatible bookmarks file.

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Internationalization**: i18next
- **Icons**: Lucide React
- **Animation**: Framer Motion

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Start the development server:
   ```bash
   yarn dev
   ```
3. Build for production:
   ```bash
   yarn build
   ```

## Project Structure

- `src/components`: UI components (Header, URLInput, etc.)
- `src/utils`: Core logic for URL parsing and combinations.
- `src/i18n`: Internationalization configuration and locales.
- `src/hooks`: Custom React hooks (history, etc.)
- `src/types`: TypeScript definitions.
- `ai-progress-tracking`: Project plan and status tracking.
