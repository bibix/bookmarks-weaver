import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import URLInputSection from './components/URLInputSection';
import ParsedFragmentsSection from './components/ParsedFragmentsSection';
import VariablesSection from './components/VariablesSection';
import ResultsSection from './components/ResultsSection';
import { parseUrl } from './utils/urlParser';
import { generateCombinations, DataSource } from './utils/combinator';
import { Variable } from './types';

import { useHistory } from './hooks/useHistory';

const App: React.FC = () => {
  const { t } = useTranslation();
  
  // App state with history
  const { state, setState, undo, redo, canUndo, canRedo } = useHistory({
    rawUrl: 'https://example.com/search?q=hello#top',
    variables: [] as Variable[],
    dataSources: [] as DataSource[],
  });

  const { rawUrl, variables, dataSources } = state;
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Parsed URL based on current template (replacing variables with original values for visualization)
  const displayUrl = useMemo(() => {
    let result = rawUrl;
    variables.forEach(v => {
      // Find the first value in its data source or use original value
      const source = dataSources.find(s => s.variableIds.includes(v.id));
      const value = source ? source.rows[0][source.variableIds.indexOf(v.id)] : v.name;
      result = result.split(`{{${v.id}}}`).join(value);
    });
    return result;
  }, [rawUrl, variables, dataSources]);

  const setRawUrl = (url: string) => setState(prev => ({ ...prev, rawUrl: url }));
  const setVariables = (vars: Variable[]) => setState(prev => ({ ...prev, variables: vars }));
  const setDataSources = (sources: DataSource[]) => setState(prev => ({ ...prev, dataSources: sources }));

  const parsedUrl = useMemo(() => parseUrl(displayUrl), [displayUrl]);

  // Combination logic
  const generatedUrls = useMemo(() => {
    return generateCombinations(rawUrl, dataSources);
  }, [rawUrl, dataSources]);

  // Handlers
  const handleAddVariable = useCallback((selection: string, start: number, end: number) => {
    const varId = `var_${Date.now()}`;
    const varName = selection;
    
    // Create new variable
    const newVar: Variable = {
      id: varId,
      name: varName,
      type: 'list',
      values: [[selection]]
    };
    
    setVariables(prev => [...prev, newVar]);
    
    // Update rawUrl by replacing the selection with placeholder
    // This is tricky because the rawUrl might already have placeholders
    // For now, let's assume the selection is from the displayUrl
    // In a real app, we need to map the selection from displayUrl back to rawUrl
    // For simplicity, let's just replace the FIRST occurrence for now
    setRawUrl(prev => prev.replace(selection, `{{${varId}}}`));
    
    // Create a new data source for this variable
    const newSource: DataSource = {
      id: `source_${Date.now()}`,
      variableIds: [varId],
      rows: [[selection]]
    };
    setDataSources(prev => [...prev, newSource]);
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-teal-600 text-white p-2 rounded z-[100]">
        Skip to content
      </a>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <Header 
          theme={theme} 
          onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        
        <main id="main-content" className="space-y-8">
          <section id="url-input">
            <URLInputSection 
              rawUrl={rawUrl} 
              onUrlChange={setRawUrl} 
              variables={variables}
              onAddVariable={handleAddVariable}
            />
          </section>

          <section id="parsed-fragments">
            <h2 className="text-xl font-semibold mb-4">{t('parsed_fragments')}</h2>
            <ParsedFragmentsSection parsedUrl={parsedUrl} />
          </section>

          <section id="variables">
            <h2 className="text-xl font-semibold mb-4">{t('variables')}</h2>
            <VariablesSection 
              dataSources={dataSources} 
              onDataSourcesChange={setDataSources}
              variables={variables}
            />
          </section>

          <section id="results">
            <h2 className="text-xl font-semibold mb-4">{t('results')}</h2>
            <ResultsSection urls={generatedUrls} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
