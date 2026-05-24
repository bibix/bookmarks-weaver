import { createReactBlockSpec } from '@blocknote/react'
import { useTranslation } from 'react-i18next'
import { HandlebarsInput } from '../HandlebarsInput'
import { TagListEditor } from './TagListEditor'
import { useStopBlockNoteTabbing } from './useStopBlockNoteTabbing'

/**
 * Bookmark block — structured card with handlebars-aware inputs for each
 * field. Stored as block props because BlockNote inline content can only
 * hold a single editable text run, but a bookmark has many distinct fields.
 *
 * `tags` and `keywords` are stored as newline-separated strings since
 * BlockNote propSchema only accepts primitive string / number / boolean
 * values.
 */
export const BookmarkBlockSpec = createReactBlockSpec(
  {
    type: 'bookmark',
    propSchema: {
      title: { default: '' as string },
      url: { default: '' as string },
      description: { default: '' as string },
      tags: { default: '' as string },
      keywords: { default: '' as string },
    },
    content: 'none',
  } as const,
  {
    render: (props) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation()
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const wrapperRef = useStopBlockNoteTabbing()
      const { block, editor } = props
      const update = (patch: Partial<typeof block.props>) => {
        editor.updateBlock(block, { props: { ...block.props, ...patch } })
      }
      const tagValues = splitList(block.props.tags)
      const keywordValues = splitList(block.props.keywords)
      return (
        <div
          ref={wrapperRef}
          className="bw-block bw-block--bookmark"
          role="group"
          aria-label={t('template.bookmark')}
        >
          <header className="bw-block__header">
            <span className="bw-block__tag" aria-hidden="true">
              {t('template.bookmark')}
            </span>
          </header>
          <div className="bw-block__grid">
            <div className="bw-field">
              <label className="bw-field__label">{t('template.title')}</label>
              <HandlebarsInput
                value={block.props.title}
                onChange={(value) => update({ title: value })}
                placeholder={t('template.titlePlaceholder')}
                ariaLabel={t('template.title')}
              />
            </div>
            <div className="bw-field">
              <label className="bw-field__label">{t('template.url')}</label>
              <HandlebarsInput
                value={block.props.url}
                onChange={(value) => update({ url: value })}
                placeholder={t('template.urlPlaceholder')}
                ariaLabel={t('template.url')}
              />
            </div>
            <div className="bw-field bw-field--full">
              <label className="bw-field__label">{t('template.description')}</label>
              <HandlebarsInput
                value={block.props.description}
                onChange={(value) => update({ description: value })}
                placeholder={t('template.descriptionPlaceholder')}
                ariaLabel={t('template.description')}
              />
            </div>
            <div className="bw-field">
              <label className="bw-field__label">{t('template.tags')}</label>
              <TagListEditor
                values={tagValues}
                onChange={(tags) => update({ tags: joinList(tags) })}
                placeholder={t('template.tagPlaceholder')}
                ariaLabel={t('template.tags')}
              />
            </div>
            <div className="bw-field">
              <label className="bw-field__label">{t('template.keywords')}</label>
              <TagListEditor
                values={keywordValues}
                onChange={(keywords) => update({ keywords: joinList(keywords) })}
                placeholder={t('template.keywordPlaceholder')}
                ariaLabel={t('template.keywords')}
              />
            </div>
          </div>
        </div>
      )
    },
    meta: {
      // `content: "none"` blocks default to non-selectable. We allow the
      // block itself to be selectable so users can drag/delete it via the
      // side menu, but interaction with the inner inputs is what they'll
      // mostly use.
      selectable: true,
    },
  },
)

function splitList(value: string): string[] {
  if (!value) return []
  return value.split('\n')
}

function joinList(values: string[]): string {
  return values.join('\n')
}
