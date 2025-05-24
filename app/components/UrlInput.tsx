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
    <div className="w-full max-w-4xl mx-auto mb-8">
      <label htmlFor="url-input" className="block text-lg font-medium mb-2">
        Enter or paste a URL
      </label>
      <textarea
        id="url-input"
        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
        placeholder="https://example.com/path?param1=value1&param2=value2#fragment"
        value={url}
        onChange={handleUrlChange}
        aria-label="URL input field"
      />
    </div>
  );
}
