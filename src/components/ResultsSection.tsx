import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { generateBookmarks } from '../utils/combinations'
import { toCsv, toJson, toNetscapeHtml, triggerDownload } from '../utils/bookmarks'

type Format = 'html' | 'json' | 'csv'

export function ResultsSection() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const [format, setFormat] = useState<Format>('html')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => generateBookmarks(state), [state])

  const handleDownload = () => {
    if (result.bookmarks.length === 0) return
    if (format === 'html') {
      triggerDownload('bookmarks.html', toNetscapeHtml(result.bookmarks), 'text/html')
    } else if (format === 'json') {
      triggerDownload('bookmarks.json', toJson(result.bookmarks), 'application/json')
    } else {
      triggerDownload('bookmarks.csv', toCsv(result.bookmarks), 'text/csv')
    }
  }

  const handleCopy = async () => {
    const text = result.bookmarks.map((b) => b.url).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {result.bookmarks.length === 0 ? (
          <p className="bw-muted">{t('results.summaryEmpty')}</p>
        ) : (
          <p>
            {t('results.summary', { count: result.bookmarks.length })}
            {result.truncated && ' (truncated)'}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-1 text-sm">
          <span>{t('results.format')}:</span>
          <select
            className="bw-select max-w-[10rem]"
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
          >
            <option value="html">{t('results.formatHtml')}</option>
            <option value="json">{t('results.formatJson')}</option>
            <option value="csv">{t('results.formatCsv')}</option>
          </select>
        </label>
        <button
          type="button"
          className="bw-button"
          onClick={handleDownload}
          disabled={result.bookmarks.length === 0}
        >
          {t('results.download')}
        </button>
        <button
          type="button"
          className="bw-button-ghost"
          onClick={handleCopy}
          disabled={result.bookmarks.length === 0}
        >
          {copied ? t('results.copied') : t('results.copy')}
        </button>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">{t('results.preview')}</h3>
        <div
          className="bw-surface rounded-md p-3 bw-monospace text-sm overflow-auto"
          style={{ maxHeight: '20rem' }}
          role="region"
          aria-label={t('results.preview')}
          tabIndex={0}
        >
          {result.bookmarks.length === 0 ? (
            <span className="bw-muted">—</span>
          ) : (
            <ul className="space-y-1">
              {result.bookmarks.map((b, i) => (
                <li key={i} className="break-all">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: 'var(--c-accent)' }}
                  >
                    {b.name || b.url}
                  </a>
                  <span className="bw-muted"> — {b.url}</span>
                  {b.folder && <span className="bw-muted"> [{b.folder}]</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
