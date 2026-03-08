import React from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages, Undo2, Redo2 } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  theme, 
  onToggleTheme,
  undo,
  redo,
  canUndo,
  canRedo
}) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="flex justify-between items-center py-4 border-b dark:border-gray-700">
      <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
        {t('title')}
      </h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 border-r pr-4 dark:border-gray-700">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
            title={t('undo')}
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
            title={t('redo')}
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          <select 
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent border rounded p-1 text-sm dark:bg-gray-800"
            value={i18n.language}
          >
            <option value="en">English</option>
            <option value="pl">Polski</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="it">Italiano</option>
          </select>
        </div>

        <button 
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
