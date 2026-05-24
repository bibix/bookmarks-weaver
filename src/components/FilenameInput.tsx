import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { renderFilename } from '../utils/handlebars'

export function FilenameInput() {
  const { t } = useTranslation()
  const { state, setOutputFileName } = useAppState()
  const preview = useMemo(() => renderFilename(state.outputFileName), [state.outputFileName])
  return (
    <div className="space-y-2">
      <label htmlFor="bw-output-filename" className="block text-sm font-medium">
        {t('filename.label')}
      </label>
      <input
        id="bw-output-filename"
        type="text"
        className="bw-input bw-monospace"
        value={state.outputFileName}
        onChange={(e) => setOutputFileName(e.target.value)}
        placeholder="bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html"
        aria-describedby="bw-output-filename-help"
        spellCheck={false}
        autoComplete="off"
      />
      <p id="bw-output-filename-help" className="bw-muted text-sm">
        {t('filename.help')}
      </p>
      <p className="text-sm">
        <span className="bw-muted">{t('filename.preview')}: </span>
        <span className="bw-monospace">{preview}</span>
      </p>
    </div>
  )
}
