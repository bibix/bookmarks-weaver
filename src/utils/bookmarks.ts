import type { AnyResolvedNode } from '../types'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderNodes(nodes: AnyResolvedNode[], depth: number): string {
  const indent = '    '.repeat(depth)
  const lines: string[] = []
  for (const node of nodes) {
    if (node.kind === 'comment') {
      if (node.text) lines.push(`${indent}<!-- ${escapeHtml(node.text)} -->`)
    } else if (node.kind === 'folder') {
      lines.push(`${indent}<DT><H3>${escapeHtml(node.name || 'Folder')}</H3>`)
      lines.push(`${indent}<DL><p>`)
      lines.push(renderNodes(node.children, depth + 1))
      lines.push(`${indent}</DL><p>`)
    } else {
      const { bookmark } = node
      const attrs = [`HREF="${escapeHtml(bookmark.url)}"`, 'ADD_DATE="0"']
      if (bookmark.tags.length > 0) {
        attrs.push(`TAGS="${escapeHtml(bookmark.tags.join(','))}"`)
      }
      const title = bookmark.title || bookmark.url || 'Bookmark'
      lines.push(`${indent}<DT><A ${attrs.join(' ')}>${escapeHtml(title)}</A>`)
      if (bookmark.description) {
        lines.push(`${indent}<DD>${escapeHtml(bookmark.description)}`)
      }
      if (bookmark.keywords.length > 0) {
        lines.push(
          `${indent}<!-- keywords: ${escapeHtml(bookmark.keywords.join(', '))} -->`,
        )
      }
    }
  }
  return lines.filter((s) => s.length > 0).join('\n')
}

export function toNetscapeHtml(tree: AnyResolvedNode[]): string {
  return [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<!-- This is an automatically generated file. -->',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
    renderNodes(tree, 1),
    '</DL><p>',
    '',
  ].join('\n')
}

export function triggerDownload(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
