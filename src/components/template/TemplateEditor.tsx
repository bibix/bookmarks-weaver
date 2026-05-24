import '@blocknote/mantine/style.css'
import { filterSuggestionItems } from '@blocknote/core'
import { BlockNoteView } from '@blocknote/mantine'
import {
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppState } from '../../contexts/AppStateContext'
import { useTheme } from '../../contexts/ThemeContext'
import { blocksToTemplateNodes, templateNodesToBlocks } from './conversion'
import { templateSchema, type TemplateEditorInstance } from './schema'
import { getTemplateSlashMenuItems } from './slashMenu'

/**
 * Hash a template tree to a string we can compare against to detect external
 * (library-load) replacements. Editor-driven edits round-trip through the
 * same conversion so the hash will match what we last wrote.
 */
function hashTemplate(nodes: ReturnType<typeof blocksToTemplateNodes>): string {
  return JSON.stringify(nodes)
}

export function TemplateEditor() {
  const { t } = useTranslation()
  const { state, setTemplate } = useAppState()
  const { mode } = useTheme()

  // BlockNote's theme prop is a literal "light" | "dark"; `system` mode in
  // our app resolves to the html.dark class set by ThemeContext, so we
  // mirror it here and listen for class changes.
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark'),
  )
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [mode])

  // BlockNote needs an initial document. We snapshot the current template
  // once per editor instance; further updates are pushed back through
  // `setTemplate` from the editor's `onChange`.
  const initialContent = useMemo(
    () => {
      const blocks = templateNodesToBlocks(state.template)
      return blocks.length > 0
        ? blocks
        : [{ type: 'paragraph' as const, content: '' }]
    },
    // Reinitialise only when AppState's template differs from what the
    // editor itself produced. See effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const editor: TemplateEditorInstance = useCreateBlockNote({
    schema: templateSchema,
    initialContent,
  })

  // Track the last serialisation we pushed into AppState so that if the
  // template is replaced from elsewhere (loading a saved library entry,
  // undo/redo, reset) we can detect it and refill the editor.
  const lastWritten = useRef<string>(hashTemplate(state.template))

  useEffect(() => {
    const current = hashTemplate(state.template)
    if (current === lastWritten.current) return
    // External change — replace the editor document.
    const blocks = templateNodesToBlocks(state.template)
    const ids = editor.document.map((b) => b.id)
    editor.replaceBlocks(
      ids,
      blocks.length > 0 ? blocks : [{ type: 'paragraph', content: '' }],
    )
    lastWritten.current = current
  }, [state.template, editor])

  const handleChange = () => {
    const nodes = blocksToTemplateNodes(editor.document)
    const hash = hashTemplate(nodes)
    if (hash === lastWritten.current) return
    lastWritten.current = hash
    setTemplate(nodes)
  }

  return (
    <div className="bw-editor bw-editor--blocknote" aria-label={t('template.editor')}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme={isDark ? 'dark' : 'light'}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(getTemplateSlashMenuItems(editor, t), query)
          }
        />
      </BlockNoteView>
    </div>
  )
}
