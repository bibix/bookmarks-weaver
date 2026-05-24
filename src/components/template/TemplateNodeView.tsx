import type { TemplateNode } from '../../types'
import { BookmarkBlock } from './BookmarkBlock'
import { CommentBlock } from './CommentBlock'
import { FolderBlock } from './FolderBlock'

export function TemplateNodeView({
  node,
  onDelete,
}: {
  node: TemplateNode
  onDelete: () => void
}) {
  if (node.kind === 'folder') return <FolderBlock node={node} onDelete={onDelete} />
  if (node.kind === 'bookmark') {
    return (
      <li className="bw-folder__item">
        <BookmarkBlock node={node} onDelete={onDelete} />
      </li>
    )
  }
  return (
    <li className="bw-folder__item">
      <CommentBlock node={node} onDelete={onDelete} />
    </li>
  )
}
