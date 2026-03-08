import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateEditor } from './components/TemplateEditor';
import { VariablesSection } from './components/VariablesSection';
import { PreviewSection } from './components/PreviewSection';
import { Globe, Sun, Moon } from 'lucide-react';
import { appState } from './store';

function App() {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      appState.setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      appState.setTheme('light');
    }
  }, [darkMode]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Bookmarks</span>
            <span>Weaver</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <select 
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="bg-transparent text-sm focus:outline-none"
              >
                <option value="en">English</option>
                <option value="pl">Polski</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="it">Italiano</option>
              </select>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={t('buttons.toggleTheme')}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl grid gap-12">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{t('sections.fileName')}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t('sections.fileNameDescription')}</p>
          <div className="p-1 rounded-lg border bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input 
              type="text" 
              defaultValue="bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html"
              className="w-full p-3 rounded-md bg-transparent focus:outline-none font-mono text-sm"
              onChange={(e) => appState.setFileName(e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">{t('sections.template')}</h2>
          <p className="text-sm text-muted-foreground">{t('sections.templateDescription')}</p>
          <div className="min-h-[400px] border rounded-xl shadow-sm bg-card overflow-hidden">
            <TemplateEditor />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">{t('sections.variables')}</h2>
          <p className="text-sm text-muted-foreground">{t('sections.variablesDescription')}</p>
          <div className="border rounded-xl p-6 bg-card shadow-sm">
            <VariablesSection />
          </div>
        </section>

        <section className="space-y-4">
          <PreviewSection />
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Bookmarks Weaver. Built for efficiency.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
