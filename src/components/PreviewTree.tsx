import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyResolvedNode, ResolvedFolder } from '../types'

interface Props {
  nodes: AnyResolvedNode[]
}

function PreviewFolder({ folder }: { folder: ResolvedFolder }) {
  const [open, setOpen] = useState(true)
  return (
    <li className="bw-preview__folder">
      <button
        type="button"
        className="bw-preview__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span className="bw-preview__foldername">{folder.name}</span>
      </button>
      {open && (
        <ul className="bw-preview__children">
          <PreviewTree nodes={folder.children} />
        </ul>
      )}
    </li>
  )
}

export function PreviewTree({ nodes }: Props) {
  const { t } = useTranslation()
  if (nodes.length === 0) {
    return (
      <li className="bw-preview__empty">
        <span className="bw-muted">{t('results.previewEmpty')}</span>
      </li>
    )
  }
  return (
    <>
      {nodes.map((node) => {
        if (node.kind === 'folder') {
          return <PreviewFolder key={node.id} folder={node} />
        }
        if (node.kind === 'comment') {
          return (
            <li key={node.id} className="bw-preview__comment">
              <span aria-hidden="true">/* </span>
              <span>{node.text}</span>
              <span aria-hidden="true"> */</span>
            </li>
          )
        }
        const { bookmark } = node
        return (
          <li key={node.id} className="bw-preview__bookmark">
            <a
              href={bookmark.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bw-preview__title"
            >
              {bookmark.title || bookmark.url || t('results.untitled')}
            </a>
            {bookmark.url && (
              <div className="bw-preview__url bw-monospace">{bookmark.url}</div>
            )}
            {bookmark.description && (
              <div className="bw-preview__desc">{bookmark.description}</div>
            )}
            {bookmark.tags.length > 0 && (
              <div className="bw-preview__tags">
                {bookmark.tags.map((tag, i) => (
                  <span key={i} className="bw-preview__tag">{tag}</span>
                ))}
              </div>
            )}
            {bookmark.keywords.length > 0 && (
              <div className="bw-preview__keywords">
                <span className="bw-muted text-sm">{t('template.keywords')}:</span>{' '}
                <span className="bw-monospace text-sm">
                  {bookmark.keywords.join(' ')}
                </span>
              </div>
            )}
          </li>
        )
      })}
    </>
  )
}
