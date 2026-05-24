import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core'
import { BookmarkBlockSpec } from './BookmarkBlock'
import { CommentBlockSpec } from './CommentBlock'
import { FolderBlockSpec } from './FolderBlock'

/**
 * Editor schema: keep the default paragraph block (so the user has somewhere
 * to type `/` and trigger the slash menu) plus our three template blocks.
 * Other defaults are intentionally omitted — the template is a structured
 * document, not free-form prose.
 */
export const templateSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    folder: FolderBlockSpec(),
    bookmark: BookmarkBlockSpec(),
    comment: CommentBlockSpec(),
  },
})

export type TemplateBlockSchema = typeof templateSchema.blockSchema
export type TemplateEditorInstance = typeof templateSchema.BlockNoteEditor
