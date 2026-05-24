import { useTranslation } from 'react-i18next'
import { AppStateProvider } from './contexts/AppStateContext'
import { LibraryProvider } from './contexts/LibraryContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header } from './components/Header'
import { SkipLink } from './components/SkipLink'
import { Section } from './components/Section'
import { FilenameInput } from './components/FilenameInput'
import { TemplateEditor } from './components/template/TemplateEditor'
import { VariablesSection } from './components/VariablesSection'
import { ResultsSection } from './components/ResultsSection'
import { TemplateLibraryControls } from './components/TemplateLibraryControls'
import { VariablesIOControls } from './components/VariablesIOControls'
import { LibrarySidebar } from './components/LibrarySidebar'

function Workspace() {
  const { t } = useTranslation()
  return (
    <div className="bw-shell max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <LibrarySidebar />
      <main
        id="bw-main"
        className="bw-shell__main"
        aria-label={t('app.mainLandmark')}
      >
        <Section
          id="sec-filename"
          title={t('sections.filename')}
          description={t('sections.filenameHelp')}
        >
          <FilenameInput />
        </Section>
        <Section
          id="sec-template"
          title={t('sections.template')}
          description={t('sections.templateHelp')}
          actions={<TemplateLibraryControls />}
        >
          <TemplateEditor />
        </Section>
        <Section
          id="sec-variables"
          title={t('sections.variables')}
          description={t('sections.variablesHelp')}
          actions={<VariablesIOControls />}
        >
          <VariablesSection />
        </Section>
        <Section
          id="sec-results"
          title={t('sections.results')}
          description={t('sections.resultsHelp')}
        >
          <ResultsSection />
        </Section>
      </main>
    </div>
  )
}

export default function App() {
  const { t } = useTranslation()
  return (
    <ThemeProvider>
      <AppStateProvider>
        <LibraryProvider>
          <SkipLink />
          <Header />
          <Workspace />
          <footer className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
            <p className="bw-muted text-sm text-center">{t('app.footer')}</p>
          </footer>
        </LibraryProvider>
      </AppStateProvider>
    </ThemeProvider>
  )
}
