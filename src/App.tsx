import { useTranslation } from 'react-i18next'
import { AppStateProvider, useAppState } from './contexts/AppStateContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header } from './components/Header'
import { SkipLink } from './components/SkipLink'
import { Section } from './components/Section'
import { UrlInput } from './components/UrlInput'
import { ParsedFragments } from './components/ParsedFragments'
import { VariablesSection } from './components/VariablesSection'
import { TemplateInputs } from './components/TemplateInputs'
import { ResultsSection } from './components/ResultsSection'

function Workspace() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const showStep = state.beginner
  return (
    <main
      id="bw-main"
      className="max-w-6xl mx-auto px-4 sm:px-6 pb-12"
      aria-label={t('app.mainLandmark')}
    >
      <Section id="sec-input" title={t('sections.input')} description={showStep ? t('sections.inputHelp') : undefined} step={1} showStep={showStep}>
        <UrlInput />
      </Section>
      <Section id="sec-parsed" title={t('sections.parsed')} description={showStep ? t('sections.parsedHelp') : undefined} step={2} showStep={showStep}>
        <ParsedFragments />
      </Section>
      <Section id="sec-variables" title={t('sections.variables')} description={showStep ? t('sections.variablesHelp') : undefined} step={3} showStep={showStep}>
        <VariablesSection />
      </Section>
      <Section id="sec-templates" title={t('sections.templates')} description={showStep ? t('sections.templatesHelp') : undefined} step={4} showStep={showStep}>
        <TemplateInputs />
      </Section>
      <Section id="sec-results" title={t('sections.results')} step={5} showStep={showStep}>
        <ResultsSection />
      </Section>
    </main>
  )
}

export default function App() {
  const { t } = useTranslation()
  return (
    <ThemeProvider>
      <AppStateProvider>
        <SkipLink />
        <Header />
        <Workspace />
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <p className="bw-muted text-sm text-center">{t('app.footer')}</p>
        </footer>
      </AppStateProvider>
    </ThemeProvider>
  )
}
