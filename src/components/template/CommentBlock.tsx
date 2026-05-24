import { createReactBlockSpec } from '@blocknote/react'
import { useTranslation } from 'react-i18next'

/**
 * Comment block — free-text note. Inline content lets the user type, and the
 * block carries a distinct visual treatment so the user can see at a glance
 * that it's a comment rather than something that will produce a bookmark.
 */
export const CommentBlockSpec = createReactBlockSpec(
  {
    type: 'comment',
    propSchema: {},
    content: 'inline',
  } as const,
  {
    render: (props) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation()
      return (
        <div
          className="bw-block bw-block--comment"
          role="group"
          aria-label={t('template.comment')}
        >
          <span className="bw-block__tag" aria-hidden="true">
            {t('template.comment')}
          </span>
          <div
            className="bw-block__inline bw-block__comment-text"
            ref={props.contentRef}
            data-placeholder={t('template.commentPlaceholder')}
          />
        </div>
      )
    },
  },
)
