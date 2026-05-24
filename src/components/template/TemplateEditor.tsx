import { useTranslation } from 'react-i18next'
import {
  createBookmark,
  createComment,
  createFolder,
  useAppState,
} from '../../contexts/AppStateContext'
import { TemplateNodeView } from './TemplateNodeView'

export function TemplateEditor() {
  const { t } = useTranslation()
  const { state, insertNode, removeNode } = useAppState()
  const { template } = state
  return (
    <div className="bw-editor" aria-label={t('template.editor')}>
      <ul className="bw-editor__root" role="tree">
        {template.length === 0 && (
          <li className="bw-folder__empty">
            <p className="bw-muted text-sm">{t('template.empty')}</p>
          </li>
        )}
        {template.map((node) => (
          <TemplateNodeView
            key={node.id}
            node={node}
            onDelete={() => removeNode(node.id)}
          />
        ))}
      </ul>
      <div className="bw-editor__actions">
        <button
          type="button"
          className="bw-button-ghost"
          onClick={() => insertNode(null, state.template.length, createFolder())}
        >
          + {t('template.folder')}
        </button>
        <button
          type="button"
          className="bw-button-ghost"
          onClick={() => insertNode(null, state.template.length, createBookmark())}
        >
          + {t('template.bookmark')}
        </button>
        <button
          type="button"
          className="bw-button-ghost"
          onClick={() => insertNode(null, state.template.length, createComment())}
        >
          + {t('template.comment')}
        </button>
      </div>
    </div>
  )
}
