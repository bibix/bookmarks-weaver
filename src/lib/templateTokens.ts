import type { VariableTable } from '../types'

const HANDLEBARS_TOKEN_REGEX = /{{\s*([^{}]+?)\s*}}/g
const VARIABLE_PATH_REGEX = /^[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)?$/

export interface TokenInfo {
  raw: string
  token: string
  start: number
  end: number
}

export const extractHandlebarsTokens = (input: string): TokenInfo[] => {
  const tokens: TokenInfo[] = []
  const matches = input.matchAll(HANDLEBARS_TOKEN_REGEX)

  for (const match of matches) {
    const raw = match[0]
    const token = (match[1] ?? '').trim()
    const start = match.index ?? 0

    tokens.push({
      raw,
      token,
      start,
      end: start + raw.length,
    })
  }

  return tokens
}

export const isValidVariablePath = (token: string): boolean => VARIABLE_PATH_REGEX.test(token)

const tableHasColumn = (table: VariableTable, columnName: string): boolean =>
  table.columns.some((column) => column.name === columnName)

export const tokenExistsInVariables = (token: string, tables: VariableTable[]): boolean => {
  if (!isValidVariablePath(token)) {
    return false
  }

  const [tableName, ...nestedPath] = token.split('.')
  const table = tables.find((item) => item.name === tableName)

  if (!table) {
    return false
  }

  if (nestedPath.length === 0) {
    return table.columns.length === 1 || tableHasColumn(table, table.name)
  }

  return tableHasColumn(table, nestedPath[0])
}

export interface TokenValidationResult {
  invalidTokens: TokenInfo[]
  missingTokens: TokenInfo[]
}

export const validateTokens = (input: string, tables: VariableTable[]): TokenValidationResult => {
  const tokens = extractHandlebarsTokens(input)
  const invalidTokens: TokenInfo[] = []
  const missingTokens: TokenInfo[] = []

  for (const tokenInfo of tokens) {
    if (!isValidVariablePath(tokenInfo.token)) {
      invalidTokens.push(tokenInfo)
      continue
    }

    if (!tokenExistsInVariables(tokenInfo.token, tables)) {
      missingTokens.push(tokenInfo)
    }
  }

  return {
    invalidTokens,
    missingTokens,
  }
}

export const updateTemplateTokenReferences = (
  input: string,
  oldToken: string,
  newToken: string,
): string =>
  input.replace(HANDLEBARS_TOKEN_REGEX, (rawMatch, tokenContent: string) => {
    const trimmedToken = tokenContent.trim()

    if (trimmedToken === oldToken || trimmedToken.startsWith(`${oldToken}.`)) {
      const updated = trimmedToken.replace(oldToken, newToken)
      return `{{ ${updated} }}`
    }

    return rawMatch
  })
