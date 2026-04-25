interface LanguageOption {
  value: string
  label: string
}

interface LanguageThemeControlsProps {
  language: string
  languageOptions: LanguageOption[]
  onLanguageChange: (nextValue: string) => void
  themeMode: 'light' | 'dark'
  onThemeModeChange: (nextMode: 'light' | 'dark') => void
  contrastMode: 'standard' | 'high'
  onContrastModeChange: (nextMode: 'standard' | 'high') => void
  textScale: number
  onTextScaleChange: (nextScale: number) => void
}

export const LanguageThemeControls = ({
  language,
  languageOptions,
  onLanguageChange,
  themeMode,
  onThemeModeChange,
  contrastMode,
  onContrastModeChange,
  textScale,
  onTextScaleChange,
}: LanguageThemeControlsProps) => (
  <aside
    aria-label="Display and language controls"
    className="rounded-xl border border-slate-300/70 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
  >
    <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Preferences</h2>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300" htmlFor="language-select">
        <span className="font-medium text-slate-900 dark:text-slate-100">Language</span>
        <select
          id="language-select"
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300" htmlFor="theme-mode-select">
        <span className="font-medium text-slate-900 dark:text-slate-100">Theme mode</span>
        <select
          id="theme-mode-select"
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
          value={themeMode}
          onChange={(event) => onThemeModeChange(event.target.value as 'light' | 'dark')}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>

      <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300" htmlFor="contrast-select">
        <span className="font-medium text-slate-900 dark:text-slate-100">Contrast</span>
        <select
          id="contrast-select"
          className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
          value={contrastMode}
          onChange={(event) => onContrastModeChange(event.target.value as 'standard' | 'high')}
        >
          <option value="standard">Standard</option>
          <option value="high">High</option>
        </select>
      </label>

      <label className="space-y-1 text-sm text-slate-700 dark:text-slate-300" htmlFor="text-size-range">
        <span className="font-medium text-slate-900 dark:text-slate-100">Text size ({textScale}%)</span>
        <input
          id="text-size-range"
          type="range"
          min={100}
          max={200}
          step={10}
          value={textScale}
          onChange={(event) => onTextScaleChange(Number(event.target.value))}
          className="w-full"
        />
      </label>
    </div>
  </aside>
)
