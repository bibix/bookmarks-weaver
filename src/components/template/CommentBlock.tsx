import { useTranslation } from 'react-i18next'
import { useAppState } from '../../contexts/AppStateContext'
import type { TemplateComment } from '../../types'

export function CommentBlock({ node, onDelete }: { node: TemplateComment; onDelete: () => void }) {
  const { t } = useTranslation()
  const { updateComment } = useAppState()
  return (
    <div className="bw-block bw-block--comment" role="group" aria-label={t('template.comment')}>
      <span className="bw-block__tag" aria-hidden="true">{t('template.comment')}</span>
      <textarea
        className="bw-textarea"
        rows={2}
        value={node.text}
        placeholder={t('template.commentPlaceholder')}
        aria-label={t('template.comment')}
        onChange={(e) => updateComment(node.id, e.target.value)}
      />
      <div className="bw-block__actions">
        <button
          type="button"
          className="bw-button-ghost"
          onClick={onDelete}
          aria-label={t('template.deleteComment')}
        >
          {t('common.delete')}
        </button>
      </div>
    </div>
  )
}
