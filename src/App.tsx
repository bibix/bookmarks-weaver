import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FileNameSection } from './components/FileNameSection'
import { LanguageThemeControls } from './components/LanguageThemeControls'
import { PreviewSection } from './components/PreviewSection'
import { SectionCard } from './components/SectionCard'
import { TemplateSection } from './components/TemplateSection'
import { UrlParserSection } from './components/UrlParserSection'
import { VariablesSection } from './components/VariablesSection'
import { generateBookmarksHtml } from './lib/bookmarksHtml'
import { collectGeneratedUrls, generatePreviewTree } from './lib/generator'
import { DEFAULT_TEMPLATE_DSL, parseTemplateDsl } from './lib/templateDsl'
import { validateTokens } from './lib/templateTokens'
import {
  createVariableTable,
  ensureVariablesForTemplate,
  normalizeVariableName,
  renameVariableColumnInTemplate,
  renameVariableInTemplate,
} from './lib/variables'
import type { VariableTable } from './types'

const pad = (value: number): string => String(value).padStart(2, '0')

const resolveFileNameTemplate = (value: string): string => {
  const now = new Date()
  const replacements: Record<string, string> = {
    '{{yyyy}}': String(now.getFullYear()),
    '{{mm}}': pad(now.getMonth() + 1),
    '{{dd}}': pad(now.getDate()),
  }

  let nextValue = value
  for (const [token, replacement] of Object.entries(replacements)) {
    nextValue = nextValue.replaceAll(token, replacement)
  }

  return nextValue.endsWith('.html') ? nextValue : `${nextValue}.html`
}

const buildInitialVariables = (): VariableTable[] => {
  const base = ensureVariablesForTemplate([], DEFAULT_TEMPLATE_DSL)

  return base.map((table) => {
    if (table.name === 'cluster' && table.columns[0]) {
      return {
        ...table,
        columns: [{ ...table.columns[0], values: ['aaa', 'bbb'] }],
      }
    }

    if (table.name === 'index' && table.columns[0]) {
      return {
        ...table,
        columns: [{ ...table.columns[0], values: ['1', '2'] }],
      }
    }

    return table
  })
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polski' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
]

