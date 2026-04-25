import { useCallback, useEffect, useRef } from 'react'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'

import type { TokenInfo } from '../lib/templateTokens'

interface TemplateSectionProps {
  value: string
  onChange: (nextValue: string) => void
  invalidTokens: TokenInfo[]
  missingTokens: TokenInfo[]
}

const TokenChip = ({ token, className }: { token: string; className: string }) => (
  <span className={`rounded px-2 py-1 text-sm ${className}`}>{`{{ ${token} }}`}</span>
)

export const TemplateSection = ({ value, onChange, invalidTokens, missingTokens }: TemplateSectionProps) => {
  const editor = useCreateBlockNote()
  const isSyncingRef = useRef(false)

  useEffect(() => {
    let disposed = false

    const syncFromValue = async () => {
      if (!editor || isSyncingRef.current) {
        return
      }

      const currentMarkdown = await editor.blocksToMarkdownLossy(editor.document)
      if (currentMarkdown.trim() === value.trim()) {
        return
      }

      isSyncingRef.current = true
      const blocks = await editor.tryParseMarkdownToBlocks(value || ' ')
      if (!disposed) {
        editor.replaceBlocks(editor.document, blocks)
      }
      isSyncingRef.current = false
    }

    syncFromValue().catch(() => {
      isSyncingRef.current = false
    })

    return () => {
      disposed = true
    }
  }, [editor, value])

  const handleEditorChange = useCallback(async () => {
    if (!editor || isSyncingRef.current) {
      return
    }

    const markdown = await editor.blocksToMarkdownLossy(editor.document)
    onChange(markdown)
  }, [editor, onChange])

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Use list items to define your structure. Example:
        <code className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
          - folder: {'{{ cluster }}'}
        </code>
      </p>

      <div className="rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
        <BlockNoteView editor={editor} onChange={handleEditorChange} className="min-h-72" />
      </div>

      <div aria-live="polite" className="space-y-2">
        {invalidTokens.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Invalid handlebars syntax</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {invalidTokens.map((token) => (
                <TokenChip key={`invalid-${token.start}-${token.token}`} token={token.token} className="token-invalid" />
              ))}
            </div>
          </div>
        ) : null}

        {missingTokens.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Missing variables</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {missingTokens.map((token) => (
                <TokenChip key={`missing-${token.start}-${token.token}`} token={token.token} className="token-missing" />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
