'use client';

import React, { useState } from 'react';
import UrlInput from './components/UrlInput';
import ParsedUrl from './components/ParsedUrl';
import VariableManager from './components/VariableManager';
import BookmarkGenerator from './components/BookmarkGenerator';

interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
  values: string[];
  isTable: boolean;
}

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('en');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Handle URL change from UrlInput component
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  // Handle variable creation from ParsedUrl component
  const handleCreateVariable = (name: string, value: string, type: string) => {
    const id = `var-${Date.now()}`;
    const newVariable: Variable = {
      id,
      name,
      value,
      type,
      values: [value],
      isTable: false
    };

    setVariables(prev => [...prev, newVariable]);
  };

  // Handle variables change from VariableManager component
  const handleVariablesChange = (newVariables: Variable[]) => {
    setVariables(newVariables);
  };

  // Simple translations for demonstration
  const translations: Record<string, Record<string, string>> = {
    en: {
      title: 'Bookmarks Weaver',
      darkMode: 'Dark Mode',
      language: 'Language'
    },
    pl: {
      title: 'Generator Zakładek',
      darkMode: 'Tryb Ciemny',
      language: 'Język'
    },
    de: {
      title: 'Lesezeichen-Generator',
      darkMode: 'Dunkelmodus',
      language: 'Sprache'
    }
  };

  // Get translation
  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pl', name: 'Polski' },
    { code: 'de', name: 'Deutsch' }
  ];

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'dark' : ''}`}>
      <header className="w-full max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="dark-mode-toggle" className="text-sm font-medium">
              {t('darkMode')}
            </label>
            <button
              id="dark-mode-toggle"
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-pressed={isDarkMode}
              aria-label="Toggle dark mode"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="language-select" className="text-sm font-medium">
              {t('language')}
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md"
              aria-label="Select language"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto">
        <UrlInput onUrlChange={handleUrlChange} />

        {url && (
          <ParsedUrl
            url={url}
            onCreateVariable={handleCreateVariable}
          />
        )}

        <VariableManager
          onVariablesChange={handleVariablesChange}
        />

        <BookmarkGenerator
          originalUrl={url}
          variables={variables}
        />
      </main>

      <footer className="w-full max-w-4xl mx-auto mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Bookmarks Weaver - A bookmarks and URL generator</p>
      </footer>
    </div>
  );
}
