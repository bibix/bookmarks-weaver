import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { ListVariableEditor } from './ListVariableEditor'
import { TableVariableEditor } from './TableVariableEditor'

export function VariablesSection() {
  const { t } = useTranslation()
  const { state, addListVariable, addTableVariable } = useAppState()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="bw-button-ghost" onClick={() => addListVariable()}>
          + {t('variables.addList')}
        </button>
        <button type="button" className="bw-button-ghost" onClick={() => addTableVariable()}>
          + {t('variables.addTable')}
        </button>
      </div>
      {state.variables.length === 0 && (
        <p className="bw-muted">{t('variables.empty')}</p>
      )}
      <div className="grid gap-3">
        {state.variables.map((variable) =>
          variable.kind === 'list' ? (
            <ListVariableEditor key={variable.id} variable={variable} />
          ) : (
            <TableVariableEditor key={variable.id} variable={variable} />
          ),
        )}
      </div>
    </div>
  )
}
