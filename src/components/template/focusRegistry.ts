/**
 * Cross-component signal for "this block was just created — please focus
 * its first input". Used by the slash menu (which knows which block was
 * inserted) to hand off to the block's React render (which holds the
 * actual input ref). Keys are block ids.
 */
const pendingFolderFocus = new Set<string>()

export function markFolderForAutoFocus(blockId: string): void {
  pendingFolderFocus.add(blockId)
}

/**
 * Returns true exactly once per `markFolderForAutoFocus` call. After
 * consumption the id is forgotten so re-renders don't keep stealing focus.
 */
export function consumeFolderAutoFocus(blockId: string): boolean {
  if (!pendingFolderFocus.has(blockId)) return false
  pendingFolderFocus.delete(blockId)
  return true
}
