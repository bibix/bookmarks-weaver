import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import type {
  AppState,
  TemplateBookmark,
  TemplateComment,
  TemplateFolder,
  TemplateNode,
  Variable,
  VariableColumn,
} from '../types'
import { useHistory } from '../hooks/useHistory'
import { colorFor, uid } from '../utils/color'
import { collectRefs, toIdentifier } from '../utils/handlebars'

const DEFAULT_FILENAME = 'bookmarks-{{yyyy}}-{{mm}}-{{dd}}.html'

const INITIAL_STATE: AppState = {
  outputFileName: DEFAULT_FILENAME,
  template: [
    {
      id: uid('fld'),
      kind: 'folder',
      name: 'My bookmarks',
      children: [
        {
          id: uid('bkm'),
          kind: 'bookmark',
          title: 'Example',
          url: 'https://example.com/',
          description: '',
          tags: [],
          keywords: [],
        },
      ],
    },
  ],
  variables: [],
}

const STORAGE_KEY = 'bw.state.v2'

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      outputFileName: parsed.outputFileName ?? INITIAL_STATE.outputFileName,
      template: parsed.template ?? INITIAL_STATE.template,
      variables: parsed.variables ?? INITIAL_STATE.variables,
    }
  } catch {
    return INITIAL_STATE
  }
}

interface AppStateContextValue {
  state: AppState
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  resetAll: () => void

  setOutputFileName: (next: string) => void

  insertNode: (parentId: string | null, index: number, node: TemplateNode) => void
  removeNode: (nodeId: string) => void
  moveNode: (nodeId: string, parentId: string | null, index: number) => void

  updateFolder: (
    nodeId: string,
    patch: Partial<Omit<TemplateFolder, 'id' | 'kind' | 'children'>>,
  ) => void
  updateBookmark: (
    nodeId: string,
    patch: Partial<Omit<TemplateBookmark, 'id' | 'kind'>>,
  ) => void
  updateComment: (nodeId: string, text: string) => void

  renameVariable: (variableId: string, name: string) => void
  renameColumn: (variableId: string, columnId: string, name: string) => void
  addColumn: (variableId: string) => void
  removeColumn: (variableId: string, columnId: string) => void
  addRow: (variableId: string) => void
  removeRow: (variableId: string, rowIndex: number) => void
  setCell: (
    variableId: string,
    rowIndex: number,
    columnIndex: number,
    value: string,
  ) => void
  removeVariable: (variableId: string) => void

