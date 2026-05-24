import type {
  AnyResolvedNode,
  ResolvedBookmark,
  ResolvedFolder,
  TemplateBookmark,
  TemplateFolder,
  TemplateNode,
  Variable,
  VarRef,
} from '../types'
import { collectRefs, renderTemplate } from './handlebars'

type Bindings = Record<string, string>

function bookmarkTemplates(b: TemplateBookmark): string[] {
  return [b.title, b.url, b.description, ...b.tags, ...b.keywords]
}

function collectRefsFromMany(templates: string[]): VarRef[] {
  const refs: VarRef[] = []
  for (const t of templates) {
    for (const ref of collectRefs(t)) refs.push(ref)
  }
  return refs
}

/**
 * Determine which variables a template-string set references that have not yet
 * been bound by an enclosing folder. The returned list is unique by variable
 * name and preserves first-seen order.
 */
function uncoveredVariables(
  refs: VarRef[],
  bindings: Bindings,
  variables: Variable[],
): Variable[] {
  const seen = new Set<string>()
  const result: Variable[] = []
  for (const ref of refs) {
    const variable = variables.find((v) => v.name === ref.variable)
    if (!variable) continue
    if (seen.has(variable.name)) continue
    if (Object.prototype.hasOwnProperty.call(bindings, variable.name)) continue
    seen.add(variable.name)
    result.push(variable)
  }
  return result
}

/** Yield each row of a variable as a bindings overlay (name + name.col). */
function bindingsForRow(variable: Variable, row: string[]): Bindings {
  const out: Bindings = {}
  out[variable.name] = row[0] ?? ''
  for (let i = 0; i < variable.columns.length; i++) {
    const col = variable.columns[i]
    out[`${variable.name}.${col.name}`] = row[i] ?? ''
  }
  return out
}

/**
 * Cross-product over an ordered list of variables. Empty variables (no rows)
 * yield a single iteration with empty bindings to keep generation resilient.
 */
function* crossProduct(
  variables: Variable[],
  base: Bindings,
): Generator<Bindings> {
  if (variables.length === 0) {
    yield base
    return
  }
  const [first, ...rest] = variables
  const rows = first.rows.length > 0 ? first.rows : [[]]
  for (const row of rows) {
    const merged: Bindings = { ...base, ...bindingsForRow(first, row) }
    yield* crossProduct(rest, merged)
  }
}

function resolveBookmark(
  b: TemplateBookmark,
  bindings: Bindings,
): ResolvedBookmark {
  return {
    title: renderTemplate(b.title, bindings),
    url: renderTemplate(b.url, bindings),
    description: renderTemplate(b.description, bindings),
    tags: b.tags.map((t) => renderTemplate(t, bindings)).filter((s) => s.length > 0),
    keywords: b.keywords.map((k) => renderTemplate(k, bindings)).filter((s) => s.length > 0),
  }
}

function generateFromBookmark(
  node: TemplateBookmark,
  variables: Variable[],
  bindings: Bindings,
): AnyResolvedNode[] {
  const refs = collectRefsFromMany(bookmarkTemplates(node))
  const loops = uncoveredVariables(refs, bindings, variables)
  const out: AnyResolvedNode[] = []
  let counter = 0
  for (const ctx of crossProduct(loops, bindings)) {
    out.push({
      kind: 'bookmark',
      id: `${node.id}#${counter++}`,
      bookmark: resolveBookmark(node, ctx),
    })
  }
  return out
}

function generateFromFolder(
  node: TemplateFolder,
  variables: Variable[],
  bindings: Bindings,
): AnyResolvedNode[] {
  const refs = collectRefs(node.name)
  const loops = uncoveredVariables(refs, bindings, variables)
  const out: AnyResolvedNode[] = []
  let counter = 0
  for (const ctx of crossProduct(loops, bindings)) {
    const folder: ResolvedFolder = {
      kind: 'folder',
      id: `${node.id}#${counter++}`,
      name: renderTemplate(node.name, ctx).trim() || node.name || 'Folder',
      children: generateNodes(node.children, variables, ctx),
    }
    out.push(folder)
  }
  return out
}

function generateNodes(
  nodes: TemplateNode[],
  variables: Variable[],
  bindings: Bindings,
): AnyResolvedNode[] {
  const out: AnyResolvedNode[] = []
  for (const node of nodes) {
    if (node.kind === 'comment') {
      out.push({ kind: 'comment', id: node.id, text: node.text })
    } else if (node.kind === 'folder') {
      for (const f of generateFromFolder(node, variables, bindings)) out.push(f)
    } else {
      for (const b of generateFromBookmark(node, variables, bindings)) out.push(b)
    }
  }
  return out
}

export interface GenerationResult {
  tree: AnyResolvedNode[]
  bookmarkCount: number
}

export function generate(
  template: TemplateNode[],
  variables: Variable[],
): GenerationResult {
  const tree = generateNodes(template, variables, {})
  return { tree, bookmarkCount: countBookmarks(tree) }
}

export function countBookmarks(tree: AnyResolvedNode[]): number {
  let n = 0
  for (const node of tree) {
    if (node.kind === 'bookmark') n++
    else if (node.kind === 'folder') n += countBookmarks(node.children)
  }
  return n
}
