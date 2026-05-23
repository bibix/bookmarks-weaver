import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Palette = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'high-contrast'

interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  palette: Palette
  setPalette: (palette: Palette) => void
  textScale: number
  setTextScale: (scale: number) => void
  increaseTextScale: () => void
  decreaseTextScale: () => void
  resetTextScale: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const MODE_KEY = 'bw.theme.mode'
const PALETTE_KEY = 'bw.theme.palette'
const SCALE_KEY = 'bw.theme.scale'

const MIN_SCALE = 0.85
const MAX_SCALE = 1.6
const SCALE_STEP = 0.1

function readStored<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const value = localStorage.getItem(key) as T | null
    return value && allowed.includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

function readNumber(key: string, fallback: number): number {
  try {
    const value = Number(localStorage.getItem(key))
    return Number.isFinite(value) && value > 0 ? value : fallback
  } catch {
    return fallback
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeRaw] = useState<ThemeMode>(() =>
    readStored<ThemeMode>(MODE_KEY, 'system', ['light', 'dark', 'system']),
  )
  const [palette, setPaletteRaw] = useState<Palette>(() =>
    readStored<Palette>(PALETTE_KEY, 'default', [
      'default', 'deuteranopia', 'protanopia', 'tritanopia', 'high-contrast',
    ]),
  )
  const [textScale, setTextScaleRaw] = useState<number>(() => readNumber(SCALE_KEY, 1))

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const effectiveDark =
        mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', effectiveDark)
    }
    apply()
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
    return undefined
  }, [mode])

  useEffect(() => {
    document.documentElement.dataset.palette = palette
  }, [palette])

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(textScale))
  }, [textScale])

  const setMode = useCallback((next: ThemeMode) => {
    setModeRaw(next)
    try { localStorage.setItem(MODE_KEY, next) } catch { /* ignore */ }
  }, [])

  const setPalette = useCallback((next: Palette) => {
    setPaletteRaw(next)
    try { localStorage.setItem(PALETTE_KEY, next) } catch { /* ignore */ }
  }, [])

  const setTextScale = useCallback((next: number) => {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(next.toFixed(2))))
    setTextScaleRaw(clamped)
    try { localStorage.setItem(SCALE_KEY, String(clamped)) } catch { /* ignore */ }
  }, [])

  const increaseTextScale = useCallback(() => setTextScale(textScale + SCALE_STEP), [setTextScale, textScale])
  const decreaseTextScale = useCallback(() => setTextScale(textScale - SCALE_STEP), [setTextScale, textScale])
  const resetTextScale = useCallback(() => setTextScale(1), [setTextScale])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, palette, setPalette, textScale, setTextScale, increaseTextScale, decreaseTextScale, resetTextScale }),
    [mode, setMode, palette, setPalette, textScale, setTextScale, increaseTextScale, decreaseTextScale, resetTextScale],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
