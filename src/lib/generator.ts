import Handlebars from 'handlebars'

import type {
  BookmarkNode,
  CommentNode,
  FolderNode,
  GeneratedBookmark,
  GeneratedComment,
  GeneratedFolder,
  GeneratedNode,
  TemplateNode,
  VariableTable,
} from '../types'
import { extractHandlebarsTokens } from './templateTokens'

interface VariableRow {
  tableName: string
  values: Record<string, string>
}

type BoundRows = Record<string, VariableRow>

const compileTemplate = (template: string, context: Record<string, unknown>): string => {
  const compiler = Handlebars.compile(template, { noEscape: true })
  return compiler(context)
}

const getRowCount = (table: VariableTable): number => {
  const maxLength = table.columns.reduce((max, column) => Math.max(max, column.values.length), 0)
  return Math.max(1, maxLength)
}

const getRows = (table: VariableTable): VariableRow[] => {
  const rowCount = getRowCount(table)

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const values: Record<string, string> = {}
    for (const column of table.columns) {
      values[column.name] = column.values[rowIndex] ?? ''
    }

    return {
      tableName: table.name,
      values,
    }
  })
}

const getContextFromBindings = (bindings: BoundRows): Record<string, unknown> => {
  const context: Record<string, unknown> = {}

  for (const [tableName, row] of Object.entries(bindings)) {
    const columnNames = Object.keys(row.values)
    if (columnNames.length === 1) {
      const onlyColumnName = columnNames[0]
      context[tableName] = row.values[onlyColumnName] ?? ''
    }

    context[tableName] = {
      ...(typeof context[tableName] === 'object' ? (context[tableName] as Record<string, unknown>) : {}),
      ...row.values,
    }
  }

  return context
}

const extractDependentTables = (templates: string[]): string[] => {
  const roots = new Set<string>()
  for (const template of templates) {
    for (const tokenInfo of extractHandlebarsTokens(template)) {
      const [root] = tokenInfo.token.split('.')
      if (root) {
        roots.add(root)
      }
    }
  }

  return Array.from(roots)
}

const expandBindings = (
  variableNames: string[],
  tablesByName: Map<string, VariableTable>,
  currentBindings: BoundRows,
): BoundRows[] => {
  const unboundVariables = variableNames.filter((variableName) => !currentBindings[variableName])

  if (unboundVariables.length === 0) {
    return [currentBindings]
  }

  const [variableName, ...rest] = unboundVariables
  const table = tablesByName.get(variableName)
  if (!table) {
    return [currentBindings]
  }

  const rows = getRows(table)
  const expanded: BoundRows[] = []

  for (const row of rows) {
    const next = {
      ...currentBindings,
      [variableName]: row,
    }

    if (rest.length === 0) {
      expanded.push(next)
      continue
    }

    expanded.push(...expandBindings(rest, tablesByName, next))
  }

  return expanded
}

const renderBookmark = (
  node: BookmarkNode,
  tablesByName: Map<string, VariableTable>,
  bindings: BoundRows,
): GeneratedBookmark[] => {
  const bookmarkTemplates = [
    node.titleTemplate,
    node.urlTemplate,
    node.descriptionTemplate,
    ...node.tagsTemplate,
    ...node.keywordsTemplate,
  ]

  const dependencies = extractDependentTables(bookmarkTemplates)
  const expandedBindings = expandBindings(dependencies, tablesByName, bindings)

  return expandedBindings.map((bound, index) => {
    const context = getContextFromBindings(bound)
    return {
      id: `${node.id}-bookmark-${index}`,
      type: 'bookmark',
      title: compileTemplate(node.titleTemplate, context),
      url: compileTemplate(node.urlTemplate, context),
      description: compileTemplate(node.descriptionTemplate, context),
      tags: node.tagsTemplate.map((tag) => compileTemplate(tag, context)),
      keywords: node.keywordsTemplate.map((keyword) => compileTemplate(keyword, context)),
    }
  })
}

const renderComment = (node: CommentNode): GeneratedComment => ({
  id: `${node.id}-comment`,
  type: 'comment',
  text: node.text,
})

const renderFolder = (
  node: FolderNode,
  tablesByName: Map<string, VariableTable>,
  bindings: BoundRows,
): GeneratedFolder[] => {
  const dependencies = extractDependentTables([node.nameTemplate])
  const expandedBindings = expandBindings(dependencies, tablesByName, bindings)

  return expandedBindings.map((bound, index) => {
    const context = getContextFromBindings(bound)
    const renderedChildren: GeneratedNode[] = []

    for (const child of node.children) {
      renderedChildren.push(...renderNode(child, tablesByName, bound))
    }

    return {
      id: `${node.id}-folder-${index}`,
      type: 'folder',
      name: compileTemplate(node.nameTemplate, context),
      children: renderedChildren,
    }
  })
}

const renderNode = (
  node: TemplateNode,
  tablesByName: Map<string, VariableTable>,
  bindings: BoundRows,
): GeneratedNode[] => {
  if (node.type === 'folder') {
    return renderFolder(node, tablesByName, bindings)
  }

  if (node.type === 'bookmark') {
    return renderBookmark(node, tablesByName, bindings)
  }

  return [renderComment(node)]
}

export const generatePreviewTree = (templateNodes: TemplateNode[], tables: VariableTable[]): GeneratedNode[] => {
  const tablesByName = new Map(tables.map((table) => [table.name, table]))
  const generated: GeneratedNode[] = []

  for (const node of templateNodes) {
    generated.push(...renderNode(node, tablesByName, {}))
  }

  return generated
}

export const collectGeneratedUrls = (nodes: GeneratedNode[]): string[] => {
  const urls: string[] = []

  const visit = (treeNodes: GeneratedNode[]): void => {
    for (const node of treeNodes) {
      if (node.type === 'bookmark') {
        urls.push(node.url)
      }

      if (node.type === 'folder') {
        visit(node.children)
      }
    }
  }

  visit(nodes)
  return urls
}
