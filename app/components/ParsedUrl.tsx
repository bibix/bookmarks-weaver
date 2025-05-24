'use client';

import React, { useState, useEffect } from 'react';

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
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Parsed URL</h2>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Scheme:</span>
          <span
            className="url-scheme cursor-pointer"
            onClick={() => handleCreateVariable(parsedUrl.scheme, 'scheme')}
            title="Click to create a variable"
          >
            {parsedUrl.scheme}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Domain:</span>
          <span
            className="url-domain cursor-pointer"
            onClick={() => handleCreateVariable(parsedUrl.domain, 'domain')}
            title="Click to create a variable"
          >
            {parsedUrl.domain}
          </span>
        </div>

        {parsedUrl.port && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Port:</span>
            <span
              className="url-port cursor-pointer"
              onClick={() => handleCreateVariable(parsedUrl.port, 'port')}
              title="Click to create a variable"
            >
              {parsedUrl.port}
            </span>
          </div>
        )}

        {parsedUrl.path && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Path:</span>
            <span
              className="url-path cursor-pointer"
              onClick={() => handleCreateVariable(parsedUrl.path, 'path')}
              title="Click to create a variable"
            >
              {parsedUrl.path}
            </span>
          </div>
        )}

        {parsedUrl.queryParams.length > 0 && (
          <div className="space-y-2">
            <span className="font-medium">Query Parameters:</span>
            <div className="pl-4 space-y-2">
              {parsedUrl.queryParams.map((param, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <span
                    className="url-query cursor-pointer"
                    onClick={() => handleCreateVariable(param.key, 'query-key')}
                    title="Click to create a variable"
                  >
                    {param.key}
                  </span>
                  <span>=</span>
                  <span
                    className="url-query cursor-pointer"
                    onClick={() => handleCreateVariable(param.value, 'query-value')}
                    title="Click to create a variable"
                  >
                    {param.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {parsedUrl.fragment && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Fragment:</span>
            <span
              className="url-fragment cursor-pointer"
              onClick={() => handleCreateVariable(parsedUrl.fragment, 'fragment')}
              title="Click to create a variable"
            >
              {parsedUrl.fragment}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
