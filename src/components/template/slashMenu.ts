import type { TFunction } from 'i18next'
import { markFolderForAutoFocus } from './focusRegistry'
import type { TemplateEditorInstance } from './schema'

export interface TemplateSlashMenuItem {
  title: string
  subtext?: string
  aliases?: readonly string[]
  group?: string
  onItemClick: () => void
}

/**
 * Slash-menu items that insert each of our custom block types in place of
 * the current (empty) paragraph block.
 */
export function getTemplateSlashMenuItems(
  editor: TemplateEditorInstance,
  t: TFunction,
): TemplateSlashMenuItem[] {
  const group = t('template.slashGroup')
  return [
    {
      title: t('template.folder'),
      subtext: t('template.folderSubtext'),
      aliases: ['folder', 'directory', 'group', 'fld'],
      group,
      onItemClick: () => {
        const ref = editor.getTextCursorPosition().block
        editor.insertBlocks(
          [{ type: 'folder', props: { name: '' } }],
          ref,
          'after',
        )
        const inserted = editor.getNextBlock(ref)
        if (inserted) {
          markFolderForAutoFocus(inserted.id)
          editor.removeBlocks([ref])
        }
      },
    },
    {
      title: t('template.bookmark'),
      subtext: t('template.bookmarkSubtext'),
      aliases: ['bookmark', 'link', 'url', 'bkm'],
      group,
      onItemClick: () => {
        const ref = editor.getTextCursorPosition().block
        editor.insertBlocks(
          [
            {
              type: 'bookmark',
              props: {
                title: '',
                url: '',
                description: '',
                tags: '',
                keywords: '',
              },
            },
          ],
          ref,
          'after',
        )
        const inserted = editor.getNextBlock(ref)
        if (inserted) editor.removeBlocks([ref])
      },
    },
    {
      title: t('template.comment'),
      subtext: t('template.commentSubtext'),
      aliases: ['comment', 'note', 'cmt'],
      group,
      onItemClick: () => {
        const ref = editor.getTextCursorPosition().block
        editor.insertBlocks(
          [{ type: 'comment', content: '' }],
          ref,
          'after',
        )
        const inserted = editor.getNextBlock(ref)
        if (inserted) {
          editor.setTextCursorPosition(inserted, 'end')
          editor.removeBlocks([ref])
        }
      },
    },
  ]
}
