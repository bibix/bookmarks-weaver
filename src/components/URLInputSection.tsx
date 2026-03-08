import React, { useRef, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Variable } from '../types';
import TemplatedText from './TemplatedText';

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
      const rect = input.getBoundingClientRect();
      // Estimate position for the popup
      setSelection({
        text: selectedText,
        x: rect.left + (start * 9), // Rough estimate for monospace
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
        
        <div className="mt-2 p-2 min-h-[3rem] text-lg font-mono break-all border-b-2 border-transparent">
          <TemplatedText text={rawUrl} variables={variables} />
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
