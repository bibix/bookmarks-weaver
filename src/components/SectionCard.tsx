import type { ReactNode } from 'react'

interface SectionCardProps {
  id: string
  title: string
  description: string
  children: ReactNode
}

export const SectionCard = ({ id, title, description, children }: SectionCardProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className="rounded-xl border border-slate-300/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
  >
    <header className="mb-3">
      <h2 id={`${id}-title`} className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="text-sm text-slate-700 dark:text-slate-300">{description}</p>
    </header>
    {children}
  </section>
)
