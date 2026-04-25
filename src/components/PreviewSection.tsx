import type { GeneratedNode } from '../types'

interface PreviewSectionProps {
  nodes: GeneratedNode[]
  generatedUrls: string[]
  onDownload: () => void
}

const renderNode = (node: GeneratedNode): JSX.Element => {
  if (node.type === 'folder') {
    return (
      <li key={node.id} className="space-y-2">
        <details open>
          <summary className="cursor-pointer rounded px-2 py-1 font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
            📁 {node.name}
          </summary>
          {node.children.length > 0 ? (
            <ul className="ml-4 mt-2 space-y-2 border-l border-slate-300 pl-3 dark:border-slate-700">
              {node.children.map((child) => renderNode(child))}
            </ul>
          ) : null}
        </details>
      </li>
    )
  }

  if (node.type === 'bookmark') {
    return (
      <li key={node.id} className="rounded border border-slate-300 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="font-semibold text-slate-900 dark:text-slate-100">🔖 {node.title}</p>
        <p className="break-all text-sky-700 dark:text-sky-300">{node.url}</p>
        {node.description ? <p className="text-slate-700 dark:text-slate-300">{node.description}</p> : null}
        {node.tags.length > 0 ? (
          <p className="text-slate-700 dark:text-slate-300">Tags: {node.tags.filter(Boolean).join(', ')}</p>
        ) : null}
        {node.keywords.length > 0 ? (
          <p className="text-slate-700 dark:text-slate-300">Keywords: {node.keywords.filter(Boolean).join(', ')}</p>
        ) : null}
      </li>
    )
  }

  return (
    <li key={node.id} className="rounded border-l-4 border-amber-400 bg-amber-50 p-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      💬 {node.text}
    </li>
  )
}

export const PreviewSection = ({ nodes, generatedUrls, onDownload }: PreviewSectionProps) => (
  <div className="space-y-4">
    <button
      type="button"
      onClick={onDownload}
      className="min-h-11 rounded-md bg-teal-600 px-6 py-2 font-semibold text-white transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
    >
      Download bookmarks file
    </button>

    <div className="max-h-96 overflow-auto rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
      {nodes.length > 0 ? (
        <ul className="space-y-2">{nodes.map((node) => renderNode(node))}</ul>
      ) : (
        <p className="text-sm text-slate-700 dark:text-slate-300">No generated items yet.</p>
      )}
    </div>

    <div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Generated URLs</h3>
      <div className="max-h-40 overflow-auto rounded border border-slate-300 bg-slate-950 p-2 font-mono text-sm text-slate-100 dark:border-slate-700">
        {generatedUrls.length > 0 ? generatedUrls.join('\n') : 'No URLs generated yet.'}
      </div>
    </div>
  </div>
)
