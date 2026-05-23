const PALETTE = [
  '#fbcfe8', '#fde68a', '#bbf7d0', '#bfdbfe', '#e9d5ff',
  '#fed7aa', '#a5f3fc', '#fecaca', '#ddd6fe', '#c7d2fe',
]

const PALETTE_DARK = [
  '#831843', '#78350f', '#14532d', '#1e3a8a', '#581c87',
  '#7c2d12', '#155e75', '#7f1d1d', '#4c1d95', '#3730a3',
]

/** Stable colour assignment for a string identifier. */
export function colorFor(name: string, dark = false): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  const list = dark ? PALETTE_DARK : PALETTE
  return list[hash % list.length]
}

export function uid(prefix = 'v'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}
