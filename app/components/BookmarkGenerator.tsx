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
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4">Generated Bookmarks</h2>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="mb-4">
          <label htmlFor="bookmark-name" className="block font-medium mb-2">
            Bookmark Name Template:
          </label>
          <input
            id="bookmark-name"
            type="text"
            value={bookmarkName}
            onChange={(e) => setBookmarkName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Bookmark ${index}"
            aria-label="Bookmark name template"
          />
          <p className="mt-1 text-sm text-gray-500">
            Use \${variableName} to insert variable values, \${index} for index, \${url} for the full URL
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="folder-structure" className="block font-medium mb-2">
            Folder Structure:
          </label>
          <input
            id="folder-structure"
            type="text"
            value={folderStructure}
            onChange={(e) => setFolderStructure(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Bookmarks/${variableName}"
            aria-label="Folder structure template"
          />
          <p className="mt-1 text-sm text-gray-500">
            Use / to create subfolders, \${variableName} to use variable values
          </p>
        </div>

        <button
          onClick={downloadBookmarks}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={generatedUrls.length === 0}
          aria-label="Download bookmarks file"
        >
          Download Bookmarks File
        </button>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-4">Generated URLs ({generatedUrls.length}):</h3>

        {generatedUrls.length === 0 ? (
          <p className="text-center text-gray-500">No URLs generated yet. Add variables and values to generate URLs.</p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {generatedUrls.map((url, index) => (
              <li key={index} className="p-2 bg-white dark:bg-gray-700 rounded">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
