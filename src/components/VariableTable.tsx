import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import type { Variable } from '../types'

interface Props {
  variable: Variable
}

export function VariableTable({ variable }: Props) {
  const { t } = useTranslation()
  const {
    addColumn,
    addRow,
    removeColumn,
    removeRow,
    removeVariable,
    renameColumn,
    renameVariable,
    setCell,
  } = useAppState()
  const [nameDraft, setNameDraft] = useState(variable.name)

  const blockStyle: CSSProperties = {
    backgroundColor: variable.color,
  }

  return (
    <section
      className="bw-vartable"
      aria-labelledby={`var-${variable.id}-name`}
      style={blockStyle}
    >
      <header className="bw-vartable__header">
        <label htmlFor={`var-${variable.id}-name`} className="sr-only">
          {t('variables.nameLabel')}
        </label>
        <input
          id={`var-${variable.id}-name`}
          className="bw-vartable__name"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => {
            if (nameDraft !== variable.name) renameVariable(variable.id, nameDraft)
            setNameDraft(variable.name)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          aria-label={t('variables.nameLabel')}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="bw-vartable__actions">
          <button
            type="button"
            className="bw-button-ghost"
            onClick={() => addColumn(variable.id)}
          >
            + {t('variables.addColumn')}
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={() => addRow(variable.id)}
          >
            + {t('variables.addRow')}
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={() => removeVariable(variable.id)}
            aria-label={t('a11y.removeVariable', { name: variable.name })}
          >
            {t('common.delete')}
          </button>
        </div>
      </header>
      <div className="bw-vartable__scroll">
        <table className="bw-vartable__table">
          <thead>
            <tr>
              {variable.columns.map((column) => (
                <th key={column.id} scope="col">
                  <div className="bw-vartable__th">
                    <input
                      className="bw-vartable__colname"
                      defaultValue={column.name}
                      onBlur={(e) => {
                        const next = e.target.value
                        if (next !== column.name) renameColumn(variable.id, column.id, next)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                      }}
                      aria-label={t('variables.columnName')}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    {variable.columns.length > 1 && (
                      <button
                        type="button"
                        className="bw-button-ghost bw-vartable__delcol"
                        onClick={() => removeColumn(variable.id, column.id)}
                        aria-label={t('a11y.removeColumn', { name: column.name })}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th scope="col" className="bw-vartable__rowspacer" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {variable.rows.map((row, ri) => (
              <tr key={ri}>
                {variable.columns.map((_column, ci) => (
                  <td key={ci}>
                    <textarea
                      className="bw-vartable__cell"
                      rows={1}
                      value={row[ci] ?? ''}
                      onChange={(e) => setCell(variable.id, ri, ci, e.target.value)}
                      aria-label={t('a11y.cell', { row: ri + 1, column: variable.columns[ci].name })}
                    />
                  </td>
                ))}
                <td className="bw-vartable__rowactions">
                  <button
                    type="button"
                    className="bw-button-ghost"
                    onClick={() => removeRow(variable.id, ri)}
                    aria-label={t('variables.removeRow', { index: ri + 1 })}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
