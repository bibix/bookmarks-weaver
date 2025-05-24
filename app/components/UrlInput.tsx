'use client';

import React, { useState } from 'react';

interface UrlInputProps {
  onUrlChange: (url: string) => void;
}

export default function UrlInput({ onUrlChange }: UrlInputProps) {
  const [url, setUrl] = useState<string>('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onUrlChange(newUrl);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="url-input" className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Enter or paste a URL
        </label>
        {url && (
          <button
            onClick={() => {
              setUrl('');
              onUrlChange('');
            }}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            aria-label="Clear URL input"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
        </div>
        <textarea
          id="url-input"
          className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px] bg-white dark:bg-gray-800 transition-all duration-200 text-gray-800 dark:text-gray-100"
          placeholder="https://example.com/path?param1=value1&param2=value2#fragment"
          value={url}
          onChange={handleUrlChange}
          aria-label="URL input field"
        />
      </div>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Paste a URL to start generating bookmarks. The URL will be parsed automatically.
      </p>
    </div>
  );
}
