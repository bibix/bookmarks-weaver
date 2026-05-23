import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import type {
  AppState,
  ListVariable,
  TableColumn,
  TableVariable,
  Variable,
} from '../types'
import { useHistory } from '../hooks/useHistory'
import { colorFor, uid } from '../utils/color'
import { findPlaceholders, toIdentifier } from '../utils/urlParser'

const INITIAL_STATE: AppState = {
  urlTemplate: '',
  nameTemplate: '',
  folderTemplate: '',
  keywordsTemplate: '',
  variables: [],
  beginner: true,
}

const STORAGE_KEY = 'bw.state.v1'

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as AppState
    return { ...INITIAL_STATE, ...parsed }
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

  setUrlTemplate: (next: string) => void
  setNameTemplate: (next: string) => void
  setFolderTemplate: (next: string) => void
  setKeywordsTemplate: (next: string) => void
  setBeginner: (next: boolean) => void

  /** Create a variable from a substring selection in the URL input. */
  createVariableFromSelection: (params: {
    selection: string
    start: number
    end: number
    suggestedName?: string
  }) => string | null

  addListVariable: (name?: string) => void
  addTableVariable: (name?: string) => void
  removeVariable: (id: string) => void
  renameVariable: (id: string, name: string) => void
  setListValues: (id: string, raw: string) => void

  addTableColumn: (id: string) => void
  removeTableColumn: (id: string, columnId: string) => void
  renameTableColumn: (id: string, columnId: string, name: string) => void
  setTableColumnValues: (id: string, columnId: string, raw: string) => void
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

function uniqueName(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let i = 2
  while (existing.includes(`${base}_${i}`)) i++
  return `${base}_${i}`
}

function splitLines(raw: string): string[] {
  return raw.split(/\r?\n/)
}

