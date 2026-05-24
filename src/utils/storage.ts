import type { TemplateNode, Variable } from '../types'
import { uid } from './color'

// ---------- Library (named saved templates, organised in folders) ----------

export interface LibraryFolderNode {
  id: string
  kind: 'folder'
  name: string
  children: LibraryNode[]
}

export interface LibraryTemplateNode {
  id: string
  kind: 'template'
  name: string
  description: string
  template: TemplateNode[]
  savedAt: number
}

export type LibraryNode = LibraryFolderNode | LibraryTemplateNode

const LIBRARY_KEY_V2 = 'bw.library.v2'
const LIBRARY_KEY_V1 = 'bw.library.templates.v1'

function isLibraryNode(value: unknown): value is LibraryNode {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== 'string' || typeof obj.name !== 'string') return false
  if (obj.kind === 'folder') return Array.isArray(obj.children) && obj.children.every(isLibraryNode)
  if (obj.kind === 'template') {
    return (
      typeof (obj.description ?? '') === 'string' &&
      Array.isArray(obj.template) &&
      typeof (obj.savedAt ?? 0) === 'number'
    )
  }
  return false
}

function migrateFromV1(): LibraryNode[] | null {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY_V1)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const out: LibraryNode[] = []
    for (const entry of parsed) {
      if (
        entry &&
        typeof entry === 'object' &&
        typeof (entry as { name?: unknown }).name === 'string' &&
        Array.isArray((entry as { template?: unknown }).template)
      ) {
        const e = entry as { name: string; template: TemplateNode[]; savedAt?: number }
        out.push({
          id: uid('lib'),
          kind: 'template',
          name: e.name,
          description: '',
          template: e.template,
          savedAt: e.savedAt ?? Date.now(),
        })
      }
    }
    return out
  } catch {
    return null
  }
}

export function loadLibrary(): LibraryNode[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY_V2)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && parsed.every(isLibraryNode)) {
        return parsed as LibraryNode[]
      }
    }
  } catch {
    /* fall through */
  }
  const migrated = migrateFromV1()
  if (migrated) {
    saveLibrary(migrated)
    return migrated
  }
  return []
}

export function saveLibrary(roots: LibraryNode[]): void {
  try {
    localStorage.setItem(LIBRARY_KEY_V2, JSON.stringify(roots))
  } catch {
    /* quota / private mode — ignore */
  }
}

// ---- Pure tree helpers ----

function findById(
  nodes: LibraryNode[],
  id: string,
): { node: LibraryNode; parent: LibraryNode[] } | null {
  for (const node of nodes) {
    if (node.id === id) return { node, parent: nodes }
    if (node.kind === 'folder') {
      const found = findById(node.children, id)
      if (found) return found
    }
  }
  return null
}

function mapNodes(
  nodes: LibraryNode[],
  fn: (n: LibraryNode) => LibraryNode,
): LibraryNode[] {
  return nodes.map((n) => {
    const mapped = fn(n)
    if (mapped.kind === 'folder') {
      return { ...mapped, children: mapNodes(mapped.children, fn) }
    }
    return mapped
  })
}

function removeById(
  nodes: LibraryNode[],
  id: string,
): { nodes: LibraryNode[]; removed: LibraryNode | null } {
  let removed: LibraryNode | null = null
  const out: LibraryNode[] = []
  for (const node of nodes) {
    if (node.id === id) {
      removed = node
      continue
    }
    if (node.kind === 'folder') {
      const child = removeById(node.children, id)
      if (child.removed) removed = child.removed
      out.push({ ...node, children: child.nodes })
    } else {
      out.push(node)
    }
  }
  return { nodes: out, removed }
}

