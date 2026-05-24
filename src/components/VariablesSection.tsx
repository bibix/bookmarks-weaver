import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { VariableTable } from './VariableTable'

export function VariablesSection() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const { variables } = state
  if (variables.length === 0) {
    return <p className="bw-muted">{t('variables.empty')}</p>
  }
  return (
    <div className="space-y-4" aria-live="polite">
      {variables.map((variable) => (
        <VariableTable key={variable.id} variable={variable} />
      ))}
    </div>
  )
}
