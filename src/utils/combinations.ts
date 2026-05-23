import type { AppState, GeneratedBookmark, Variable } from '../types'
import { substitute } from './urlParser'

const MAX_RESULTS = 5000

/**
 * Each Variable produces one "axis" of combinations:
 *   - list:  one row = one value bound to the variable name
 *   - table: one row = a record binding every column name to a cell value
 * The result is the Cartesian product over all axes.
 */
function buildAxes(variables: Variable[]): Array<Array<Record<string, string>>> {
  const axes: Array<Array<Record<string, string>>> = []
  for (const v of variables) {
    if (v.kind === 'list') {
      const rows = v.values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
      if (rows.length === 0) continue
      axes.push(rows.map((value) => ({ [v.name]: value })))
    } else {
      const rowCount = v.columns.reduce((max, c) => Math.max(max, c.values.length), 0)
      const rows: Array<Record<string, string>> = []
      for (let i = 0; i < rowCount; i++) {
        const binding: Record<string, string> = {}
        let anyValue = false
        for (const column of v.columns) {
          const value = (column.values[i] ?? '').trim()
          if (value.length > 0) anyValue = true
          binding[column.name] = value
        }
        if (anyValue) rows.push(binding)
      }
      if (rows.length === 0) continue
      axes.push(rows)
    }
  }
  return axes
}

/** Cartesian product of an array of axes; capped at {@link MAX_RESULTS} entries. */
export function cartesian(axes: Array<Array<Record<string, string>>>): Array<Record<string, string>> {
  let acc: Array<Record<string, string>> = [{}]
  for (const axis of axes) {
    const next: Array<Record<string, string>> = []
    for (const a of acc) {
      for (const b of axis) {
        next.push({ ...a, ...b })
        if (next.length >= MAX_RESULTS) return next
      }
    }
    acc = next
  }
  return acc
}

export interface GenerateResult {
  bookmarks: GeneratedBookmark[]
  truncated: boolean
}

export function generateBookmarks(state: AppState): GenerateResult {
  const axes = buildAxes(state.variables)
  const bindings = cartesian(axes)
  const truncated = bindings.length >= MAX_RESULTS
  const bookmarks: GeneratedBookmark[] = bindings.map((b) => {
    const url = substitute(state.urlTemplate, b)
    const name = substitute(state.nameTemplate || state.urlTemplate, b)
    const folder = substitute(state.folderTemplate, b)
    const keywords = substitute(state.keywordsTemplate, b)
    return { url, name, folder, keywords }
  })
  return { bookmarks, truncated }
}

export const RESULT_LIMIT = MAX_RESULTS
