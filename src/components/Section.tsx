import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  title: string
  description?: string
  step?: number
  showStep?: boolean
  actions?: ReactNode
  children: ReactNode
}

export function Section({ id, title, description, step, showStep, actions, children }: SectionProps) {
  const labelId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={labelId}
      className="bw-surface rounded-2xl p-4 sm:p-6 mb-6 shadow-sm"
    >
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <h2 id={labelId} className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            {showStep && typeof step === 'number' && (
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{ background: 'var(--c-accent)', color: '#fff' }}
              >
                {step}
              </span>
            )}
            <span>{title}</span>
          </h2>
          {description && (
            <p className="bw-muted text-sm mt-1 max-w-prose">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      <div>{children}</div>
    </section>
  )
}
