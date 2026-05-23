import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState, valuesToText } from '../contexts/AppStateContext'
import type { ListVariable } from '../types'

interface Props {
  variable: ListVariable
}

export function ListVariableEditor({ variable }: Props) {
  const { t } = useTranslation()
  const { renameVariable, setListValues, removeVariable } = useAppState()
  const nameId = useId()
  const valuesId = useId()
  const rowCount = variable.values.filter((v) => v.trim().length > 0).length
  return (
    <article
      className="bw-surface rounded-xl p-3"
      aria-labelledby={`${nameId}-label`}
    >
      <header className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className="bw-pill bw-pill--variable"
          aria-hidden="true"
        >{`{${variable.name}}`}</span>
        <span className="text-xs uppercase tracking-wide bw-muted">{t('variables.list')}</span>
        <span className="text-xs bw-muted ml-auto">
          {t('variables.rowCount', { count: rowCount })}
        </span>
        <button
          type="button"
          className="bw-button-ghost"
          onClick={() => removeVariable(variable.id)}
          aria-label={t('a11y.removeVariable', { name: variable.name })}
        >
          ✕
        </button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
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
        <div className="sm:col-span-2">
          <label htmlFor={valuesId} className="block text-sm font-medium mb-1">
            {t('variables.valuesLabel')}
          </label>
          <textarea
            id={valuesId}
            className="bw-textarea"
            rows={4}
            value={valuesToText(variable.values)}
            onChange={(e) => setListValues(variable.id, e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </article>
  )
}
