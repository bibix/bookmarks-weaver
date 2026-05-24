import { useCallback, useMemo, useRef, useState } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

const MAX_HISTORY = 100

/**
 * Reducer-style state with undo/redo. The producer receives the current value
 * and returns the next; identical values are skipped so unrelated re-renders
 * don't bloat history.
 */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState<HistoryState<T>>({ past: [], present: initial, future: [] })
  const lastCommitAt = useRef(0)

  const update = useCallback((producer: (prev: T) => T, opts?: { coalesce?: boolean }) => {
    setState((current) => {
      const next = producer(current.present)
      if (Object.is(next, current.present)) return current
      const now = Date.now()
      const coalesce = opts?.coalesce && now - lastCommitAt.current < 400
      lastCommitAt.current = now
      const newPast = coalesce ? current.past : [...current.past, current.present].slice(-MAX_HISTORY)
      return { past: newPast, present: next, future: [] }
    })
  }, [])

  const undo = useCallback(() => {
    setState((current) => {
      if (current.past.length === 0) return current
      const previous = current.past[current.past.length - 1]
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setState((current) => {
      if (current.future.length === 0) return current
      const [next, ...rest] = current.future
      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: next,
        future: rest,
      }
    })
  }, [])

  const reset = useCallback((value: T) => {
    setState({ past: [], present: value, future: [] })
  }, [])

  /**
   * Update `present` without touching `past` / `future`. Intended for
   * derived/secondary changes (e.g., variable auto-sync) that should
   * appear as part of the user's last committed edit when they undo.
   */
  const replace = useCallback((producer: (prev: T) => T) => {
    setState((current) => {
      const next = producer(current.present)
      if (Object.is(next, current.present)) return current
      return { ...current, present: next }
    })
  }, [])

  return useMemo(
    () => ({
      state: state.present,
      update,
      replace,
      undo,
      redo,
      reset,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state, update, replace, undo, redo, reset],
  )
}
