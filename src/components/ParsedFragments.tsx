import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { parseUrl } from '../utils/urlParser'
import { Pill } from './Pill'
import type { FragmentKind } from '../types'

interface FragmentLabel {
  kind: FragmentKind
  label: string
  value: string
  empty?: boolean
}

export function ParsedFragments() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const parsed = useMemo(() => parseUrl(state.urlTemplate), [state.urlTemplate])

  const items: FragmentLabel[] = [
    { kind: 'scheme', label: t('parts.scheme'), value: parsed.scheme || 'https', empty: !parsed.scheme && !state.urlTemplate },
    { kind: 'domain', label: t('parts.domain'), value: parsed.domain || t('parts.empty') },
    { kind: 'port', label: t('parts.port'), value: parsed.port || t('parts.empty') },
    { kind: 'path', label: t('parts.path'), value: parsed.path || t('parts.empty') },
    { kind: 'fragment', label: t('parts.fragment'), value: parsed.fragment || t('parts.empty') },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="list" aria-label={t('sections.parsed')}>
        {items.map((item) => (
          <div role="listitem" key={item.kind} className="flex flex-col items-start gap-1 max-w-full">
            <span className="text-xs uppercase tracking-wide bw-muted">{item.label}</span>
            <Pill kind={item.kind} label={item.label}>{item.value}</Pill>
          </div>
        ))}
      </div>

      {parsed.query.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('sections.parameters')}</h3>
          <ul className="flex flex-col gap-2">
            {parsed.query.map((pair, i) => (
              <li
                key={`${pair.key}-${i}`}
                className="flex flex-wrap items-center gap-2 bw-surface rounded-md p-2"
              >
                <span className="text-xs uppercase tracking-wide bw-muted">
                  {t('parts.queryKey')}
                </span>
                <Pill kind="qkey" label={t('parts.queryKey')}>{pair.key}</Pill>
                <span aria-hidden="true" className="bw-muted">=</span>
                <span className="text-xs uppercase tracking-wide bw-muted">
                  {t('parts.queryValue')}
                </span>
                <Pill kind="qvalue" label={t('parts.queryValue')}>
                  {pair.value || t('parts.empty')}
                </Pill>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
