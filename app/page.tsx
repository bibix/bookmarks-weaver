'use client';

import React, { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import ParsedUrl from '@/components/ParsedUrl';
import VariableManager from '@/components/VariableManager';
import BookmarkGenerator from '@/components/BookmarkGenerator';

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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <header className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 text-white p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
              {t('title')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
              <label htmlFor="dark-mode-toggle" className="text-sm font-medium">
                {t('darkMode')}
              </label>
              <button
                id="dark-mode-toggle"
                onClick={toggleDarkMode}
                className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${
                  isDarkMode ? 'bg-primary-600' : 'bg-gray-300'
                }`}
                aria-pressed={isDarkMode}
                aria-label="Toggle dark mode"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
              <label htmlFor="language-select" className="text-sm font-medium">
                {t('language')}
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
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

        <main className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 transition-all duration-300 hover:shadow-soft-xl">
            <UrlInput onUrlChange={handleUrlChange} />
          </div>

          {url && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 transition-all duration-300 hover:shadow-soft-xl">
              <ParsedUrl
                url={url}
                onCreateVariable={handleCreateVariable}
              />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 transition-all duration-300 hover:shadow-soft-xl">
            <VariableManager
              onVariablesChange={handleVariablesChange}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 transition-all duration-300 hover:shadow-soft-xl">
            <BookmarkGenerator
              originalUrl={url}
              variables={variables}
            />
          </div>
        </main>

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Bookmarks Weaver - A bookmarks and URL generator
          </p>
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Made with ❤️ for better bookmarking
          </div>
        </footer>
      </div>
    </div>
  );
}
