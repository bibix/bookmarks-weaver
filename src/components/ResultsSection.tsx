import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { generate } from '../utils/generator'
import { toNetscapeHtml, triggerDownload } from '../utils/bookmarks'
import { renderFilename } from '../utils/handlebars'
import { PreviewTree } from './PreviewTree'

export function ResultsSection() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const result = useMemo(
    () => generate(state.template, state.variables),
    [state.template, state.variables],
  )

  const handleDownload = () => {
    const filename = renderFilename(state.outputFileName)
    triggerDownload(filename, toNetscapeHtml(result.tree), 'text/html')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite">
          {result.bookmarkCount === 0
            ? t('results.summaryEmpty')
            : t('results.summary', { count: result.bookmarkCount })}
        </p>
        <button
          type="button"
          className="bw-button"
          onClick={handleDownload}
          disabled={result.bookmarkCount === 0}
        >
          {t('results.download')}
        </button>
      </div>
      <div
        className="bw-surface rounded-xl p-3"
        role="region"
        aria-label={t('results.preview')}
      >
        <ul className="bw-preview" role="tree">
          <PreviewTree nodes={result.tree} />
        </ul>
      </div>
    </div>
  )
}
