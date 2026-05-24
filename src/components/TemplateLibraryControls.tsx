import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { useLibrary } from '../contexts/LibraryContext'
import { parseTemplateImport, serializeTemplate } from '../utils/storage'
import { triggerDownload } from '../utils/bookmarks'

export function TemplateLibraryControls() {
  const { t } = useTranslation()
  const { state, setTemplate } = useAppState()
  const { addTemplate } = useLibrary()
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const name = window.prompt(t('library.namePrompt'))
    if (!name) return
    const description = window.prompt(t('library.descPrompt')) ?? ''
    addTemplate(null, { name, description, template: state.template })
    setError(null)
  }

  const handleExport = () => {
    triggerDownload(
      'template.json',
      serializeTemplate(state.template),
      'application/json',
    )
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const imported = parseTemplateImport(text)
      setTemplate(imported.template)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="bw-toolbar" role="toolbar" aria-label={t('library.toolbar')}>
      <button type="button" className="bw-button-ghost" onClick={handleSave}>
        {t('library.save')}
      </button>
      <span className="bw-toolbar__sep" aria-hidden="true" />
      <button type="button" className="bw-button-ghost" onClick={handleExport}>
        {t('library.export')}
      </button>
      <button type="button" className="bw-button-ghost" onClick={handleImportClick}>
        {t('library.import')}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={handleImportFile}
      />
      {error && (
        <p className="bw-io-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
