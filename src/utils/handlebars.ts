import type { TemplateSegment, VarRef, Variable } from '../types'

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

export function isIdentifier(value: string): boolean {
  return IDENT.test(value)
}

export function toIdentifier(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9_]/g, '_')
  const safe = /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned
  return safe || 'variable'
}

export interface VariableIndex {
  byName: Map<string, Variable>
}

export function buildVariableIndex(variables: Variable[]): VariableIndex {
  const byName = new Map<string, Variable>()
  for (const v of variables) byName.set(v.name, v)
  return { byName }
}

/**
 * Parse a single template string into typed segments.
 * Recognises only `{{ name }}` and `{{ name.column }}` mustaches. Anything else
 * inside `{{ ... }}` is reported as invalid.
 */
export function parseTemplate(
  source: string,
  index: VariableIndex,
): TemplateSegment[] {
  const segments: TemplateSegment[] = []
  const re = /\{\{([^{}]*)\}\}/g
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    const start = match.index
    const end = start + match[0].length
    if (start > cursor) {
      segments.push({ kind: 'text', text: source.slice(cursor, start) })
    }
    const inner = match[1].trim()
    const dotParts = inner.split('.')
    if (dotParts.length === 1 && isIdentifier(dotParts[0])) {
      const ref: VarRef = { variable: dotParts[0] }
      const known = index.byName.has(ref.variable)
      segments.push({ kind: 'ref', raw: match[0], ref, valid: true, known, start, end })
    } else if (
      dotParts.length === 2 &&
      isIdentifier(dotParts[0]) &&
      isIdentifier(dotParts[1])
    ) {
      const ref: VarRef = { variable: dotParts[0], column: dotParts[1] }
      const variable = index.byName.get(ref.variable)
      const known = !!variable && variable.columns.some((c) => c.name === ref.column)
      segments.push({ kind: 'ref', raw: match[0], ref, valid: true, known, start, end })
    } else {
      segments.push({ kind: 'invalid', raw: match[0], start, end, reason: 'unrecognised expression' })
    }
    cursor = end
  }
  // Detect a stray opening `{{` with no closer.
  const trailing = source.slice(cursor)
  const strayOpen = trailing.indexOf('{{')
  if (strayOpen >= 0) {
    if (strayOpen > 0) {
      segments.push({ kind: 'text', text: trailing.slice(0, strayOpen) })
    }
    segments.push({
      kind: 'invalid',
      raw: trailing.slice(strayOpen),
      start: cursor + strayOpen,
      end: source.length,
      reason: 'unterminated expression',
    })
  } else if (trailing.length > 0) {
    segments.push({ kind: 'text', text: trailing })
  }
  return segments
}

/** Collect every valid variable reference within a template string. */
export function collectRefs(source: string): VarRef[] {
  const refs: VarRef[] = []
  const re = /\{\{([^{}]*)\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    const inner = m[1].trim()
    const parts = inner.split('.')
    if (parts.length === 1 && isIdentifier(parts[0])) {
      refs.push({ variable: parts[0] })
    } else if (parts.length === 2 && isIdentifier(parts[0]) && isIdentifier(parts[1])) {
      refs.push({ variable: parts[0], column: parts[1] })
    }
  }
  return refs
}

/**
 * Resolve a template string using a flat map of `name`→value or `name.col`→value
 * bindings. Unknown references are left as empty strings.
 */
export function renderTemplate(
  source: string,
  bindings: Record<string, string>,
): string {
  return source.replace(/\{\{([^{}]*)\}\}/g, (_match, inner) => {
    const key = String(inner).trim()
    const dotParts = key.split('.')
    const lookup =
      dotParts.length === 1 ? key : `${dotParts[0]}.${dotParts[1]}`
    return Object.prototype.hasOwnProperty.call(bindings, lookup)
      ? bindings[lookup]
      : ''
  })
}

export type PreviewSegment =
  | { kind: 'text'; text: string }
  | { kind: 'value'; text: string; variableName: string }
  | { kind: 'missing'; raw: string; reason: 'unknown' | 'invalid' }

/**
 * Build a preview of the template resolved using each variable's first row.
 * Variable substitutions are returned as `value` segments tagged with their
 * source variable, so the UI can keep the same colour as in the editor.
 */
export function previewSegments(
  source: string,
  index: VariableIndex,
): PreviewSegment[] {
  const segments = parseTemplate(source, index)
  const out: PreviewSegment[] = []
  for (const seg of segments) {
    if (seg.kind === 'text') {
      out.push({ kind: 'text', text: seg.text })
    } else if (seg.kind === 'invalid') {
      out.push({ kind: 'missing', raw: seg.raw, reason: 'invalid' })
    } else if (!seg.known) {
      out.push({ kind: 'missing', raw: seg.raw, reason: 'unknown' })
    } else {
      const variable = index.byName.get(seg.ref.variable)
      if (!variable) {
        out.push({ kind: 'missing', raw: seg.raw, reason: 'unknown' })
        continue
      }
      const row = variable.rows[0] ?? []
      const colIndex = seg.ref.column
        ? variable.columns.findIndex((c) => c.name === seg.ref.column)
        : 0
      const value = colIndex >= 0 ? row[colIndex] ?? '' : ''
      out.push({ kind: 'value', text: value, variableName: variable.name })
    }
  }
  return out
}

/** Resolve the output filename with `{{yyyy}}`, `{{mm}}`, `{{dd}}` shortcuts. */
export function renderFilename(template: string, now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const dict: Record<string, string> = {
    yyyy: String(now.getFullYear()),
    mm: pad(now.getMonth() + 1),
    dd: pad(now.getDate()),
    hh: pad(now.getHours()),
    min: pad(now.getMinutes()),
  }
  const rendered = template.replace(/\{\{([^{}]*)\}\}/g, (_m, inner) => {
    const key = String(inner).trim().toLowerCase()
    return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : ''
  })
  return rendered.trim() || 'bookmarks.html'
}