function insertInto(
  nodes: LibraryNode[],
  parentId: string | null,
  index: number,
  inserted: LibraryNode,
): LibraryNode[] {
  if (parentId === null) {
    const safe = Math.max(0, Math.min(index, nodes.length))
    return [...nodes.slice(0, safe), inserted, ...nodes.slice(safe)]
  }
  return nodes.map((node) => {
    if (node.kind !== 'folder') return node
    if (node.id === parentId) {
      const safe = Math.max(0, Math.min(index, node.children.length))
      const children = [
        ...node.children.slice(0, safe),
        inserted,
        ...node.children.slice(safe),
      ]
      return { ...node, children }
    }
    return { ...node, children: insertInto(node.children, parentId, index, inserted) }
  })
}

function isAncestor(nodes: LibraryNode[], ancestorId: string, descendantId: string): boolean {
  const ancestor = findById(nodes, ancestorId)
  if (!ancestor || ancestor.node.kind !== 'folder') return false
  const walk = (list: LibraryNode[]): boolean => {
    for (const n of list) {
      if (n.id === descendantId) return true
      if (n.kind === 'folder' && walk(n.children)) return true
    }
    return false
  }
  return walk(ancestor.node.children)
}

// ---- Public mutations (pure: take and return a roots array) ----

export function libraryAddTemplate(
  roots: LibraryNode[],
  parentId: string | null,
  payload: { name: string; description: string; template: TemplateNode[] },
): { roots: LibraryNode[]; id: string } {
  const node: LibraryTemplateNode = {
    id: uid('lib'),
    kind: 'template',
    name: payload.name.trim() || 'Untitled',
    description: payload.description ?? '',
    template: payload.template,
    savedAt: Date.now(),
  }
  // If a template with the same name already exists at this level, replace it
  // so re-saving feels intuitive.
  const siblings = parentId
    ? (findById(roots, parentId)?.node as LibraryFolderNode | undefined)?.children ?? []
    : roots
  const conflict = siblings.find(
    (n) => n.kind === 'template' && n.name.trim() === node.name,
  )
  let working = roots
  if (conflict) {
    const removed = removeById(working, conflict.id)
    working = removed.nodes
  }
  return { roots: insertInto(working, parentId, Number.MAX_SAFE_INTEGER, node), id: node.id }
}

export function libraryCreateFolder(
  roots: LibraryNode[],
  parentId: string | null,
  name: string,
): LibraryNode[] {
  const folder: LibraryFolderNode = {
    id: uid('libf'),
    kind: 'folder',
    name: name.trim() || 'Folder',
    children: [],
  }
  return insertInto(roots, parentId, Number.MAX_SAFE_INTEGER, folder)
}

export function libraryRename(
  roots: LibraryNode[],
  id: string,
  patch: { name?: string; description?: string },
): LibraryNode[] {
  return mapNodes(roots, (n) => {
    if (n.id !== id) return n
    if (n.kind === 'template') {
      return {
        ...n,
        name: (patch.name ?? n.name).trim() || n.name,
        description: patch.description ?? n.description,
      }
    }
    return { ...n, name: (patch.name ?? n.name).trim() || n.name }
  })
}

export function libraryDelete(roots: LibraryNode[], id: string): LibraryNode[] {
  return removeById(roots, id).nodes
}

export function libraryMove(
  roots: LibraryNode[],
  id: string,
  destParentId: string | null,
  index: number,
): LibraryNode[] {
  if (destParentId && (destParentId === id || isAncestor(roots, id, destParentId))) {
    return roots
  }
  const { nodes: withoutNode, removed } = removeById(roots, id)
  if (!removed) return roots
  return insertInto(withoutNode, destParentId, index, removed)
}

export function libraryMoveWithinSiblings(
  roots: LibraryNode[],
  id: string,
  delta: -1 | 1,
): LibraryNode[] {
  const located = findById(roots, id)
  if (!located) return roots
  const siblings = located.parent
  const idx = siblings.indexOf(located.node)
  const next = idx + delta
  if (next < 0 || next >= siblings.length) return roots
  // Determine parent id (null if root).
  const parentId = (() => {
    // The `parent` array reference itself doesn't carry an id; locate it.
    const walk = (list: LibraryNode[], pid: string | null): string | null => {
      if (list === roots) return null
      for (const n of list) {
        if (n.kind === 'folder') {
          if (n.children === siblings) return n.id
          const r = walk(n.children, n.id)
          if (r !== null) return r
        }
      }
      return pid
    }
    return walk(roots, null)
  })()
  const { nodes: withoutNode, removed } = removeById(roots, id)
  if (!removed) return roots
  return insertInto(withoutNode, parentId, next, removed)
}

