import type { ParsedUrl } from '../types'

const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//

/**
 * Parse a URL template (which may contain {placeholder} tokens) into structural parts.
 * Always tolerant — never throws — so the user can type incrementally.
 */
export function parseUrl(input: string): ParsedUrl {
  const raw = input ?? ''
  let rest = raw.trim()
  let scheme = ''
  let domain = ''
  let port = ''
  let path = ''
  let fragment = ''
  const query: { key: string; value: string }[] = []

  const schemeMatch = SCHEME_PATTERN.exec(rest)
  if (schemeMatch) {
    scheme = schemeMatch[1]
    rest = rest.slice(schemeMatch[0].length)
  } else if (rest && !rest.startsWith('/') && !rest.startsWith('?') && !rest.startsWith('#')) {
    scheme = 'https'
  }

  const hashIndex = rest.indexOf('#')
  if (hashIndex >= 0) {
    fragment = rest.slice(hashIndex + 1)
    rest = rest.slice(0, hashIndex)
  }

  const queryIndex = rest.indexOf('?')
  let queryString = ''
  if (queryIndex >= 0) {
    queryString = rest.slice(queryIndex + 1)
    rest = rest.slice(0, queryIndex)
  }

  const pathIndex = rest.indexOf('/')
  let authority = rest
  if (pathIndex >= 0) {
    authority = rest.slice(0, pathIndex)
    path = rest.slice(pathIndex)
  }

  if (authority) {
    const portMatch = /:(\d+|\{[^}]+\})$/.exec(authority)
    if (portMatch) {
      port = portMatch[1]
      domain = authority.slice(0, authority.length - portMatch[0].length)
    } else {
      domain = authority
    }
  }

  if (queryString) {
    for (const pair of queryString.split('&')) {
      if (!pair) continue
      const eq = pair.indexOf('=')
      if (eq < 0) {
        query.push({ key: pair, value: '' })
      } else {
        query.push({ key: pair.slice(0, eq), value: pair.slice(eq + 1) })
      }
    }
  }

  return { scheme, domain, port, path, query, fragment, raw }
}

/**
 * Apply variable substitutions to a template string. Placeholders are written as
 * `{variableName}`. Unknown placeholders are left intact.
 */
export function substitute(template: string, values: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match
  })
}

/** All placeholder names referenced inside a template string. */
export function findPlaceholders(template: string): string[] {
  const out = new Set<string>()
  const re = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(template))) out.add(m[1])
  return Array.from(out)
}

/** Sanitise an arbitrary string into a valid placeholder identifier. */
export function toIdentifier(input: string, fallback = 'variable'): string {
  const cleaned = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^([0-9])/, '_$1')
  return cleaned || fallback
}
