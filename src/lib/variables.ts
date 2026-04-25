import type { VariableColumn, VariableTable } from '../types'
import { extractHandlebarsTokens, isValidVariablePath, updateTemplateTokenReferences } from './templateTokens'

const COLORS = ['#93c5fd', '#86efac', '#fdba74', '#c4b5fd', '#67e8f9', '#fca5a5']

const safeName = (input: string): string => {
  const cleaned = input.trim().replace(/[^a-zA-Z0-9_]/g, '_')
  return cleaned || 'variable'
}

const createColumn = (name: string, values: string[] = ['']): VariableColumn => ({
  id: crypto.randomUUID(),
  name,
  values,
})

export const createVariableTable = (name: string, color?: string): VariableTable => ({
  id: crypto.randomUUID(),
  name: safeName(name),
  color: color ?? COLORS[Math.floor(Math.random() * COLORS.length)],
  columns: [createColumn(safeName(name))],
})

const hasColumn = (table: VariableTable, name: string): boolean =>
  table.columns.some((column) => column.name === name)

const getNextColor = (tables: VariableTable[]): string => COLORS[tables.length % COLORS.length]

export const ensureVariablesForTemplate = (tables: VariableTable[], template: string): VariableTable[] => {
  const tokens = extractHandlebarsTokens(template)
  if (tokens.length === 0) {
    return tables
  }

  let changed = false
  let nextTables = [...tables]

  for (const tokenInfo of tokens) {
    if (!isValidVariablePath(tokenInfo.token)) {
      continue
    }

    const [root, nested] = tokenInfo.token.split('.')
    let table = nextTables.find((item) => item.name === root)
    if (!table) {
      table = createVariableTable(root, getNextColor(nextTables))
      nextTables = [...nextTables, table]
      changed = true
    }

    if (nested && !hasColumn(table, nested)) {
      nextTables = nextTables.map((item) => {
        if (item.id !== table?.id) {
          return item
        }

        changed = true
        return {
          ...item,
          columns: [...item.columns, createColumn(nested)],
        }
      })
    }
  }

  return changed ? nextTables : tables
}

export const renameVariableInTemplate = (
  template: string,
  oldVariableName: string,
  newVariableName: string,
): string => updateTemplateTokenReferences(template, oldVariableName, safeName(newVariableName))

export const renameVariableColumnInTemplate = (
  template: string,
  tableName: string,
  oldColumnName: string,
  newColumnName: string,
): string =>
  updateTemplateTokenReferences(
    template,
    `${tableName}.${oldColumnName}`,
    `${tableName}.${safeName(newColumnName)}`,
  )

export const normalizeVariableName = safeName
