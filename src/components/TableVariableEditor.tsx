import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState, valuesToText } from '../contexts/AppStateContext'
import type { TableVariable } from '../types'

interface Props {
  variable: TableVariable
}

export function TableVariableEditor({ variable }: Props) {
  const { t } = useTranslation()
  const {
    renameVariable,
    removeVariable,
    addTableColumn,
    removeTableColumn,
    renameTableColumn,
    setTableColumnValues,
  } = useAppState()
  const nameId = useId()
  const rowCount = variable.columns.reduce(
    (max, c) => Math.max(max, c.values.filter((v) => v.trim().length > 0).length),
    0,
  )
  return (
    <article className="bw-surface rounded-xl p-3" aria-labelledby={`${nameId}-label`}>
      <header className="flex flex-wrap items-center gap-2 mb-2">
        <span className="bw-pill bw-pill--variable" aria-hidden="true">{`{${variable.name}}`}</span>
        <span className="text-xs uppercase tracking-wide bw-muted">{t('variables.table')}</span>
        <span className="text-xs bw-muted ml-auto">
          {t('variables.rowCount', { count: rowCount })}
        </span>
        <button
          type="button"
          className="bw-button-ghost"
          onClick={() => addTableColumn(variable.id)}
        >
          {t('variables.addColumn')}
        </button>
        <button
          type="button"
          className="bw-button-ghost"
          onClick={() => removeVariable(variable.id)}
          aria-label={t('a11y.removeVariable', { name: variable.name })}
        >
          ✕
        </button>
      </header>
      <div className="mb-3">
        <label htmlFor={nameId} id={`${nameId}-label`} className="block text-sm font-medium mb-1">
          {t('variables.nameLabel')}
        </label>
        <input
          id={nameId}
          className="bw-input"
          value={variable.name}
          onChange={(e) => renameVariable(variable.id, e.target.value)}
          placeholder={t('variables.namePlaceholder')}
        />
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${variable.columns.length}, minmax(160px, 1fr))` }}
      >
        {variable.columns.map((column) => (
          <div key={column.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <input
                className="bw-input flex-1"
                value={column.name}
                aria-label={t('variables.columnName')}
                onChange={(e) => renameTableColumn(variable.id, column.id, e.target.value)}
              />
              <button
                type="button"
                className="bw-button-ghost"
                onClick={() => removeTableColumn(variable.id, column.id)}
                aria-label={t('a11y.removeColumn', { name: column.name })}
                disabled={variable.columns.length <= 1}
              >
                ✕
              </button>
            </div>
            <span className="bw-pill bw-pill--variable text-xs" aria-hidden="true">
              {`{${column.name}}`}
            </span>
            <textarea
              className="bw-textarea"
              rows={5}
              value={valuesToText(column.values)}
              onChange={(e) => setTableColumnValues(variable.id, column.id, e.target.value)}
              aria-label={`${column.name} ${t('variables.valuesLabel')}`}
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </article>
  )
}
