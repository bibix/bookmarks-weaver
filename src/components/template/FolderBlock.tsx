import { createReactBlockSpec } from '@blocknote/react'
import { useTranslation } from 'react-i18next'
import { HandlebarsInput } from '../HandlebarsInput'
import { consumeFolderAutoFocus } from './focusRegistry'
import { useStopBlockNoteTabbing } from './useStopBlockNoteTabbing'

/**
 * Folder block. The name is stored as a block prop (rather than as inline
 * content) so we can render it through `HandlebarsInput` and get the same
 * red-wavy / orange-wavy / coloured-pill feedback that bookmark fields use.
 *
 * Children (other folders, bookmarks, comments) are nested via BlockNote's
 * native nesting mechanism — Tab indents the next block under the folder.
 */
export const FolderBlockSpec = createReactBlockSpec(
  {
    type: 'folder',
    propSchema: {
      name: { default: '' as string },
    },
    content: 'none',
  } as const,
  {
    render: (props) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation()
      const { block, editor } = props
      // Once-per-creation focus signal set by the slash menu. Consumed on
      // first render of the new block.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const wrapperRef = useStopBlockNoteTabbing()
      const shouldAutoFocus = consumeFolderAutoFocus(block.id)

      const handleEnter = () => {
        const current = editor.getBlock(block.id)
        if (!current) return
        // Make sure the folder has at least one child so the cursor has
        // somewhere to land. Use a paragraph so the slash menu can replace
        // it with a bookmark / nested folder / comment.
        if (!current.children || current.children.length === 0) {
          // The children prop is typed against the folder schema slot;
          // cast so we can drop in a paragraph block.
          editor.updateBlock(current, {
            children: [{ type: 'paragraph' } as never],
          })
        }
        const refreshed = editor.getBlock(block.id)
        const first = refreshed?.children?.[0]
        if (first) {
          editor.focus()
          editor.setTextCursorPosition(first, 'end')
        }
      }

      return (
        <div
          ref={wrapperRef}
          className="bw-block bw-block--folder"
          role="group"
          aria-label={t('template.folder')}
        >
          <header className="bw-block__header">
            <span className="bw-block__tag" aria-hidden="true">
              {t('template.folder')}
            </span>
            <div className="bw-block__name">
              <HandlebarsInput
                value={block.props.name}
                onChange={(value) =>
                  editor.updateBlock(block, {
                    props: { ...block.props, name: value },
                  })
                }
                onEnter={handleEnter}
                autoFocus={shouldAutoFocus}
                placeholder={t('template.folderNamePlaceholder')}
                ariaLabel={t('template.folderName')}
              />
            </div>
          </header>
        </div>
      )
    },
    meta: {
      // `content: "none"` blocks should be non-selectable so the cursor
      // skips them when arrow-keying through the document. The inner
      // input handles its own keyboard.
      selectable: false,
    },
  },
)
