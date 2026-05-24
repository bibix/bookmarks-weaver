import type { Block, PartialBlock } from '@blocknote/core'
import type { TemplateNode } from '../../types'
import { templateSchema } from './schema'

type TemplateBlockSchema = typeof templateSchema.blockSchema
type TemplateInlineSchema = typeof templateSchema.inlineContentSchema
type TemplateStyleSchema = typeof templateSchema.styleSchema
type TemplateBlock = Block<
  TemplateBlockSchema,
  TemplateInlineSchema,
  TemplateStyleSchema
>
export type PartialTemplateBlock = PartialBlock<
  TemplateBlockSchema,
  TemplateInlineSchema,
  TemplateStyleSchema
>

function inlineToString(content: TemplateBlock['content']): string {
  if (!Array.isArray(content)) return ''
  let out = ''
  for (const item of content as any[]) {
    if (!item) continue
    if (item.type === 'text' && typeof item.text === 'string') {
      out += item.text
    } else if (item.type === 'link' && Array.isArray(item.content)) {
      for (const sub of item.content) {
        if (sub && sub.type === 'text' && typeof sub.text === 'string') {
          out += sub.text
        }
      }
    }
  }
  return out
}

function splitList(value: string): string[] {
  if (!value) return []
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function joinList(values: string[]): string {
  return values.join('\n')
}

export function templateNodesToBlocks(
  nodes: TemplateNode[],
): PartialTemplateBlock[] {
  return nodes.map((node) => templateNodeToBlock(node))
}

function templateNodeToBlock(node: TemplateNode): PartialTemplateBlock {
  if (node.kind === 'folder') {
    return {
      id: node.id,
      type: 'folder',
      props: { name: node.name },
      children: templateNodesToBlocks(node.children),
    }
  }
  if (node.kind === 'bookmark') {
    return {
      id: node.id,
      type: 'bookmark',
      props: {
        title: node.title,
        url: node.url,
        description: node.description,
        tags: joinList(node.tags),
        keywords: joinList(node.keywords),
      },
    }
  }
  return {
    id: node.id,
    type: 'comment',
    content: node.text,
  }
}

/**
 * Convert the BlockNote document back into the template node tree.
 * Paragraphs and any other block types not in our schema are ignored — they
 * exist as scratch space for the user to type into and trigger the slash menu.
 */
export function blocksToTemplateNodes(blocks: TemplateBlock[]): TemplateNode[] {
  const out: TemplateNode[] = []
  for (const block of blocks) {
    const node = blockToTemplateNode(block)
    if (node) out.push(node)
  }
  return out
}

function blockToTemplateNode(block: TemplateBlock): TemplateNode | null {
  if (block.type === 'folder') {
    const props = block.props as { name: string }
    return {
      id: block.id,
      kind: 'folder',
      name: props.name ?? '',
      children: blocksToTemplateNodes(block.children as TemplateBlock[]),
    }
  }
  if (block.type === 'bookmark') {
    const props = block.props as {
      title: string
      url: string
      description: string
      tags: string
      keywords: string
    }
    return {
      id: block.id,
      kind: 'bookmark',
      title: props.title ?? '',
      url: props.url ?? '',
      description: props.description ?? '',
      tags: splitList(props.tags ?? ''),
      keywords: splitList(props.keywords ?? ''),
    }
  }
  if (block.type === 'comment') {
    return {
      id: block.id,
      kind: 'comment',
      text: inlineToString(block.content),
    }
  }
  return null
}