  setTemplate: (template: TemplateNode[]) => void
  setVariables: (variables: Variable[]) => void
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

function uniqueName(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let i = 2
  while (existing.includes(`${base}${i}`)) i++
  return `${base}${i}`
}

function mapNodes(
  nodes: TemplateNode[],
  fn: (n: TemplateNode) => TemplateNode,
): TemplateNode[] {
  return nodes.map((n) => {
    const mapped = fn(n)
    if (mapped.kind === 'folder') {
      return { ...mapped, children: mapNodes(mapped.children, fn) }
    }
    return mapped
  })
}

function findAndRemove(
  nodes: TemplateNode[],
  id: string,
): { nodes: TemplateNode[]; removed: TemplateNode | null } {
  let removed: TemplateNode | null = null
  const out: TemplateNode[] = []
  for (const node of nodes) {
    if (node.id === id) {
      removed = node
      continue
    }
    if (node.kind === 'folder') {
      const child = findAndRemove(node.children, id)
      if (child.removed) removed = child.removed
      out.push({ ...node, children: child.nodes })
    } else {
      out.push(node)
    }
  }
  return { nodes: out, removed }
}

function insertAt(
  nodes: TemplateNode[],
  parentId: string | null,
  index: number,
  inserted: TemplateNode,
): TemplateNode[] {
  if (parentId === null) {
    const safeIndex = Math.max(0, Math.min(index, nodes.length))
    return [...nodes.slice(0, safeIndex), inserted, ...nodes.slice(safeIndex)]
  }
  return nodes.map((node) => {
    if (node.kind !== 'folder') return node
    if (node.id === parentId) {
      const safeIndex = Math.max(0, Math.min(index, node.children.length))
      const children = [
        ...node.children.slice(0, safeIndex),
        inserted,
        ...node.children.slice(safeIndex),
      ]
      return { ...node, children }
    }
    return { ...node, children: insertAt(node.children, parentId, index, inserted) }
  })
}

function collectTemplateStrings(nodes: TemplateNode[]): string[] {
  const out: string[] = []
  for (const node of nodes) {
    if (node.kind === 'folder') {
      out.push(node.name)
      out.push(...collectTemplateStrings(node.children))
    } else if (node.kind === 'bookmark') {
      out.push(node.title, node.url, node.description, ...node.tags, ...node.keywords)
    }
  }
  return out
}

/**
 * Sync `state.variables` with the references found in the template tree.
 * - `{{name}}` creates a variable `name` if missing.
 * - `{{name.col}}` adds the column `col` to variable `name`.
 * Existing variables and their rows are preserved.
 */
function syncVariablesWithTemplate(state: AppState): AppState {
  const refs = collectTemplateStrings(state.template).flatMap((s) => collectRefs(s))
  if (refs.length === 0) return state
  const byName = new Map<string, Variable>(state.variables.map((v) => [v.name, v]))
  let changed = false
  for (const ref of refs) {
    let variable = byName.get(ref.variable)
    if (!variable) {
      const name = ref.variable
      variable = {
        id: uid('var'),
        name,
        color: colorFor(name),
        columns: [{ id: uid('col'), name: ref.column ?? name }],
        rows: [['']],
      }
      byName.set(name, variable)
      changed = true
    } else if (ref.column && !variable.columns.some((c) => c.name === ref.column)) {
      const newCol: VariableColumn = { id: uid('col'), name: ref.column }
      const updated: Variable = {
        ...variable,
        columns: [...variable.columns, newCol],
        rows: variable.rows.map((row) => [...row, '']),
      }
      byName.set(variable.name, updated)
      changed = true
    }
  }
  if (!changed) return state
  const seen = new Set<string>()
  const ordered: Variable[] = []
  for (const v of state.variables) {
    const updated = byName.get(v.name)
    if (updated) {
      ordered.push(updated)
      seen.add(v.name)
    }
  }
  for (const name of byName.keys()) {
    if (!seen.has(name)) ordered.push(byName.get(name)!)
  }
  return { ...state, variables: ordered }
}

function rewriteRefs(
  templates: string,
  oldName: string,
  newName: string,
  oldColumn?: string,
  newColumn?: string,
): string {
  return templates.replace(/\{\{([^{}]*)\}\}/g, (match, inner) => {
    const trimmed = String(inner).trim()
    const parts = trimmed.split('.').map((p) => p.trim())
    if (parts.length === 1 && parts[0] === oldName) return `{{${newName}}}`
    if (parts.length === 2 && parts[0] === oldName) {
      const colNext =
        oldColumn && parts[1] === oldColumn && newColumn ? newColumn : parts[1]
      return `{{${newName}.${colNext}}}`
    }
    return match
  })
}

function rewriteTemplate(
  nodes: TemplateNode[],
  rewrite: (s: string) => string,
): TemplateNode[] {
  return mapNodes(nodes, (node) => {
    if (node.kind === 'folder') return { ...node, name: rewrite(node.name) }
    if (node.kind === 'bookmark') {
      return {
        ...node,
        title: rewrite(node.title),
        url: rewrite(node.url),
        description: rewrite(node.description),
        tags: node.tags.map(rewrite),
        keywords: node.keywords.map(rewrite),
      }
    }
    return node
  })
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { state, update, replace, undo, redo, reset, canUndo, canRedo } = useHistory<AppState>(loadInitial())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey
      if (!meta) return
      const target = event.target as HTMLElement | null
      // Don't hijack undo/redo when typing inside an input/textarea — the
      // native editor undo is more granular and expected by users.
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return
      }
      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Variable auto-sync is debounced so that partial typing — e.g., the
  // intermediate states `{{c}}`, `{{cl}}`, `{{clu}}` while the user is on
  // the way to `{{cluster}}` — does not register a fresh variable for
  // every keystroke. After ~800ms of idle the latest references are
  // reconciled into the variables list.
  const syncTimer = useRef<number | null>(null)
  const scheduleVariableSync = useCallback(() => {
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(() => {
      syncTimer.current = null
      replace((prev) => syncVariablesWithTemplate(prev))
    }, 800)
  }, [replace])

