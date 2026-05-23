import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { ThemeControls } from './ThemeControls'
import { LanguageSwitcher } from './LanguageSwitcher'
import { TextSizeControl } from './TextSizeControl'

export function Header() {
  const { t } = useTranslation()
  const { state, setBeginner, undo, redo, canUndo, canRedo, resetAll } = useAppState()
  return (
    <header className="bw-surface border-b mb-6 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-col mr-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('app.title')}</h1>
          <p className="bw-muted text-sm">{t('app.tagline')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('controls.theme')}>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={state.beginner}
              onChange={(e) => setBeginner(e.target.checked)}
              aria-describedby="mode-hint"
            />
            {state.beginner ? t('modes.beginner') : t('modes.expert')}
          </label>
          <span id="mode-hint" className="sr-only">{t('modes.toggleHint')}</span>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={undo}
            disabled={!canUndo}
            aria-label={t('controls.undo')}
            title={`${t('controls.undo')} (Ctrl+Z)`}
          >
            ⟲
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={redo}
            disabled={!canRedo}
            aria-label={t('controls.redo')}
            title={`${t('controls.redo')} (Ctrl+Shift+Z)`}
          >
            ⟳
          </button>
          <button
            type="button"
            className="bw-button-ghost"
            onClick={resetAll}
            title={t('controls.reset')}
          >
            {t('controls.reset')}
          </button>
          <TextSizeControl />
          <LanguageSwitcher />
          <ThemeControls />
        </div>
      </div>
    </header>
  )
}