export function libraryFolderOptions(roots: LibraryNode[]): { id: string | null; name: string; depth: number }[] {
  const out: { id: string | null; name: string; depth: number }[] = [
    { id: null, name: '/', depth: 0 },
  ]
  const walk = (list: LibraryNode[], depth: number) => {
    for (const n of list) {
      if (n.kind === 'folder') {
        out.push({ id: n.id, name: n.name, depth })
        walk(n.children, depth + 1)
      }
    }
  }
  walk(roots, 1)
  return out
}

// ---------- Export / Import serialization ----------

const TEMPLATE_FORMAT = 'bookmarks-weaver.template/v1'
const VARIABLES_FORMAT = 'bookmarks-weaver.variables/v1'

export interface TemplateExport {
  format: typeof TEMPLATE_FORMAT
  exportedAt: string
  name?: string
  description?: string
  template: TemplateNode[]
}

export interface VariablesExport {
  format: typeof VARIABLES_FORMAT
  exportedAt: string
  variables: Variable[]
}

export function serializeTemplate(
  template: TemplateNode[],
  meta?: { name?: string; description?: string },
): string {
  const payload: TemplateExport = {
    format: TEMPLATE_FORMAT,
    exportedAt: new Date().toISOString(),
    name: meta?.name,
    description: meta?.description,
    template,
  }
  return JSON.stringify(payload, null, 2)
}

export function serializeVariables(variables: Variable[]): string {
  const payload: VariablesExport = {
    format: VARIABLES_FORMAT,
    exportedAt: new Date().toISOString(),
    variables,
  }
  return JSON.stringify(payload, null, 2)
}

function isTemplateNode(value: unknown): value is TemplateNode {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  if (typeof obj.id !== 'string' || typeof obj.kind !== 'string') return false
  if (obj.kind === 'folder') {
    return typeof obj.name === 'string' && Array.isArray(obj.children)
  }
  if (obj.kind === 'bookmark') {
    return (
      typeof obj.title === 'string' &&
      typeof obj.url === 'string' &&
      typeof obj.description === 'string' &&
      Array.isArray(obj.tags) &&
      Array.isArray(obj.keywords)
    )
  }
  if (obj.kind === 'comment') {
    return typeof obj.text === 'string'
  }
  return false
}

function isVariable(value: unknown): value is Variable {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.color === 'string' &&
    Array.isArray(obj.columns) &&
    Array.isArray(obj.rows)
  )
}

export interface ParsedTemplateImport {
  template: TemplateNode[]
  name?: string
  description?: string
}

export function parseTemplateImport(text: string): ParsedTemplateImport {
  const parsed = JSON.parse(text) as unknown
  let template: unknown
  let name: string | undefined
  let description: string | undefined
  if (Array.isArray(parsed)) {
    template = parsed
  } else if (parsed && typeof parsed === 'object') {
    template = (parsed as TemplateExport).template
    name = (parsed as TemplateExport).name
    description = (parsed as TemplateExport).description
  }
  if (!Array.isArray(template) || !template.every(isTemplateNode)) {
    throw new Error('Not a valid Bookmarks Weaver template.')
  }
  return { template: template as TemplateNode[], name, description }
}

export function parseVariablesImport(text: string): Variable[] {
  const parsed = JSON.parse(text) as unknown
  const candidate = Array.isArray(parsed)
    ? parsed
    : (parsed as VariablesExport | null)?.variables
  if (!Array.isArray(candidate) || !candidate.every(isVariable)) {
    throw new Error('Not a valid Bookmarks Weaver variables file.')
  }
  return candidate as Variable[]
}