const App = () => {
  const { t, i18n } = useTranslation()

  const [fileNameTemplate, setFileNameTemplate] = useState('bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html')
  const [templateMarkdown, setTemplateMarkdown] = useState(DEFAULT_TEMPLATE_DSL)
  const [variables, setVariables] = useState<VariableTable[]>(() => buildInitialVariables())
  const [urlInput, setUrlInput] = useState('https://localhost:3000/path?tag=dev#preview')
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const [contrastMode, setContrastMode] = useState<'standard' | 'high'>('standard')
  const [textScale, setTextScale] = useState(100)
  const [statusMessage, setStatusMessage] = useState(t('statusReady'))

  useEffect(() => {
    setVariables((previous) => ensureVariablesForTemplate(previous, templateMarkdown))
  }, [templateMarkdown])

  useEffect(() => {
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
  }, [themeMode])

  useEffect(() => {
    document.documentElement.dataset.contrast = contrastMode
  }, [contrastMode])

  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale}%`
  }, [textScale])

  const tokenValidation = useMemo(() => validateTokens(templateMarkdown, variables), [templateMarkdown, variables])
  const parsedTemplate = useMemo(() => parseTemplateDsl(templateMarkdown), [templateMarkdown])
  const generatedTree = useMemo(() => generatePreviewTree(parsedTemplate, variables), [parsedTemplate, variables])
  const generatedUrls = useMemo(() => collectGeneratedUrls(generatedTree), [generatedTree])

  const handleAddVariable = () => {
    setVariables((previous) => [...previous, createVariableTable(`variable_${previous.length + 1}`)])
  }

  const handleRemoveVariable = (tableId: string) => {
    setVariables((previous) => previous.filter((table) => table.id !== tableId))
  }

  const handleRenameVariable = (tableId: string, oldName: string, newName: string) => {
    const safeName = normalizeVariableName(newName)
    setVariables((previous) =>
      previous.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        return {
          ...table,
          name: safeName,
        }
      }),
    )

    setTemplateMarkdown((previous) => renameVariableInTemplate(previous, oldName, safeName))
  }

  const handleAddRow = (tableId: string) => {
    setVariables((previous) =>
      previous.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        return {
          ...table,
          columns: table.columns.map((column) => ({
            ...column,
            values: [...column.values, ''],
          })),
        }
      }),
    )
  }

  const handleAddColumn = (tableId: string) => {
    setVariables((previous) =>
      previous.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        const rowCount = Math.max(1, ...table.columns.map((column) => column.values.length))
        return {
          ...table,
          columns: [
            ...table.columns,
            {
              id: crypto.randomUUID(),
              name: `column_${table.columns.length + 1}`,
              values: Array.from({ length: rowCount }, () => ''),
            },
          ],
        }
      }),
    )
  }

  const handleRenameColumn = (
    tableId: string,
    tableName: string,
    columnId: string,
    oldName: string,
    newName: string,
  ) => {
    const safeName = normalizeVariableName(newName)
    setVariables((previous) =>
      previous.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        return {
          ...table,
          columns: table.columns.map((column) => {
            if (column.id !== columnId) {
              return column
            }

            return {
              ...column,
              name: safeName,
            }
          }),
        }
      }),
    )

    setTemplateMarkdown((previous) =>
      renameVariableColumnInTemplate(previous, tableName, oldName, normalizeVariableName(newName)),
    )
  }

  const handleUpdateColumnValues = (tableId: string, columnId: string, nextText: string) => {
    const values = nextText.split('\n')

    setVariables((previous) =>
      previous.map((table) => {
        if (table.id !== tableId) {
          return table
        }

        return {
          ...table,
          columns: table.columns.map((column) => {
            if (column.id !== columnId) {
              return column
            }

            return {
              ...column,
              values,
            }
          }),
        }
      }),
    )
  }

  const handleDownload = () => {
    const fileName = resolveFileNameTemplate(fileNameTemplate)
    const content = generateBookmarksHtml(generatedTree)
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
    setStatusMessage(t('statusDownloaded'))
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('skipToMain')}
      </a>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('appTitle')}</h1>
          <p className="text-slate-700 dark:text-slate-300">{t('appDescription')}</p>
        </header>

        <LanguageThemeControls
          language={i18n.language}
          languageOptions={languageOptions}
          onLanguageChange={(nextLanguage) => {
            void i18n.changeLanguage(nextLanguage)
          }}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          contrastMode={contrastMode}
          onContrastModeChange={setContrastMode}
          textScale={textScale}
          onTextScaleChange={setTextScale}
        />

        <main id="main-content" className="grid gap-4" aria-live="off">
          <SectionCard
            id="file-name-section"
            title={t('fileNameSectionTitle')}
            description={t('fileNameSectionDescription')}
          >
            <FileNameSection
              label={t('fileNameLabel')}
              helperText={t('fileNameHelp')}
              value={fileNameTemplate}
              onChange={setFileNameTemplate}
            />
          </SectionCard>

          <SectionCard
            id="template-section"
            title={t('templateSectionTitle')}
            description={t('templateSectionDescription')}
          >
            <TemplateSection
              value={templateMarkdown}
              onChange={setTemplateMarkdown}
              invalidTokens={tokenValidation.invalidTokens}
              missingTokens={tokenValidation.missingTokens}
            />
          </SectionCard>

          <SectionCard
            id="variables-section"
            title={t('variablesSectionTitle')}
            description={t('variablesSectionDescription')}
          >
            <VariablesSection
              variables={variables}
              onAddVariable={handleAddVariable}
              onRemoveVariable={handleRemoveVariable}
              onRenameVariable={handleRenameVariable}
              onAddRow={handleAddRow}
              onAddColumn={handleAddColumn}
              onRenameColumn={handleRenameColumn}
              onUpdateColumnValues={handleUpdateColumnValues}
            />
          </SectionCard>

          <SectionCard id="url-parser" title={t('urlParserTitle')} description={t('urlParserDescription')}>
            <UrlParserSection value={urlInput} onChange={setUrlInput} />
          </SectionCard>

          <SectionCard
            id="preview-section"
            title={t('previewSectionTitle')}
            description={t('previewSectionDescription')}
          >
            <PreviewSection nodes={generatedTree} generatedUrls={generatedUrls} onDownload={handleDownload} />
          </SectionCard>
        </main>

        <footer>
          <p role="status" aria-live="polite" className="text-sm text-slate-700 dark:text-slate-300">
            {statusMessage}
          </p>
        </footer>
      </div>
    </>
  )
}

export default App
