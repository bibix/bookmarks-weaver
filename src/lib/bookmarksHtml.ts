import type { GeneratedNode } from '../types'

const escapeHtml = (input: string): string =>
  input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const renderNodes = (nodes: GeneratedNode[]): string =>
  nodes
    .map((node) => {
      if (node.type === 'folder') {
        return `<DT><H3>${escapeHtml(node.name)}</H3>\n<DL><p>\n${renderNodes(node.children)}\n</DL><p>`
      }

      if (node.type === 'bookmark') {
        const tags = node.tags.join(', ')
        const keywords = node.keywords.join(', ')
        const description = [node.description, `Tags: ${tags}`, `Keywords: ${keywords}`]
          .filter(Boolean)
          .join(' | ')

        return `<DT><A HREF="${escapeHtml(node.url)}">${escapeHtml(node.title)}</A>\n<DD>${escapeHtml(description)}`
      }

      return `<DD>${escapeHtml(node.text)}`
    })
    .join('\n')

export const generateBookmarksHtml = (nodes: GeneratedNode[]): string => `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${renderNodes(nodes)}
</DL><p>`
