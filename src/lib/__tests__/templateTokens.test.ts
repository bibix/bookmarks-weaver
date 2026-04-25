import { describe, expect, it } from 'vitest'

import {
  extractHandlebarsTokens,
  isValidVariablePath,
  tokenExistsInVariables,
  updateTemplateTokenReferences,
  validateTokens,
} from '../templateTokens'
import type { VariableTable } from '../../types'

const tables: VariableTable[] = [
  {
    id: 'table-1',
    name: 'cluster',
    color: '#93c5fd',
    columns: [{ id: 'col-1', name: 'cluster', values: ['aaa'] }],
  },
  {
    id: 'table-2',
    name: 'address',
    color: '#86efac',
    columns: [
      { id: 'col-2', name: 'city', values: ['Berlin'] },
      { id: 'col-3', name: 'street', values: ['Main'] },
    ],
  },
]

describe('templateTokens', () => {
  it('extracts handlebars variables from text', () => {
    const tokens = extractHandlebarsTokens('hello {{ cluster }} {{ address.city }}')
    expect(tokens.map((token) => token.token)).toEqual(['cluster', 'address.city'])
  })

  it('validates variable token format', () => {
    expect(isValidVariablePath('cluster')).toBe(true)
    expect(isValidVariablePath('address.city')).toBe(true)
    expect(isValidVariablePath('address..city')).toBe(false)
    expect(isValidVariablePath('1wrong')).toBe(false)
  })

  it('checks variable existence against variable tables', () => {
    expect(tokenExistsInVariables('cluster', tables)).toBe(true)
    expect(tokenExistsInVariables('address.city', tables)).toBe(true)
    expect(tokenExistsInVariables('address.zip', tables)).toBe(false)
  })

  it('reports invalid and missing tokens', () => {
    const result = validateTokens('{{ cluster }} {{ address.zip }} {{ wrong..path }}', tables)

    expect(result.missingTokens.map((token) => token.token)).toContain('address.zip')
    expect(result.invalidTokens.map((token) => token.token)).toContain('wrong..path')
  })

  it('updates variable references in template text', () => {
    const next = updateTemplateTokenReferences(
      '{{ cluster }} {{ cluster.value }} {{ address.city }}',
      'cluster',
      'group',
    )

    expect(next).toContain('{{ group }}')
    expect(next).toContain('{{ group.value }}')
    expect(next).toContain('{{ address.city }}')
  })
})
