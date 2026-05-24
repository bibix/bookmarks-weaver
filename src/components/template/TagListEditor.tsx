import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HandlebarsInput } from '../HandlebarsInput'

interface Props {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  ariaLabel: string
}

export function TagListEditor({ values, onChange, placeholder, ariaLabel }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLUListElement>(null)
  const [pendingFocus, setPendingFocus] = useState<number | null>(null)

  useEffect(() => {
    if (pendingFocus === null) return
    const root = containerRef.current
    if (!root) return
    const inputs = root.querySelectorAll<HTMLInputElement>('input.hb-input')
    const target = inputs[pendingFocus]
    if (target) target.focus()
    setPendingFocus(null)
  }, [pendingFocus, values])

  const update = (index: number, next: string) => {
    onChange(values.map((v, i) => (i === index ? next : v)))
  }
  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }
  const add = () => {
    onChange([...values, ''])
    setPendingFocus(values.length)
  }
  const insertAfter = (index: number) => {
    const next = [...values.slice(0, index + 1), '', ...values.slice(index + 1)]
    onChange(next)
    setPendingFocus(index + 1)
  }

  return (
    <div className="bw-taglist" role="group" aria-label={ariaLabel}>
      {values.length === 0 && (
        <p className="bw-muted text-sm">{t('template.noTags')}</p>
      )}
      <ul className="bw-taglist__items" ref={containerRef}>
        {values.map((value, i) => (
          <li key={i} className="bw-taglist__row">
            <HandlebarsInput
              value={value}
              onChange={(next) => update(i, next)}
              onEnter={() => insertAfter(i)}
              placeholder={placeholder}
              ariaLabel={`${ariaLabel} ${i + 1}`}
              className="bw-taglist__input"
            />
            <button
              type="button"
              className="bw-button-ghost"
              onClick={() => remove(i)}
              aria-label={t('template.removeTag', { index: i + 1 })}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="bw-button-ghost mt-2" onClick={add}>
        {t('template.addTag')}
      </button>
    </div>
  )
}
