import type { BookmarkNode, CommentNode, FolderNode, TemplateNode } from '../types'

const splitListValue = (input: string): string[] =>
  input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const parseBookmarkLine = (content: string, id: string): BookmarkNode => {
  const payload = content.replace(/^bookmark\s*:\s*/i, '')
  const fields = payload.split('|').map((segment) => segment.trim())

  const data = new Map<string, string>()
  for (const field of fields) {
    const dividerIndex = field.indexOf('=')
    if (dividerIndex < 0) {
      continue
    }

    const key = field.slice(0, dividerIndex).trim().toLowerCase()
    const value = field.slice(dividerIndex + 1).trim()
    data.set(key, value)
  }

  return {
    id,
    type: 'bookmark',
    titleTemplate: data.get('title') ?? 'Untitled bookmark',
    urlTemplate: data.get('url') ?? 'https://localhost',
    descriptionTemplate: data.get('description') ?? '',
    tagsTemplate: splitListValue(data.get('tags') ?? ''),
    keywordsTemplate: splitListValue(data.get('keywords') ?? ''),
  }
}

const parseTemplateLine = (content: string, id: string): TemplateNode => {
  const lower = content.toLowerCase()

  if (lower.startsWith('bookmark:')) {
    return parseBookmarkLine(content, id)
  }

  if (lower.startsWith('comment:')) {
    const text = content.replace(/^comment\s*:\s*/i, '').trim()
    const comment: CommentNode = {
      id,
      type: 'comment',
      text,
    }
    return comment
  }

  const folderName = content.replace(/^folder\s*:\s*/i, '').trim()
  const folder: FolderNode = {
    id,
    type: 'folder',
    nameTemplate: folderName || 'Folder',
    children: [],
  }

  return folder
}

interface StackItem {
  depth: number
  node: FolderNode
}

export const parseTemplateDsl = (markdown: string): TemplateNode[] => {
  const rootNodes: TemplateNode[] = []
  const stack: StackItem[] = []
  let index = 0

  for (const line of markdown.split('\n')) {
    const match = line.match(/^(\s*)-\s+(.*)$/)
    if (!match) {
      continue
    }

    const leadingSpaces = match[1]?.length ?? 0
    const depth = Math.floor(leadingSpaces / 2)
    const content = (match[2] ?? '').trim()
    if (!content) {
      continue
    }

    const node = parseTemplateLine(content, `tpl-${index}`)
    index += 1

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]?.node
    if (parent) {
      parent.children.push(node)
    } else {
      rootNodes.push(node)
    }

    if (node.type === 'folder') {
      stack.push({ depth, node })
    }
  }

  return rootNodes
}

export const DEFAULT_TEMPLATE_DSL = `- folder: {{ cluster }}
  - folder: {{ index }}
    - bookmark: title={{ cluster }}-{{ index }} | url=https://localhost/{{ cluster }}/{{ index }} | description=Generated for {{ cluster }} and {{ index }} | tags=cluster-{{ cluster }},index-{{ index }} | keywords=bookmarks,weaver
    - comment: Add additional nested folders or bookmarks here.`
