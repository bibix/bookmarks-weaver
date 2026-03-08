import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Copy } from 'lucide-react';

interface ResultsSectionProps {
  urls: string[];
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ urls }) => {
  const { t } = useTranslation();

  const handleDownload = () => {
    // Basic Netscape Bookmarks HTML format
    const header = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and classified if you delete these lines. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;
    const footer = `</DL><p>`;
    const items = urls.map(url => `    <DT><A HREF="${url}">${url}</A>`).join('\n');
    
    const content = header + items + footer;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmarks.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(urls.join('\n'));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">
          {urls.length} {urls.length === 1 ? 'URL' : 'URLs'} generated
        </span>
        <div className="flex gap-2">
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition"
          >
            <Copy className="w-4 h-4" />
            Copy All
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-md transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            {t('download_bookmarks')}
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          readOnly
          className="w-full p-4 h-64 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg font-mono text-sm resize-none outline-none focus:ring-1 focus:ring-teal-500"
          value={urls.join('\n')}
        />
      </div>
    </div>
  );
};

export default ResultsSection;
