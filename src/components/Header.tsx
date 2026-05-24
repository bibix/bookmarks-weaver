import { useTranslation } from 'react-i18next'
import { useAppState } from '../contexts/AppStateContext'
import { ThemeControls } from './ThemeControls'
import { LanguageSwitcher } from './LanguageSwitcher'
import { TextSizeControl } from './TextSizeControl'

export function Header() {
  const { t } = useTranslation()
  const { undo, redo, canUndo, canRedo, resetAll } = useAppState()
  return (
    <header className="bw-surface border-b mb-6 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-col mr-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('app.title')}</h1>
          <p className="bw-muted text-sm">{t('app.tagline')}</p>
        </div>
        <div className="bw-header__controls">
          <div className="bw-header__group" role="group" aria-labelledby="bw-grp-history">
            <span id="bw-grp-history" className="bw-header__grouplabel">{t('controls.history')}</span>
            <div className="bw-header__groupbuttons">
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
            </div>
          </div>
          <div className="bw-header__group" role="group" aria-labelledby="bw-grp-view">
            <span id="bw-grp-view" className="bw-header__grouplabel">{t('controls.view')}</span>
            <div className="bw-header__groupbuttons">
              <TextSizeControl />
              <ThemeControls />
            </div>
          </div>
          <div className="bw-header__group" role="group" aria-labelledby="bw-grp-locale">
            <span id="bw-grp-locale" className="bw-header__grouplabel">{t('controls.locale')}</span>
            <div className="bw-header__groupbuttons">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
