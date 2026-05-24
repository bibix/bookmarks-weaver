import { useEffect, useRef } from 'react'

/**
 * Stop Tab / Shift-Tab native keydown events from bubbling out of our custom
 * block, so BlockNote / ProseMirror don't try to indent or outdent the
 * surrounding block while the user is just walking through the block's own
 * inputs and buttons.
 *
 * Returns a ref to attach to the block's outermost wrapper element. A
 * native listener is used (rather than React's `onKeyDown`) because React
 * synthetic events fire after ProseMirror's native handlers — by then
 * `stopPropagation` is too late.
 */
export function useStopBlockNoteTabbing<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      // Only swallow Tab when focus is on an interactive control we
      // rendered (input, textarea, button, link). For anything else, let
      // BlockNote do its thing.
      const target = event.target as HTMLElement | null
      if (!target) return
      const tag = target.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'BUTTON' ||
        tag === 'A' ||
        target.isContentEditable === false &&
          target.getAttribute?.('role') === 'button'
      ) {
        event.stopPropagation()
      }
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [])
  return ref
}
