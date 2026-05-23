import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toIdentifier } from '../utils/urlParser'

interface SelectionPopupProps {
  x: number
  y: number
  selectionText: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function SelectionPopup({ x, y, selectionText, onConfirm, onCancel }: SelectionPopupProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [name, setName] = useState(() => toIdentifier(selectionText.slice(0, 24) || 'variable'))

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      role="dialog"
      aria-label={t('a11y.selectionPopup')}
      className="bw-surface shadow-lg rounded-xl p-3 flex items-center gap-2"
      style={{
        position: 'fixed',
        left: Math.max(8, Math.min(window.innerWidth - 320, x - 160)),
        top: y - window.scrollY,
        zIndex: 50,
        width: 'min(320px, calc(100vw - 16px))',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        className="bw-button"
        aria-label={t('selection.create')}
        title={t('selection.create')}
        onClick={() => onConfirm(name)}
      >
        ＋
      </button>
      <input
        ref={inputRef}
        className="bw-input"
        aria-label={t('selection.namePrompt')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onConfirm(name)
          }
        }}
      />
      <button
        type="button"
        className="bw-button-ghost"
        onClick={onCancel}
        aria-label={t('selection.cancel')}
      >
        ✕
      </button>
    </div>
  )
}
