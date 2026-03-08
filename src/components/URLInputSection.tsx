import React, { useRef, useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Variable } from '../types';

interface URLInputSectionProps {
  rawUrl: string;
  onUrlChange: (url: string) => void;
  variables: Variable[];
  onAddVariable: (selection: string, start: number, end: number) => void;
}

const URLInputSection: React.FC<URLInputSectionProps> = ({ 
  rawUrl, 
  onUrlChange, 
  variables,
  onAddVariable 
}) => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<{ text: string, x: number, y: number, start: number, end: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelection = () => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (start !== null && end !== null && start !== end) {
      const selectedText = input.value.substring(start, end);
      // Basic position calculation (very simplified)
      const rect = input.getBoundingClientRect();
      setSelection({
        text: selectedText,
        x: rect.left + (start * 8), // Rough estimate of pixel position
        y: rect.bottom + window.scrollY,
        start,
        end
      });
    } else {
      setSelection(null);
    }
  };

  const handleAdd = () => {
    if (selection) {
      onAddVariable(selection.text, selection.start, selection.end);
      setSelection(null);
    }
  };

  // Helper to render URL with variable pills
  const renderHighlightedUrl = () => {
    let parts: (string | React.ReactNode)[] = [rawUrl];
    
    variables.forEach(v => {
      const placeholder = `{{${v.id}}}`;
      const newParts: (string | React.ReactNode)[] = [];
      
      parts.forEach(part => {
        if (typeof part === 'string') {
          const segments = part.split(placeholder);
          segments.forEach((seg, i) => {
            newParts.push(seg);
            if (i < segments.length - 1) {
              newParts.push(
                <span key={`${v.id}-${i}`} className="bg-teal-200 text-teal-800 px-1 rounded mx-0.5 font-bold dark:bg-teal-800 dark:text-teal-100">
                  {v.name}
                </span>
              );
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  return (
    <div className="relative w-full">
      <label htmlFor="url-input-field" className="sr-only">{t('input_url_placeholder')}</label>
      <div className="relative">
        <input
          id="url-input-field"
          ref={inputRef}
          type="text"
          value={rawUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          onSelect={handleSelection}
          placeholder={t('input_url_placeholder')}
          className="w-full p-4 pr-12 text-lg rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-mono"
        />
        
        {/* Highlighted view overlay or below? 
            Requirements say: "The fragments should be underlined with different colors" 
            and "replace elements in the URL". 
            I'll render the highlighted version below or above the input for clarity.
        */}
        <div className="mt-2 p-2 min-h-[3rem] text-lg font-mono break-all border-b-2 border-transparent">
          {renderHighlightedUrl()}
        </div>
      </div>

      {selection && (
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 shadow-lg border rounded-full p-1 flex items-center animate-in fade-in zoom-in duration-200"
          style={{ left: `${Math.min(selection.x, window.innerWidth - 100)}px`, top: `4rem` }}
        >
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1 text-teal-600 hover:text-teal-700 transition"
            title="Create variable"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default URLInputSection;
