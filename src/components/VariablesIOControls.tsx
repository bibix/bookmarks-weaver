import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { parseVariablesImport, serializeVariables } from '../utils/storage'
import { triggerDownload } from '../utils/bookmarks'

export function VariablesIOControls() {
  const { t } = useTranslation()
  const { state, setVariables } = useAppState()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = () => {
    triggerDownload(
      'variables.json',
      serializeVariables(state.variables),
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
      const variables = parseVariablesImport(text)
      setVariables(variables)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="bw-toolbar" role="toolbar" aria-label={t('library.variablesToolbar')}>
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
