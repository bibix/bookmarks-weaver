import { useTranslation } from 'react-i18next'
import { useAppState } from '../../contexts/AppStateContext'
import type { TemplateBookmark } from '../../types'
import { HandlebarsInput } from '../HandlebarsInput'
import { TagListEditor } from './TagListEditor'

export function BookmarkBlock({
  node,
  onDelete,
}: {
  node: TemplateBookmark
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const { updateBookmark } = useAppState()
  return (
    <div className="bw-block bw-block--bookmark" role="group" aria-label={t('template.bookmark')}>
      <header className="bw-block__header">
        <span className="bw-block__tag" aria-hidden="true">{t('template.bookmark')}</span>
        <div className="bw-block__actions">
          <button
            type="button"
            className="bw-button-ghost"
            onClick={onDelete}
            aria-label={t('template.deleteBookmark')}
          >
            {t('common.delete')}
          </button>
        </div>
      </header>
      <div className="bw-block__grid">
        <div className="bw-field">
          <label className="bw-field__label">{t('template.title')}</label>
          <HandlebarsInput
            value={node.title}
            onChange={(value) => updateBookmark(node.id, { title: value })}
            placeholder={t('template.titlePlaceholder')}
            ariaLabel={t('template.title')}
          />
        </div>
        <div className="bw-field">
          <label className="bw-field__label">{t('template.url')}</label>
          <HandlebarsInput
            value={node.url}
            onChange={(value) => updateBookmark(node.id, { url: value })}
            placeholder={t('template.urlPlaceholder')}
            ariaLabel={t('template.url')}
          />
        </div>
        <div className="bw-field bw-field--full">
          <label className="bw-field__label">{t('template.description')}</label>
          <HandlebarsInput
            value={node.description}
            onChange={(value) => updateBookmark(node.id, { description: value })}
            placeholder={t('template.descriptionPlaceholder')}
            ariaLabel={t('template.description')}
          />
        </div>
        <div className="bw-field">
          <label className="bw-field__label">{t('template.tags')}</label>
          <TagListEditor
            values={node.tags}
            onChange={(tags) => updateBookmark(node.id, { tags })}
            placeholder={t('template.tagPlaceholder')}
            ariaLabel={t('template.tags')}
          />
        </div>
        <div className="bw-field">
          <label className="bw-field__label">{t('template.keywords')}</label>
          <TagListEditor
            values={node.keywords}
            onChange={(keywords) => updateBookmark(node.id, { keywords })}
            placeholder={t('template.keywordPlaceholder')}
            ariaLabel={t('template.keywords')}
          />
        </div>
      </div>
    </div>
  )
}
