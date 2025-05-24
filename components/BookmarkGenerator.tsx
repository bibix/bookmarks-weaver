'use client';

import React, { useState, useEffect } from 'react';

interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
  values: string[];
  isTable: boolean;
}

interface BookmarkGeneratorProps {
  originalUrl: string;
  variables: Variable[];
}

export default function BookmarkGenerator({ originalUrl, variables }: BookmarkGeneratorProps) {
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [bookmarkName, setBookmarkName] = useState<string>('Bookmark ${index}');
  const [folderStructure, setFolderStructure] = useState<string>('Bookmarks/${variableName}');

  // Generate URLs whenever variables change
  useEffect(() => {
    if (!originalUrl) return;

    const urls = generateUrlCombinations(originalUrl, variables);
    setGeneratedUrls(urls);
  }, [originalUrl, variables]);

  // Generate all possible combinations of URLs based on variables
  const generateUrlCombinations = (url: string, vars: Variable[]): string[] => {
    if (vars.length === 0) return [url];

    let result: string[] = [url];

    // Process each variable
    vars.forEach(variable => {
      const newResult: string[] = [];

      // For each current URL in the result
      result.forEach(currentUrl => {
        // For each value of the current variable
        variable.values.forEach(value => {
          // Replace the variable in the URL
          const pattern = new RegExp(variable.value, 'g');
          const newUrl = currentUrl.replace(pattern, value);
          newResult.push(newUrl);
        });
      });

      result = newResult;
    });

    return result;
  };

  // Generate bookmark file content
  const generateBookmarkFile = (): string => {
    let content = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
    content += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
    content += '<TITLE>Bookmarks</TITLE>\n';
    content += '<H1>Bookmarks</H1>\n';
    content += '<DL><p>\n';

    // Create folders based on the folder structure
    const folders = new Map<string, string[]>();

    generatedUrls.forEach((url, index) => {
      // Replace variables in the folder structure
      let folderPath = folderStructure;
      variables.forEach(variable => {
        folderPath = folderPath.replace(`\${${variable.name}}`, variable.values[0]);
      });
      folderPath = folderPath.replace('${index}', index.toString());

      // Replace variables in the bookmark name
      let name = bookmarkName;
      variables.forEach(variable => {
        name = name.replace(`\${${variable.name}}`, variable.values[0]);
      });
      name = name.replace('${index}', index.toString());
      name = name.replace('${url}', url);

      // Add URL to the appropriate folder
      if (!folders.has(folderPath)) {
        folders.set(folderPath, []);
      }
      folders.get(folderPath)?.push(`<DT><A HREF="${url}">${name}</A>\n`);
    });

    // Add folders and bookmarks to the content
    folders.forEach((bookmarks, folderPath) => {
      const folderParts = folderPath.split('/');
      let indent = '';

      folderParts.forEach(folder => {
        if (folder) {
          content += `${indent}<DT><H3>${folder}</H3>\n`;
          content += `${indent}<DL><p>\n`;
          indent += '    ';
        }
      });

      // Add bookmarks
      bookmarks.forEach(bookmark => {
        content += indent + bookmark;
      });

      // Close folder tags
      folderParts.forEach(folder => {
        if (folder) {
          indent = indent.slice(0, -4);
          content += `${indent}</DL><p>\n`;
        }
      });
    });

    content += '</DL><p>\n';
    return content;
  };

  // Download bookmarks file
  const downloadBookmarks = () => {
    const content = generateBookmarkFile();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          Generated Bookmarks
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {generatedUrls.length} URL{generatedUrls.length !== 1 ? 's' : ''} generated
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <div>
              <label htmlFor="bookmark-name" className="block font-medium text-gray-800 dark:text-gray-200">
                Bookmark Name Template
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Define how your bookmarks will be named
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              id="bookmark-name"
              type="text"
              value={bookmarkName}
              onChange={(e) => setBookmarkName(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              placeholder="Bookmark ${index}"
              aria-label="Bookmark name template"
            />
          </div>

          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="font-medium mb-1">Template variables:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">${"{variableName}"}</code> for variable values</li>
              <li>Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">${"{index}"}</code> for the bookmark index</li>
              <li>Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">${"{url}"}</code> for the full URL</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div>
              <label htmlFor="folder-structure" className="block font-medium text-gray-800 dark:text-gray-200">
                Folder Structure
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Define how your bookmarks will be organized
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              id="folder-structure"
              type="text"
              value={folderStructure}
              onChange={(e) => setFolderStructure(e.target.value)}
              className="w-full px-3 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              placeholder="Bookmarks/${variableName}"
              aria-label="Folder structure template"
            />
          </div>

          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="font-medium mb-1">Folder structure tips:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">/</code> to create subfolders</li>
              <li>Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">${"{variableName}"}</code> to use variable values</li>
              <li>Example: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Sites/Category/${"{domain}"}</code></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Download Bookmarks</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Export all generated URLs as a bookmarks file
              </p>
            </div>
          </div>

          <button
            onClick={downloadBookmarks}
            className={`px-6 py-2 rounded-md flex items-center gap-2 transition ${
              generatedUrls.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
            disabled={generatedUrls.length === 0}
            aria-label="Download bookmarks file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Bookmarks File
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Generated URLs
            </h3>
            <div className="text-sm px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
              {generatedUrls.length} URL{generatedUrls.length !== 1 ? 's' : ''}
            </div>
          </div>

          {generatedUrls.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No URLs generated yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Add variables and values to generate URLs.</p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="relative">
                <textarea
                  readOnly
                  className="w-full h-64 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm overflow-y-auto"
                  value={generatedUrls.join('\n')}
                  aria-label="Generated URLs"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedUrls.join('\n'));
                  }}
                  className="absolute top-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                  title="Copy all URLs"
                  aria-label="Copy all URLs to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
