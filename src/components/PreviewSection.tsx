import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { appState } from '../store';
import { generateNetscapeBookmarks, resolveTemplate, resolveAll, Folder, Bookmark } from '../utils/generator';
import { Folder as FolderIcon, Bookmark as BookmarkIcon, ChevronRight, ChevronDown } from 'lucide-react';

function FolderView({ folder }: { folder: Folder }) {
  const [isOpen, setIsOpen] = useState(true);

  if (folder.name === "Root") {
    return (
      <div className="space-y-1">
        {folder.children.map((child, i) => (
          'children' in child ? <FolderView key={i} folder={child} /> : <BookmarkView key={i} bookmark={child} />
        ))}
      </div>
    );
  }

  return (
    <div className="ml-4 border-l pl-4 py-1">
      <div 
        className="flex items-center gap-2 py-1 cursor-pointer hover:text-primary transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <FolderIcon size={16} className="text-primary fill-primary/10" />
        <span className="font-semibold">{folder.name}</span>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          ({folder.children.length} items)
        </span>
      </div>
      {isOpen && (
        <div className="mt-1 space-y-1">
          {folder.children.map((child, i) => (
            'children' in child ? <FolderView key={i} folder={child} /> : <BookmarkView key={i} bookmark={child} />
          ))}
          {folder.children.length === 0 && <p className="text-xs text-muted-foreground/50 italic ml-6">Empty folder</p>}
        </div>
      )}
    </div>
  );
}

function BookmarkView({ bookmark }: { bookmark: Bookmark }) {
  return (
    <div className="ml-6 flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border">
      <BookmarkIcon size={16} className="text-muted-foreground mt-1 shrink-0" />
      <div className="grid gap-1 overflow-hidden">
        <div className="font-medium text-sm flex items-center gap-2 truncate">
          {bookmark.title || "Untitled"}
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Bookmark</span>
        </div>
        <div className="text-xs text-muted-foreground truncate">{bookmark.url}</div>
        {bookmark.description && (
          <div className="text-xs text-muted-foreground/80 line-clamp-2 italic">{bookmark.description}</div>
        )}
        {(bookmark.tags.length > 0 || bookmark.keywords.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {bookmark.tags.map((tag, i) => (
              <span key={i} className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">#{tag}</span>
            ))}
            {bookmark.keywords.map((kw, i) => (
              <span key={i} className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">{kw}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PreviewSection() {
  const { t } = useTranslation();
  const [state, setState] = useState({
      template: appState.template,
      variables: appState.variables,
      fileName: appState.fileName
  });
  
  useEffect(() => {
    return appState.subscribe(() => {
      setState({
          template: [...appState.template],
          variables: { ...appState.variables },
          fileName: appState.fileName
      });
    });
  }, []);

  const root = resolveAll(state.template, state.variables);

  const downloadBookmarks = () => {
     const content = generateNetscapeBookmarks(root);
     const blob = new Blob([content], { type: 'text/html' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = resolveTemplate(state.fileName, { 
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
          disabled={root.children.length === 0}
          className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {t('buttons.download')}
        </button>
      </div>
      <div className="border rounded-xl p-6 bg-card shadow-sm min-h-[400px]">
         {root.children.length > 0 ? (
           <FolderView folder={root} />
         ) : (
           <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center">
             <div className="max-w-md space-y-2">
                <p className="text-muted-foreground font-medium">No preview available yet.</p>
                <p className="text-sm text-muted-foreground/70 italic">Add some folders and bookmarks in the template editor to see them resolved here.</p>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}