  useEffect(
    () => () => {
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current)
    },
    [],
  )

  const applyTemplateChange = useCallback(
    (producer: (prev: AppState) => AppState, opts?: { coalesce?: boolean }) => {
      update(producer, opts)
      scheduleVariableSync()
    },
    [update, scheduleVariableSync],
  )

  const setOutputFileName = useCallback(
    (next: string) =>
      update((prev) => ({ ...prev, outputFileName: next }), { coalesce: true }),
    [update],
  )

  const insertNode = useCallback(
    (parentId: string | null, index: number, node: TemplateNode) => {
      applyTemplateChange((prev) => ({
        ...prev,
        template: insertAt(prev.template, parentId, index, node),
      }))
    },
    [applyTemplateChange],
  )

  const removeNode = useCallback(
    (nodeId: string) => {
      applyTemplateChange((prev) => {
        const result = findAndRemove(prev.template, nodeId)
        return { ...prev, template: result.nodes }
      })
    },
    [applyTemplateChange],
  )

  const moveNode = useCallback(
    (nodeId: string, parentId: string | null, index: number) => {
      applyTemplateChange((prev) => {
        const result = findAndRemove(prev.template, nodeId)
        if (!result.removed) return prev
        return {
          ...prev,
          template: insertAt(result.nodes, parentId, index, result.removed),
        }
      })
    },
    [applyTemplateChange],
  )

  const updateFolder = useCallback(
    (
      nodeId: string,
      patch: Partial<Omit<TemplateFolder, 'id' | 'kind' | 'children'>>,
    ) => {
      applyTemplateChange(
        (prev) => ({
          ...prev,
          template: mapNodes(prev.template, (n) =>
            n.id === nodeId && n.kind === 'folder' ? { ...n, ...patch } : n,
          ),
        }),
        { coalesce: true },
      )
    },
    [applyTemplateChange],
  )

  const updateBookmark = useCallback(
    (
      nodeId: string,
      patch: Partial<Omit<TemplateBookmark, 'id' | 'kind'>>,
    ) => {
      applyTemplateChange(
        (prev) => ({
          ...prev,
          template: mapNodes(prev.template, (n) =>
            n.id === nodeId && n.kind === 'bookmark' ? { ...n, ...patch } : n,
          ),
        }),
        { coalesce: true },
      )
    },
    [applyTemplateChange],
  )

  const updateComment = useCallback(
    (nodeId: string, text: string) => {
      applyTemplateChange(
        (prev) => ({
          ...prev,
          template: mapNodes(prev.template, (n) =>
            n.id === nodeId && n.kind === 'comment' ? { ...n, text } : n,
          ),
        }),
        { coalesce: true },
      )
    },
    [applyTemplateChange],
  )

  const renameVariable = useCallback(
    (variableId: string, rawName: string) => {
      update((prev) => {
        const variable = prev.variables.find((v) => v.id === variableId)
        if (!variable) return prev
        const base = toIdentifier(rawName)
        const others = prev.variables.filter((v) => v.id !== variableId).map((v) => v.name)
        const finalName = base === variable.name ? variable.name : uniqueName(base, others)
        if (finalName === variable.name) return prev
        const variables = prev.variables.map((v) =>
          v.id === variableId ? { ...v, name: finalName, color: colorFor(finalName) } : v,
        )
        const template = rewriteTemplate(prev.template, (s) =>
          rewriteRefs(s, variable.name, finalName),
        )
        return { ...prev, variables, template }
      })
    },
    [update],
  )

  const renameColumn = useCallback(
    (variableId: string, columnId: string, rawName: string) => {
      update((prev) => {
        const variable = prev.variables.find((v) => v.id === variableId)
        if (!variable) return prev
        const column = variable.columns.find((c) => c.id === columnId)
        if (!column) return prev
        const base = toIdentifier(rawName)
        const otherCols = variable.columns.filter((c) => c.id !== columnId).map((c) => c.name)
        const finalName = base === column.name ? column.name : uniqueName(base, otherCols)
        if (finalName === column.name) return prev
        const variables = prev.variables.map((v) =>
          v.id !== variableId
            ? v
            : {
                ...v,
                columns: v.columns.map((c) =>
                  c.id === columnId ? { ...c, name: finalName } : c,
                ),
              },
        )
        const template = rewriteTemplate(prev.template, (s) =>
          rewriteRefs(s, variable.name, variable.name, column.name, finalName),
        )
        return { ...prev, variables, template }
      })
    },
    [update],
  )

  const addColumn = useCallback(
    (variableId: string) => {
      update((prev) => ({
        ...prev,
        variables: prev.variables.map((v) => {
          if (v.id !== variableId) return v
          const existing = v.columns.map((c) => c.name)
          const name = uniqueName('column', existing)
          return {
            ...v,
            columns: [...v.columns, { id: uid('col'), name }],
            rows: v.rows.map((row) => [...row, '']),
          }
        }),
      }))
    },
    [update],
  )

  const removeColumn = useCallback(
    (variableId: string, columnId: string) => {
      update((prev) => ({
        ...prev,
        variables: prev.variables.map((v) => {
          if (v.id !== variableId) return v
          const idx = v.columns.findIndex((c) => c.id === columnId)
          if (idx < 0 || v.columns.length === 1) return v
          return {
            ...v,
            columns: v.columns.filter((c) => c.id !== columnId),
            rows: v.rows.map((row) => row.filter((_, i) => i !== idx)),
          }
        }),
      }))
    },
    [update],
  )

  const addRow = useCallback(
    (variableId: string) => {
      update((prev) => ({
        ...prev,
        variables: prev.variables.map((v) =>
          v.id !== variableId ? v : { ...v, rows: [...v.rows, v.columns.map(() => '')] },
        ),
      }))
    },
    [update],
  )

  const removeRow = useCallback(
    (variableId: string, rowIndex: number) => {
      update((prev) => ({
        ...prev,
        variables: prev.variables.map((v) => {
          if (v.id !== variableId) return v
          if (v.rows.length <= 1) return { ...v, rows: [v.columns.map(() => '')] }
          return { ...v, rows: v.rows.filter((_, i) => i !== rowIndex) }
        }),
      }))
    },
    [update],
  )

  const setCell = useCallback(
    (variableId: string, rowIndex: number, columnIndex: number, value: string) => {
      update(
        (prev) => ({
          ...prev,
          variables: prev.variables.map((v) =>
            v.id !== variableId
              ? v
              : {
                  ...v,
                  rows: v.rows.map((row, ri) =>
                    ri !== rowIndex
                      ? row
                      : row.map((cell, ci) => (ci === columnIndex ? value : cell)),
                  ),
                },
          ),
        }),
        { coalesce: true },
      )
    },
    [update],
  )

  const removeVariable = useCallback(
    (variableId: string) => {
      update((prev) => ({
        ...prev,
        variables: prev.variables.filter((v) => v.id !== variableId),
      }))
    },
    [update],
  )

  const setTemplate = useCallback(
    (template: TemplateNode[]) => {
      applyTemplateChange((prev) => ({ ...prev, template }))
    },
    [applyTemplateChange],
  )

  const setVariables = useCallback(
    (variables: Variable[]) => {
      update((prev) => ({ ...prev, variables }))
    },
    [update],
  )

  const resetAll = useCallback(() => reset(INITIAL_STATE), [reset])

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      canUndo,
      canRedo,
      undo,
      redo,
      resetAll,
      setOutputFileName,
      insertNode,
      removeNode,
      moveNode,
      updateFolder,
      updateBookmark,
      updateComment,
      renameVariable,
      renameColumn,
      addColumn,
      removeColumn,
      addRow,
      removeRow,
      setCell,
      removeVariable,
      setTemplate,
      setVariables,
    }),
    [
      state, canUndo, canRedo, undo, redo, resetAll,
      setOutputFileName, insertNode, removeNode, moveNode,
      updateFolder, updateBookmark, updateComment,
      renameVariable, renameColumn,
      addColumn, removeColumn, addRow, removeRow, setCell, removeVariable,
      setTemplate, setVariables,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export function createFolder(): TemplateFolder {
  return { id: uid('fld'), kind: 'folder', name: '', children: [] }
}

export function createBookmark(): TemplateBookmark {
  return {
    id: uid('bkm'),
    kind: 'bookmark',
    title: '',
    url: '',
    description: '',
    tags: [],
    keywords: [],
  }
}

export function createComment(): TemplateComment {
  return { id: uid('cmt'), kind: 'comment', text: '' }
}
