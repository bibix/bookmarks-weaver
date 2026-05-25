import { describe, expect, it } from 'vitest'

import { ensureVariablesForTemplate } from '../variables'
import type { VariableTable } from '../../types'

describe('ensureVariablesForTemplate', () => {
  it('creates table and nested column for table.column tokens', () => {
    const result = ensureVariablesForTemplate([], '{{ console.suffix }}')

    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('console')
    expect(result[0]?.columns.map((column) => column.name)).toEqual(['console', 'suffix'])
  })

  it('adds missing nested columns to existing tables without duplicates', () => {
    const initial: VariableTable[] = [
      {
        id: 'table-1',
        name: 'console',
        color: '#93c5fd',
        columns: [{ id: 'col-1', name: 'console', values: [''] }],
      },
    ]

    const result = ensureVariablesForTemplate(
      initial,
      '{{ console.suffix }} {{ console.suffix }} {{ console.region }}',
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.columns.map((column) => column.name)).toEqual(['console', 'suffix', 'region'])
  })

  it('ignores unsupported multi-level paths', () => {
    const result = ensureVariablesForTemplate([], '{{ console.env.suffix }}')

    expect(result).toHaveLength(0)
  })
})
