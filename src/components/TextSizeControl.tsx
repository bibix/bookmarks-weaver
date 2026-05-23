import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'

export function TextSizeControl() {
  const { t } = useTranslation()
  const { textScale, increaseTextScale, decreaseTextScale, resetTextScale } = useTheme()
  const percent = Math.round(textScale * 100)
  return (
    <div className="flex items-center gap-1" role="group" aria-label={t('controls.textSize')}>
      <button
        type="button"
        className="bw-button-ghost"
        onClick={decreaseTextScale}
        aria-label={t('controls.textSizeDecrease')}
        title={t('controls.textSizeDecrease')}
      >
        A−
      </button>
      <button
        type="button"
        className="bw-button-ghost"
        onClick={resetTextScale}
        aria-label={`${t('controls.textSizeReset')} (${percent}%)`}
        title={`${t('controls.textSizeReset')} (${percent}%)`}
      >
        {percent}%
      </button>
      <button
        type="button"
        className="bw-button-ghost"
        onClick={increaseTextScale}
        aria-label={t('controls.textSizeIncrease')}
        title={t('controls.textSizeIncrease')}
      >
        A+
      </button>
    </div>
  )
}
