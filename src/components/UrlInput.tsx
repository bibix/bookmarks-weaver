import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { parseUrl } from '../utils/urlParser'
import { SelectionPopup } from './SelectionPopup'
import type { UrlToken } from '../types'

/**
 * Tokenise the URL template into colour-coded fragments. The output preserves the
 * original string exactly (concatenating all `.text` reproduces the input) so we
 * can render an absolutely-positioned "highlight" layer underneath the textarea
 * that lines up character-for-character with the editor.
 */
function tokeniseTemplate(raw: string): UrlToken[] {
  const tokens: UrlToken[] = []
  const parsed = parseUrl(raw)
  // We rebuild the URL by walking the original text and matching the parts in order.
  let cursor = 0
  const pushLiteral = (until: number) => {
    if (until > cursor) tokens.push({ kind: 'literal', text: raw.slice(cursor, until) })
    cursor = until
  }
  const consume = (text: string, kind: UrlToken['kind']) => {
    if (!text) return
    const idx = raw.indexOf(text, cursor)
    if (idx < 0) return
    pushLiteral(idx)
    expandTokensWithPlaceholders(raw.slice(idx, idx + text.length), kind, tokens)
    cursor = idx + text.length
  }

  if (parsed.scheme && raw.startsWith(`${parsed.scheme}://`)) {
    consume(parsed.scheme, 'scheme')
    pushLiteral(cursor + 3) // "://"
  }
  if (parsed.domain) consume(parsed.domain, 'domain')
  if (parsed.port) {
    // skip the ":" literal
    if (raw[cursor] === ':') {
      pushLiteral(cursor + 1)
    }
    consume(parsed.port, 'port')
  }
  if (parsed.path) consume(parsed.path, 'path')
  if (parsed.query.length > 0) {
    if (raw[cursor] === '?') pushLiteral(cursor + 1)
    parsed.query.forEach((pair, idx) => {
      if (idx > 0 && raw[cursor] === '&') pushLiteral(cursor + 1)
      consume(pair.key, 'qkey')
      if (raw[cursor] === '=') pushLiteral(cursor + 1)
      if (pair.value) consume(pair.value, 'qvalue')
    })
  }
  if (parsed.fragment) {
    if (raw[cursor] === '#') pushLiteral(cursor + 1)
    consume(parsed.fragment, 'fragment')
  }
  pushLiteral(raw.length)
  return tokens
}

/**
 * Split a text segment into sub-tokens, treating `{name}` placeholders as the
 * `variable` kind regardless of which URL part they sit inside.
 */
function expandTokensWithPlaceholders(text: string, kind: UrlToken['kind'], out: UrlToken[]) {
  const re = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ kind, text: text.slice(last, m.index) })
    out.push({ kind: 'variable', text: m[0], variableName: m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ kind, text: text.slice(last) })
}

const KIND_CLASS: Record<UrlToken['kind'], string> = {
  scheme: 'bw-pill--scheme',
  domain: 'bw-pill--domain',
  port: 'bw-pill--port',
  path: 'bw-pill--path',
  qkey: 'bw-pill--qkey',
  qvalue: 'bw-pill--qvalue',
  fragment: 'bw-pill--fragment',
  variable: 'bw-pill--variable',
  literal: '',
}

interface SelectionInfo {
  start: number
  end: number
  text: string
  x: number
  y: number
}

export function UrlInput() {
  const { t } = useTranslation()
  const { state, setUrlTemplate, createVariableFromSelection } = useAppState()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const highlightRef = useRef<HTMLDivElement | null>(null)
  const [selection, setSelection] = useState<SelectionInfo | null>(null)
  const id = useId()

  const tokens = useMemo(() => tokeniseTemplate(state.urlTemplate), [state.urlTemplate])

  const syncScroll = useCallback(() => {
    const input = inputRef.current
    const highlight = highlightRef.current
    if (!input || !highlight) return
    highlight.scrollTop = input.scrollTop
    highlight.scrollLeft = input.scrollLeft
  }, [])

  useLayoutEffect(() => {
    syncScroll()
  }, [state.urlTemplate, syncScroll])

  const handleSelect = useCallback(() => {
    const input = inputRef.current
    if (!input) {
      setSelection(null)
      return
    }
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    if (start === end) {
      setSelection(null)
      return
    }
    const text = input.value.slice(start, end)
    const rect = input.getBoundingClientRect()
    setSelection({
      start,
      end,
      text,
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 4,
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setSelection(null)
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [])

  const handleConfirm = (name: string) => {
    if (!selection) return
    createVariableFromSelection({
      selection: selection.text,
      start: selection.start,
      end: selection.end,
      suggestedName: name,
    })
    setSelection(null)
    inputRef.current?.focus()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrlTemplate(text)
    } catch {
      // clipboard may be denied; ignore silently and rely on native paste.
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        {t('input.label')}
      </label>
      <div className="relative">
        <div
          ref={highlightRef}
          aria-hidden="true"
          className="bw-input bw-monospace absolute inset-0 pointer-events-none whitespace-pre-wrap break-all overflow-hidden"
          style={{ color: 'transparent' }}
        >
          {tokens.map((tok, i) => (
            <span key={i} className={KIND_CLASS[tok.kind]} style={{ borderRadius: 4 }}>
              {tok.text}
            </span>
          ))}
          {/* trailing char keeps the highlight box from collapsing on empty input */}
          {'​'}
        </div>
        <textarea
          id={id}
          ref={inputRef}
          className="bw-input bw-monospace relative bg-transparent"
          style={{ minHeight: '3.25rem', resize: 'vertical' }}
          rows={2}
          placeholder={t('input.placeholder')}
          value={state.urlTemplate}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-describedby={`${id}-help`}
          onChange={(e) => {
            setUrlTemplate(e.target.value)
            setSelection(null)
          }}
          onSelect={handleSelect}
          onScroll={syncScroll}
          onBlur={() => window.setTimeout(() => setSelection(null), 200)}
        />
      </div>
      <p id={`${id}-help`} className="bw-muted text-sm">
        {t('sections.inputHelp')}
      </p>
      <div className="flex gap-2">
        <button type="button" className="bw-button-ghost" onClick={handlePaste}>
          {t('input.paste')}
        </button>
      </div>
      {selection && (
        <SelectionPopup
          x={selection.x}
          y={selection.y}
          selectionText={selection.text}
          onConfirm={handleConfirm}
          onCancel={() => setSelection(null)}
        />
      )}
    </div>
  )
}
