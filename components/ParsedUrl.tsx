'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ParsedUrlProps {
  url: string;
  onCreateVariable: (name: string, value: string, type: string) => void;
}

interface UrlParts {
  scheme: string;
  domain: string;
  port: string;
  path: string;
  queryParams: { key: string; value: string }[];
  fragment: string;
}

export default function ParsedUrl({ url, onCreateVariable }: ParsedUrlProps) {
  const [parsedUrl, setParsedUrl] = useState<UrlParts>({
    scheme: 'https',
    domain: '',
    port: '',
    path: '',
    queryParams: [],
    fragment: ''
  });
  const [selection, setSelection] = useState<{
    text: string;
    type: string;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url) return;

    try {
      // Use URL API to parse the URL
      const urlObj = new URL(url);

      // Extract query parameters
      const queryParams: { key: string; value: string }[] = [];
      urlObj.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });

      setParsedUrl({
        scheme: urlObj.protocol.replace(':', ''),
        domain: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        queryParams,
        fragment: urlObj.hash.replace('#', '')
      });
    } catch (error) {
      // If URL is invalid, try to parse it as best as possible
      const schemeMatch = url.match(/^([a-zA-Z]+):\/\//);
      const scheme = schemeMatch ? schemeMatch[1] : 'https';

      // Remove scheme if present
      const withoutScheme = url.replace(/^[a-zA-Z]+:\/\//, '');

      // Split by first slash to get domain and path
      const [domainPart, ...pathParts] = withoutScheme.split('/');
      const path = pathParts.length > 0 ? `/${pathParts.join('/')}` : '';

      // Extract domain and port
      const [domain, port] = domainPart.split(':');

      // Extract fragment
      const fragmentParts = path.split('#');
      const fragment = fragmentParts.length > 1 ? fragmentParts[1] : '';
      const pathWithoutFragment = fragmentParts[0];

      // Extract query parameters
      const queryParts = pathWithoutFragment.split('?');
      const pathWithoutQuery = queryParts[0];
      const queryString = queryParts.length > 1 ? queryParts[1] : '';

      const queryParams: { key: string; value: string }[] = [];
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key) {
            queryParams.push({ key, value: value || '' });
          }
        });
      }

      setParsedUrl({
        scheme,
        domain: domain || '',
        port: port || '',
        path: pathWithoutQuery || '',
        queryParams,
        fragment
      });
    }
  }, [url]);

  const handleCreateVariable = (value: string, type: string) => {
    // Generate a default variable name based on the type
    const defaultName = `${type}${Math.floor(Math.random() * 1000)}`;
    onCreateVariable(defaultName, value, type);
    // Clear selection after creating variable
    setSelection(null);
  };

  const handleTextSelection = (e: React.MouseEvent, type: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      const rect = selection.getRangeAt(0).getBoundingClientRect();

      // Calculate position relative to the container
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.bottom - containerRect.top;

        setSelection({
          text: selectedText,
          type,
          x,
          y
        });
      }
    }
  };

  // Handle click outside to clear selection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Parsed URL
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Click any part or select text to create a variable
        </div>
      </div>

      {/* Selection popup */}
      {selection && (
        <div
          className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-10 transform -translate-x-1/2 flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          style={{
            left: `${selection.x}px`,
            top: `${selection.y + 10}px`
          }}
        >
          <button
            className="flex items-center gap-1 px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            onClick={() => handleCreateVariable(selection.text, selection.type)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Create Variable
          </button>
        </div>
      )}

      {/* Visual URL representation */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 text-lg">
          <span
            className="url-scheme cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center"
            onClick={() => handleCreateVariable(parsedUrl.scheme, 'scheme')}
            onMouseUp={(e) => handleTextSelection(e, 'scheme')}
            title="Click to create a variable or select text"
          >
            {parsedUrl.scheme}
          </span>
          <span className="text-gray-400">://</span>
          <span
            className="url-domain cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => handleCreateVariable(parsedUrl.domain, 'domain')}
            onMouseUp={(e) => handleTextSelection(e, 'domain')}
            title="Click to create a variable or select text"
          >
            {parsedUrl.domain}
          </span>
          {parsedUrl.port && (
            <>
              <span className="text-gray-400">:</span>
              <span
                className="url-port cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => handleCreateVariable(parsedUrl.port, 'port')}
                onMouseUp={(e) => handleTextSelection(e, 'port')}
                title="Click to create a variable or select text"
              >
                {parsedUrl.port}
              </span>
            </>
          )}
          {parsedUrl.path && (
            <span
              className="url-path cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => handleCreateVariable(parsedUrl.path, 'path')}
              onMouseUp={(e) => handleTextSelection(e, 'path')}
              title="Click to create a variable or select text"
            >
              {parsedUrl.path}
            </span>
          )}
          {parsedUrl.queryParams.length > 0 && (
            <>
              <span className="text-gray-400">?</span>
              {parsedUrl.queryParams.map((param, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-400">&</span>}
                  <span
                    className="url-query cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handleCreateVariable(param.key, 'query-key')}
                    onMouseUp={(e) => handleTextSelection(e, 'query-key')}
                    title="Click to create a variable or select text"
                  >
                    {param.key}
                  </span>
                  <span className="text-gray-400">=</span>
                  <span
                    className="url-query cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => handleCreateVariable(param.value, 'query-value')}
                    onMouseUp={(e) => handleTextSelection(e, 'query-value')}
                    title="Click to create a variable or select text"
                  >
                    {param.value}
                  </span>
                </React.Fragment>
              ))}
            </>
          )}
          {parsedUrl.fragment && (
            <>
              <span className="text-gray-400">#</span>
              <span
                className="url-fragment cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => handleCreateVariable(parsedUrl.fragment, 'fragment')}
                onMouseUp={(e) => handleTextSelection(e, 'fragment')}
                title="Click to create a variable or select text"
              >
                {parsedUrl.fragment}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Detailed URL parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">URL Components</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-20 text-sm text-gray-500 dark:text-gray-400">Scheme:</div>
              <div
                className="url-scheme cursor-pointer flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 group"
                onClick={() => handleCreateVariable(parsedUrl.scheme, 'scheme')}
                onMouseUp={(e) => handleTextSelection(e, 'scheme')}
                title="Click to create a variable or select text"
              >
                {parsedUrl.scheme}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 text-sm text-gray-500 dark:text-gray-400">Domain:</div>
              <div
                className="url-domain cursor-pointer flex items-center gap-1 hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200 group"
                onClick={() => handleCreateVariable(parsedUrl.domain, 'domain')}
                onMouseUp={(e) => handleTextSelection(e, 'domain')}
                title="Click to create a variable or select text"
              >
                {parsedUrl.domain}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
              </div>
            </div>
            {parsedUrl.port && (
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm text-gray-500 dark:text-gray-400">Port:</div>
                <div
                  className="url-port cursor-pointer flex items-center gap-1 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-200 group"
                  onClick={() => handleCreateVariable(parsedUrl.port, 'port')}
                  onMouseUp={(e) => handleTextSelection(e, 'port')}
                  title="Click to create a variable or select text"
                >
                  {parsedUrl.port}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
            )}
            {parsedUrl.path && (
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm text-gray-500 dark:text-gray-400">Path:</div>
                <div
                  className="url-path cursor-pointer flex items-center gap-1 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200 group"
                  onClick={() => handleCreateVariable(parsedUrl.path, 'path')}
                  onMouseUp={(e) => handleTextSelection(e, 'path')}
                  title="Click to create a variable or select text"
                >
                  {parsedUrl.path}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
            )}
            {parsedUrl.fragment && (
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm text-gray-500 dark:text-gray-400">Fragment:</div>
                <div
                  className="url-fragment cursor-pointer flex items-center gap-1 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors duration-200 group"
                  onClick={() => handleCreateVariable(parsedUrl.fragment, 'fragment')}
                  onMouseUp={(e) => handleTextSelection(e, 'fragment')}
                  title="Click to create a variable or select text"
                >
                  {parsedUrl.fragment}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {parsedUrl.queryParams.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Query Parameters</h3>
            <div className="space-y-3">
              {parsedUrl.queryParams.map((param, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div
                    className="url-query cursor-pointer flex items-center gap-1 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 group"
                    onClick={() => handleCreateVariable(param.key, 'query-key')}
                    onMouseUp={(e) => handleTextSelection(e, 'query-key')}
                    title="Click to create a variable or select text"
                  >
                    {param.key}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <span className="text-gray-400">=</span>
                  <div
                    className="url-query cursor-pointer flex items-center gap-1 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 group"
                    onClick={() => handleCreateVariable(param.value, 'query-value')}
                    onMouseUp={(e) => handleTextSelection(e, 'query-value')}
                    title="Click to create a variable or select text"
                  >
                    {param.value}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
