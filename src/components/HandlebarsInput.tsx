import { useId, useMemo, useRef, useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { buildVariableIndex, parseTemplate, previewSegments } from '../utils/handlebars'
import type { TemplateSegment, Variable } from '../types'

interface Props {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  ariaLabel: string
  className?: string
  onEnter?: () => void
  /**
   * Focus the input on mount. Used by blocks that are inserted via the
   * slash menu and want the user to land directly on their primary field.
   */
  autoFocus?: boolean
}

function variableColor(variables: Variable[], name: string): string | null {
  const variable = variables.find((v) => v.name === name)
  return variable?.color ?? null
}

function segmentStyle(seg: TemplateSegment, variables: Variable[]): CSSProperties {
  // IMPORTANT: every style on a non-text segment must be metrically
  // invisible — no padding, no font-weight, no font-size, no letter-spacing
  // — because the overlay sits on top of a real `<input>` whose character
  // widths are fixed. Anything that changes glyph width misaligns the
  // overlay from the input's cursor and selection rectangles.
  if (seg.kind === 'text') return {}
  if (seg.kind === 'invalid') {
    return {
      textDecoration: 'underline wavy var(--c-error, #dc2626) 2px',
      textDecorationSkipInk: 'none',
      backgroundColor: 'rgba(220, 38, 38, 0.08)',
      borderRadius: '0.25rem',
    }
  }
  if (!seg.known) {
    return {
      textDecoration: 'underline double wavy var(--c-warn, #f59e0b) 2px',
      textDecorationSkipInk: 'none',
    }
  }
  const color = variableColor(variables, seg.ref.variable)
  return {
    backgroundColor: color ?? 'var(--c-variable-bg)',
    color: '#1f2937',
    borderRadius: '0.2rem',
  }
}

/**
 * Single-line input that surfaces handlebars segments through a coloured
 * overlay rendered behind the text. The user types into a real `<input>` so
 * keyboard accessibility and IME composition work normally.
 */
export function HandlebarsInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  onEnter,
  autoFocus,
}: Props) {
  const id = useId()
  const { t } = useTranslation()
  const { state } = useAppState()
  const variables = state.variables
  const index = useMemo(() => buildVariableIndex(variables), [variables])
  const segments = useMemo(() => parseTemplate(value, index), [value, index])
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const input = inputRef.current
    const overlay = overlayRef.current
    if (!input || !overlay) return
    const sync = () => {
      overlay.scrollLeft = input.scrollLeft
    }
    input.addEventListener('scroll', sync)
    return () => input.removeEventListener('scroll', sync)
  }, [])

  useEffect(() => {
    if (!autoFocus) return
    inputRef.current?.focus()
    // Only run on mount — re-triggering would steal focus on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const issues = useMemo(() => {
    const errors = segments.filter((s) => s.kind === 'invalid').length
    const warnings = segments.filter((s) => s.kind === 'ref' && !s.known).length
    return { errors, warnings }
  }, [segments])

  const preview = useMemo(() => previewSegments(value, index), [value, index])
  const hasRefs = useMemo(
    () => segments.some((s) => s.kind === 'ref' || s.kind === 'invalid'),
    [segments],
  )

  return (
    <div className={`hb-wrap ${className ?? ''}`}>
      <div className="hb-stack">
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="hb-overlay"
        >
          {value.length === 0 && !focused && placeholder ? (
            <span className="hb-placeholder">{placeholder}</span>
          ) : (
            segments.map((seg, i) => (
              <span key={i} style={segmentStyle(seg, variables)}>
                {seg.kind === 'text' ? seg.text : seg.raw}
              </span>
            ))
          )}
          <span>&#8203;</span>
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="hb-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) {
              e.preventDefault()
              onEnter()
            }
          }}
          aria-label={ariaLabel}
          aria-describedby={`${id}-desc`}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <span id={`${id}-desc`} className="sr-only" aria-live="polite">
        {issues.errors > 0 && t('handlebars.invalid', { count: issues.errors })}
        {issues.warnings > 0 && t('handlebars.unknown', { count: issues.warnings })}
      </span>
      {hasRefs && (
        <div className="hb-preview" aria-live="polite">
          <span className="hb-preview__label bw-muted">{t('handlebars.preview')}</span>
          {preview.map((seg, i) => {
            if (seg.kind === 'text') return <span key={i}>{seg.text}</span>
            if (seg.kind === 'missing') {
              return (
                <span key={i} className="hb-preview__missing">
                  {seg.raw}
                </span>
              )
            }
            const color = variableColor(variables, seg.variableName)
            return (
              <span
                key={i}
                className="hb-preview__value"
                style={{ backgroundColor: color ?? 'var(--c-variable-bg)' }}
              >
                {seg.text || ' '}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
