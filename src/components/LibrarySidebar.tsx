import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { useLibrary } from '../contexts/LibraryContext'
import {
  libraryFolderOptions,
  type LibraryFolderNode,
  type LibraryNode,
  type LibraryTemplateNode,
} from '../utils/storage'

function NodeRow({
  node,
  depth,
  parentLength,
  index,
}: {
  node: LibraryNode
  depth: number
  parentLength: number
  index: number
}) {
  const { t } = useTranslation()
  const { setTemplate } = useAppState()
  const { roots, rename, remove, reorder, move } = useLibrary()
  const [expanded, setExpanded] = useState(true)

  const handleRename = () => {
    const nextName = window.prompt(t('library.renamePrompt'), node.name)
    if (nextName === null) return
    if (node.kind === 'template') {
      const nextDesc = window.prompt(t('library.descPrompt'), node.description) ?? node.description
      rename(node.id, { name: nextName, description: nextDesc })
    } else {
      rename(node.id, { name: nextName })
    }
  }

  const handleDelete = () => {
    if (!window.confirm(t('library.deleteConfirm', { name: node.name }))) return
    remove(node.id)
  }

  const handleMove = () => {
    const options = libraryFolderOptions(roots)
    // Build a textual prompt — keep it lightweight; a proper modal would be
    // nicer but this stays within scope.
    const lines = options.map(
      (opt, i) => `${i}. ${'  '.repeat(opt.depth)}${opt.id === null ? '/' : opt.name}`,
    )
    const choice = window.prompt(
      `${t('library.movePrompt')}\n\n${lines.join('\n')}`,
      '0',
    )
    if (choice === null) return
    const idx = Number.parseInt(choice, 10)
    if (Number.isNaN(idx) || idx < 0 || idx >= options.length) return
    move(node.id, options[idx].id, Number.MAX_SAFE_INTEGER)
  }

  const handleLoad = () => {
    if (node.kind !== 'template') return
    setTemplate(node.template)
  }

  return (
    <li className="bw-lib__row" style={{ paddingLeft: `${depth * 0.75}rem` }}>
      <div className="bw-lib__rowmain">
        {node.kind === 'folder' ? (
          <button
            type="button"
            className="bw-lib__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            title={node.name}
          >
            <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
            <span className="bw-lib__name">{node.name}</span>
          </button>
        ) : (
          <button
            type="button"
            className="bw-lib__entry"
            onClick={handleLoad}
            title={t('library.loadTooltip')}
          >
            <span aria-hidden="true">📑</span>
            <span className="bw-lib__entrytext">
              <span className="bw-lib__name">{node.name}</span>
              {(node as LibraryTemplateNode).description && (
                <span className="bw-lib__desc">
                  {(node as LibraryTemplateNode).description}
                </span>
              )}
            </span>
          </button>
        )}
        <div className="bw-lib__actions">
          <button
            type="button"
            className="bw-lib__iconbtn"
            onClick={() => reorder(node.id, -1)}
            disabled={index === 0}
            aria-label={t('library.moveUp')}
            title={t('library.moveUp')}
          >
            ▲
          </button>
          <button
            type="button"
            className="bw-lib__iconbtn"
            onClick={() => reorder(node.id, 1)}
            disabled={index === parentLength - 1}
            aria-label={t('library.moveDown')}
            title={t('library.moveDown')}
          >
            ▼
          </button>
          <button
            type="button"
            className="bw-lib__iconbtn"
            onClick={handleMove}
            aria-label={t('library.move')}
            title={t('library.move')}
          >
            ⤴
          </button>
          <button
            type="button"
            className="bw-lib__iconbtn"
            onClick={handleRename}
            aria-label={t('library.rename')}
            title={t('library.rename')}
          >
            ✎
          </button>
          <button
            type="button"
            className="bw-lib__iconbtn bw-lib__iconbtn--danger"
            onClick={handleDelete}
            aria-label={t('library.deleteAria', { name: node.name })}
            title={t('library.delete')}
          >
            ×
          </button>
        </div>
      </div>
      {node.kind === 'folder' && expanded && (
        <NodeList nodes={(node as LibraryFolderNode).children} depth={depth + 1} />
      )}
    </li>
  )
}

function NodeList({ nodes, depth }: { nodes: LibraryNode[]; depth: number }) {
  return (
    <ul className="bw-lib__list" role="group">
      {nodes.map((node, i) => (
        <NodeRow
          key={node.id}
          node={node}
          depth={depth}
          parentLength={nodes.length}
          index={i}
        />
      ))}
    </ul>
  )
}

export function LibrarySidebar() {
  const { t } = useTranslation()
  const { state } = useAppState()
  const { roots, addTemplate, createFolder } = useLibrary()

  const handleSave = () => {
    const name = window.prompt(t('library.namePrompt'))
    if (!name) return
    const description = window.prompt(t('library.descPrompt')) ?? ''
    addTemplate(null, { name, description, template: state.template })
  }

  const handleNewFolder = () => {
    const name = window.prompt(t('library.newFolderPrompt'))
    if (!name) return
    createFolder(null, name)
  }

  return (
    <aside
      className="bw-lib bw-surface rounded-2xl p-3"
      aria-label={t('library.sidebar')}
    >
      <header className="bw-lib__header">
        <h2 className="bw-lib__title">{t('library.sidebar')}</h2>
      </header>
      <div className="bw-lib__toolbar">
        <button type="button" className="bw-button-ghost" onClick={handleSave}>
          {t('library.save')}
        </button>
        <button type="button" className="bw-button-ghost" onClick={handleNewFolder}>
          {t('library.newFolder')}
        </button>
      </div>
      {roots.length === 0 ? (
        <p className="bw-muted text-sm bw-lib__empty">{t('library.empty')}</p>
      ) : (
        <nav aria-label={t('library.sidebar')}>
          <NodeList nodes={roots} depth={0} />
        </nav>
      )}
    </aside>
  )
}
