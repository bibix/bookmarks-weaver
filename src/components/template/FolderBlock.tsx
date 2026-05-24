import { useTranslation } from 'react-i18next'
import {
  createBookmark,
  createComment,
  createFolder,
  useAppState,
} from '../../contexts/AppStateContext'
import type { TemplateFolder } from '../../types'
import { HandlebarsInput } from '../HandlebarsInput'
import { TemplateNodeView } from './TemplateNodeView'

export function FolderBlock({
  node,
  onDelete,
}: {
  node: TemplateFolder
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const { updateFolder, insertNode, removeNode } = useAppState()
  return (
    <li className="bw-block bw-block--folder" role="treeitem" aria-label={t('template.folder')}>
      <header className="bw-block__header">
        <span className="bw-block__tag" aria-hidden="true">{t('template.folder')}</span>
        <div className="bw-block__name">
          <HandlebarsInput
            value={node.name}
            onChange={(value) => updateFolder(node.id, { name: value })}
            placeholder={t('template.folderNamePlaceholder')}
            ariaLabel={t('template.folderName')}
          />
        </div>
        <div className="bw-block__actions">
          <button
            type="button"
            className="bw-button-ghost"
            onClick={() => insertNode(node.id, node.children.length, createFolder())}
          >
            + {t('template.folder')}
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={() => insertNode(node.id, node.children.length, createBookmark())}
          >
            + {t('template.bookmark')}
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={() => insertNode(node.id, node.children.length, createComment())}
          >
            + {t('template.comment')}
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={onDelete}
            aria-label={t('template.deleteFolder')}
          >
            {t('common.delete')}
          </button>
        </div>
      </header>
      <ul className="bw-folder__children" role="group">
        {node.children.length === 0 && (
          <li className="bw-folder__empty">
            <p className="bw-muted text-sm">{t('template.folderEmpty')}</p>
          </li>
        )}
        {node.children.map((child) => (
          <TemplateNodeView
            key={child.id}
            node={child}
            onDelete={() => removeNode(child.id)}
          />
        ))}
      </ul>
    </li>
  )
}
