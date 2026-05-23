import type { ReactNode } from 'react'
import type { FragmentKind } from '../types'

interface PillProps {
  kind: FragmentKind
  label?: string
  children: ReactNode
  title?: string
  style?: React.CSSProperties
}

const KIND_CLASS: Record<FragmentKind, string> = {
  scheme: 'bw-pill--scheme',
  domain: 'bw-pill--domain',
  port: 'bw-pill--port',
  path: 'bw-pill--path',
  qkey: 'bw-pill--qkey',
  qvalue: 'bw-pill--qvalue',
  fragment: 'bw-pill--fragment',
  variable: 'bw-pill--variable',
  literal: 'bw-pill--qvalue',
}

export function Pill({ kind, label, children, title, style }: PillProps) {
  return (
    <span className={`bw-pill ${KIND_CLASS[kind]}`} title={title} style={style}>
      {label && (
        <span className="sr-only">{label}: </span>
      )}
      <span className="bw-monospace truncate">{children}</span>
    </span>
  )
}
