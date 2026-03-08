import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { appState } from '../store';
import { generateNetscapeBookmarks, resolveTemplate, Folder, Bookmark } from '../utils/generator';

export function PreviewSection() {
  const { t } = useTranslation();
  const [template, setTemplate] = useState(appState.template);
  
  useEffect(() => {
    return appState.subscribe(() => {
      setTemplate(appState.template);
    });
  }, []);

  const downloadBookmarks = () => {
     // TODO: Resolve all and trigger download
     const root: Folder = { name: "Root", children: [] };
     const content = generateNetscapeBookmarks(root);
     const blob = new Blob([content], { type: 'text/html' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = resolveTemplate(appState.fileName, { 
         yyyy: new Date().getFullYear(),
         mm: String(new Date().getMonth() + 1).padStart(2, '0'),
         dd: String(new Date().getDate()).padStart(2, '0')
     });
     a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('sections.preview')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('sections.previewDescription')}</p>
        </div>
        <button 
          onClick={downloadBookmarks}
          className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-medium"
        >
          {t('buttons.download')}
        </button>
      </div>
      <div className="border rounded-xl p-8 bg-card shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
         <div className="max-w-md space-y-2">
            <p className="text-muted-foreground font-medium">No preview available yet.</p>
            <p className="text-sm text-muted-foreground/70 italic">Add some folders and bookmarks in the template editor to see them resolved here.</p>
         </div>
      </div>
    </div>
  );
}
