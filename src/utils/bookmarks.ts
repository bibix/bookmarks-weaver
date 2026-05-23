import type { GeneratedBookmark } from '../types'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildFolderTree(items: GeneratedBookmark[]): FolderNode {
  const root: FolderNode = { name: '', children: new Map(), bookmarks: [] }
  for (const item of items) {
    const segments = (item.folder || '')
      .split('/')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    let node = root
    for (const segment of segments) {
      let next = node.children.get(segment)
      if (!next) {
        next = { name: segment, children: new Map(), bookmarks: [] }
        node.children.set(segment, next)
      }
      node = next
    }
    node.bookmarks.push(item)
  }
  return root
}

interface FolderNode {
  name: string
  children: Map<string, FolderNode>
  bookmarks: GeneratedBookmark[]
}

function renderNode(node: FolderNode, depth: number): string {
  const indent = '    '.repeat(depth)
  const lines: string[] = []
  for (const bookmark of node.bookmarks) {
    const attrs = [`HREF="${escapeHtml(bookmark.url)}"`, 'ADD_DATE="0"']
    if (bookmark.keywords) attrs.push(`TAGS="${escapeHtml(bookmark.keywords)}"`)
    lines.push(`${indent}<DT><A ${attrs.join(' ')}>${escapeHtml(bookmark.name || bookmark.url)}</A>`)
  }
  for (const child of node.children.values()) {
    lines.push(`${indent}<DT><H3>${escapeHtml(child.name)}</H3>`)
    lines.push(`${indent}<DL><p>`)
    lines.push(renderNode(child, depth + 1))
    lines.push(`${indent}</DL><p>`)
  }
  return lines.join('\n')
}

export function toNetscapeHtml(items: GeneratedBookmark[]): string {
  const tree = buildFolderTree(items)
  return [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<!-- This is an automatically generated file. -->',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
    renderNode(tree, 1),
    '</DL><p>',
    '',
  ].join('\n')
}

export function toJson(items: GeneratedBookmark[]): string {
  return JSON.stringify(items, null, 2)
}

export function toCsv(items: GeneratedBookmark[]): string {
  const headers = ['name', 'url', 'folder', 'keywords']
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`
  const rows = items.map((i) => [i.name, i.url, i.folder, i.keywords].map(escape).join(','))
  return [headers.join(','), ...rows].join('\n')
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
