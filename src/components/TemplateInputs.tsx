import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'

export function TemplateInputs() {
  const { t } = useTranslation()
  const { state, setNameTemplate, setFolderTemplate, setKeywordsTemplate } = useAppState()
  const nameId = useId()
  const folderId = useId()
  const keywordsId = useId()
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label htmlFor={nameId} className="block text-sm font-medium mb-1">
          {t('templates.name')}
        </label>
        <input
          id={nameId}
          className="bw-input bw-monospace"
          value={state.nameTemplate}
          placeholder={t('templates.namePlaceholder')}
          onChange={(e) => setNameTemplate(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div>
        <label htmlFor={folderId} className="block text-sm font-medium mb-1">
          {t('templates.folder')}
        </label>
        <input
          id={folderId}
          className="bw-input bw-monospace"
          value={state.folderTemplate}
          placeholder={t('templates.folderPlaceholder')}
          onChange={(e) => setFolderTemplate(e.target.value)}
          spellCheck={false}
        />
      </div>
      <div>
        <label htmlFor={keywordsId} className="block text-sm font-medium mb-1">
          {t('templates.keywords')}
        </label>
        <input
          id={keywordsId}
          className="bw-input bw-monospace"
          value={state.keywordsTemplate}
          placeholder={t('templates.keywordsPlaceholder')}
          onChange={(e) => setKeywordsTemplate(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
