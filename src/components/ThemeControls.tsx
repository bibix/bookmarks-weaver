import { useTranslation } from 'react-i18next'
import { useTheme, type Palette, type ThemeMode } from '../contexts/ThemeContext'

export function ThemeControls() {
  const { t } = useTranslation()
  const { mode, setMode, palette, setPalette } = useTheme()

  return (
    <>
      <label className="flex items-center gap-1 text-sm">
        <span className="sr-only">{t('controls.theme')}</span>
        <select
          className="bw-select max-w-[8rem]"
          value={mode}
          onChange={(e) => setMode(e.target.value as ThemeMode)}
          aria-label={t('controls.theme')}
        >
          <option value="system">{t('controls.themeSystem')}</option>
          <option value="light">{t('controls.themeLight')}</option>
          <option value="dark">{t('controls.themeDark')}</option>
        </select>
      </label>
      <label className="flex items-center gap-1 text-sm">
        <span className="sr-only">{t('controls.palette')}</span>
        <select
          className="bw-select max-w-[10rem]"
          value={palette}
          onChange={(e) => setPalette(e.target.value as Palette)}
          aria-label={t('controls.palette')}
        >
          <option value="default">{t('controls.paletteDefault')}</option>
          <option value="deuteranopia">{t('controls.paletteDeuteranopia')}</option>
          <option value="protanopia">{t('controls.paletteProtanopia')}</option>
          <option value="tritanopia">{t('controls.paletteTritanopia')}</option>
          <option value="high-contrast">{t('controls.paletteHighContrast')}</option>
        </select>
      </label>
    </>
  )
}