function joinLines(values: string[]): string {
  return values.join('\n')
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { state, update, undo, redo, reset, canUndo, canRedo } = useHistory<AppState>(loadInitial())

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey
      if (!meta) return
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

  const setUrlTemplate = useCallback(
    (next: string) => update((prev) => ({ ...prev, urlTemplate: next }), { coalesce: true }),
    [update],
  )
  const setNameTemplate = useCallback(
    (next: string) => update((prev) => ({ ...prev, nameTemplate: next }), { coalesce: true }),
    [update],
  )
  const setFolderTemplate = useCallback(
    (next: string) => update((prev) => ({ ...prev, folderTemplate: next }), { coalesce: true }),
    [update],
  )
  const setKeywordsTemplate = useCallback(
    (next: string) => update((prev) => ({ ...prev, keywordsTemplate: next }), { coalesce: true }),
    [update],
  )
  const setBeginner = useCallback(
    (next: boolean) => update((prev) => ({ ...prev, beginner: next })),
    [update],
  )

  const addListVariable = useCallback((name?: string) => {
    update((prev) => {
      const base = toIdentifier(name ?? 'list')
      const finalName = uniqueName(base, prev.variables.map((v) => v.name))
      const variable: ListVariable = {
        id: uid('list'),
        name: finalName,
        kind: 'list',
        color: colorFor(finalName),
        values: [''],
      }
      return { ...prev, variables: [...prev.variables, variable] }
    })
  }, [update])

  const addTableVariable = useCallback((name?: string) => {
    update((prev) => {
      const base = toIdentifier(name ?? 'table')
      const finalName = uniqueName(base, prev.variables.map((v) => v.name))
      const columnName = uniqueName('column', prev.variables.flatMap((v) =>
        v.kind === 'table' ? v.columns.map((c) => c.name) : []))
      const variable: TableVariable = {
        id: uid('tbl'),
        name: finalName,
        kind: 'table',
        columns: [
          { id: uid('col'), name: columnName, color: colorFor(columnName), values: [''] },
        ],
      }
      return { ...prev, variables: [...prev.variables, variable] }
    })
  }, [update])

  const removeVariable = useCallback((id: string) => {
    update((prev) => {
      const target = prev.variables.find((v) => v.id === id)
      if (!target) return prev
      const names = target.kind === 'list' ? [target.name] : target.columns.map((c) => c.name)
      const stripPlaceholders = (template: string) =>
        names.reduce((acc, n) => acc.split(`{${n}}`).join(n), template)
      return {
        ...prev,
        variables: prev.variables.filter((v) => v.id !== id),
        urlTemplate: stripPlaceholders(prev.urlTemplate),
        nameTemplate: stripPlaceholders(prev.nameTemplate),
        folderTemplate: stripPlaceholders(prev.folderTemplate),
        keywordsTemplate: stripPlaceholders(prev.keywordsTemplate),
      }
    })
  }, [update])

  const renameVariable = useCallback((id: string, rawName: string) => {
    update((prev) => {
      const target = prev.variables.find((v) => v.id === id)
      if (!target || target.kind !== 'list') return prev
      const base = toIdentifier(rawName || 'list')
      const finalName = base === target.name
        ? target.name
        : uniqueName(base, prev.variables.filter((v) => v.id !== id).map((v) => v.name))
      if (finalName === target.name) return prev
      const swap = (template: string) => template.split(`{${target.name}}`).join(`{${finalName}}`)
      return {
        ...prev,
        variables: prev.variables.map((v) =>
          v.id === id && v.kind === 'list'
            ? { ...v, name: finalName, color: colorFor(finalName) }
            : v,
        ),
        urlTemplate: swap(prev.urlTemplate),
        nameTemplate: swap(prev.nameTemplate),
        folderTemplate: swap(prev.folderTemplate),
        keywordsTemplate: swap(prev.keywordsTemplate),
      }
    })
  }, [update])

  const setListValues = useCallback((id: string, raw: string) => {
    const values = splitLines(raw)
    update(
      (prev) => ({
        ...prev,
        variables: prev.variables.map((v) =>
          v.id === id && v.kind === 'list' ? { ...v, values } : v,
        ),
      }),
      { coalesce: true },
    )
  }, [update])

  const addTableColumn = useCallback((id: string) => {
    update((prev) => ({
      ...prev,
      variables: prev.variables.map((v) => {
        if (v.id !== id || v.kind !== 'table') return v
        const existing = v.columns.map((c) => c.name)
        const allOther = prev.variables.flatMap((o) =>
          o.id === id ? [] : o.kind === 'table' ? o.columns.map((c) => c.name) : [o.name])
        const name = uniqueName('column', [...existing, ...allOther])
        const column: TableColumn = { id: uid('col'), name, color: colorFor(name), values: [''] }
        return { ...v, columns: [...v.columns, column] }
      }),
    }))
  }, [update])

  const removeTableColumn = useCallback((id: string, columnId: string) => {
    update((prev) => ({
      ...prev,
      variables: prev.variables.map((v) => {
        if (v.id !== id || v.kind !== 'table') return v
        return { ...v, columns: v.columns.filter((c) => c.id !== columnId) }
      }),
    }))
  }, [update])

  const renameTableColumn = useCallback((id: string, columnId: string, rawName: string) => {
    update((prev) => {
      const variable = prev.variables.find((v) => v.id === id)
      if (!variable || variable.kind !== 'table') return prev
      const column = variable.columns.find((c) => c.id === columnId)
      if (!column) return prev
      const base = toIdentifier(rawName || 'column')
      const otherNames = prev.variables.flatMap((v) =>
        v.kind === 'list'
          ? [v.name]
          : v.columns.filter((c) => c.id !== columnId).map((c) => c.name),
      )
      const finalName = base === column.name ? column.name : uniqueName(base, otherNames)
      if (finalName === column.name) return prev
      const swap = (template: string) => template.split(`{${column.name}}`).join(`{${finalName}}`)
      return {
        ...prev,
        variables: prev.variables.map((v) =>
          v.id !== id || v.kind !== 'table'
            ? v
            : {
                ...v,
                columns: v.columns.map((c) =>
                  c.id === columnId ? { ...c, name: finalName, color: colorFor(finalName) } : c,
                ),
              },
        ),
        urlTemplate: swap(prev.urlTemplate),
        nameTemplate: swap(prev.nameTemplate),
        folderTemplate: swap(prev.folderTemplate),
        keywordsTemplate: swap(prev.keywordsTemplate),
      }
    })
  }, [update])

  const setTableColumnValues = useCallback((id: string, columnId: string, raw: string) => {
    const values = splitLines(raw)
    update(
      (prev) => ({
        ...prev,
        variables: prev.variables.map((v) =>
          v.id === id && v.kind === 'table'
            ? {
                ...v,
                columns: v.columns.map((c) => (c.id === columnId ? { ...c, values } : c)),
              }
            : v,
        ),
      }),
      { coalesce: true },
    )
  }, [update])

  const createVariableFromSelection = useCallback(
    (params: { selection: string; start: number; end: number; suggestedName?: string }) => {
      const { selection, start, end, suggestedName } = params
      const trimmed = selection.trim()
      if (!trimmed) return null
      let assignedName: string | null = null
      update((prev) => {
        const base = toIdentifier(suggestedName || trimmed.slice(0, 24) || 'variable')
        const finalName = uniqueName(base, prev.variables.map((v) => v.name))
        assignedName = finalName
        const placeholder = `{${finalName}}`
        const nextUrl = prev.urlTemplate.slice(0, start) + placeholder + prev.urlTemplate.slice(end)
        const variable: ListVariable = {
          id: uid('list'),
          name: finalName,
          kind: 'list',
          color: colorFor(finalName),
          values: [selection, ''],
        }
        return {
          ...prev,
          urlTemplate: nextUrl,
          variables: [...prev.variables, variable],
        }
      })
      return assignedName
    },
    [update],
  )

  const resetAll = useCallback(() => reset(INITIAL_STATE), [reset])

  // Prune unused variables from templates is intentionally not automatic — we keep
  // names round-trippable via findPlaceholders so the UI can flag stray names.
  const allKnownNames = useMemo(
    () => new Set(
      state.variables.flatMap<string>((v: Variable) =>
        v.kind === 'list' ? [v.name] : v.columns.map((c) => c.name),
      ),
    ),
    [state.variables],
  )
  void findPlaceholders
  void allKnownNames

  const value = useMemo<AppStateContextValue>(() => ({
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    resetAll,
    setUrlTemplate,
    setNameTemplate,
    setFolderTemplate,
    setKeywordsTemplate,
    setBeginner,
    createVariableFromSelection,
    addListVariable,
    addTableVariable,
    removeVariable,
    renameVariable,
    setListValues,
    addTableColumn,
    removeTableColumn,
    renameTableColumn,
    setTableColumnValues,
  }), [
    state, canUndo, canRedo, undo, redo, resetAll,
    setUrlTemplate, setNameTemplate, setFolderTemplate, setKeywordsTemplate, setBeginner,
    createVariableFromSelection,
    addListVariable, addTableVariable, removeVariable, renameVariable,
    setListValues, addTableColumn, removeTableColumn, renameTableColumn, setTableColumnValues,
  ])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

/**
 * Helper for editors that work with multiline textareas where one line == one value.
 */
export function valuesToText(values: string[]): string {
  return joinLines(values)
}
