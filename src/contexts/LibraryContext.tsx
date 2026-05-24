import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { TemplateNode } from '../types'
import {
  libraryAddTemplate,
  libraryCreateFolder,
  libraryDelete,
  libraryMove,
  libraryMoveWithinSiblings,
  libraryRename,
  loadLibrary,
  saveLibrary,
  type LibraryNode,
} from '../utils/storage'

interface LibraryContextValue {
  roots: LibraryNode[]
  addTemplate: (
    parentId: string | null,
    payload: { name: string; description: string; template: TemplateNode[] },
  ) => void
  createFolder: (parentId: string | null, name: string) => void
  rename: (id: string, patch: { name?: string; description?: string }) => void
  remove: (id: string) => void
  move: (id: string, destParentId: string | null, index: number) => void
  reorder: (id: string, delta: -1 | 1) => void
  refresh: () => void
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [roots, setRoots] = useState<LibraryNode[]>(() => loadLibrary())

  useEffect(() => {
    saveLibrary(roots)
  }, [roots])

  const addTemplate = useCallback(
    (
      parentId: string | null,
      payload: { name: string; description: string; template: TemplateNode[] },
    ) => {
      setRoots((prev) => libraryAddTemplate(prev, parentId, payload).roots)
    },
    [],
  )

  const createFolder = useCallback((parentId: string | null, name: string) => {
    setRoots((prev) => libraryCreateFolder(prev, parentId, name))
  }, [])

  const rename = useCallback((id: string, patch: { name?: string; description?: string }) => {
    setRoots((prev) => libraryRename(prev, id, patch))
  }, [])

  const remove = useCallback((id: string) => {
    setRoots((prev) => libraryDelete(prev, id))
  }, [])

  const move = useCallback((id: string, destParentId: string | null, index: number) => {
    setRoots((prev) => libraryMove(prev, id, destParentId, index))
  }, [])

  const reorder = useCallback((id: string, delta: -1 | 1) => {
    setRoots((prev) => libraryMoveWithinSiblings(prev, id, delta))
  }, [])

  const refresh = useCallback(() => {
    setRoots(loadLibrary())
  }, [])

  const value = useMemo<LibraryContextValue>(
    () => ({ roots, addTemplate, createFolder, rename, remove, move, reorder, refresh }),
    [roots, addTemplate, createFolder, rename, remove, move, reorder, refresh],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}
