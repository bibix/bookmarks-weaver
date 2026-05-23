import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  return (
    <label className="flex items-center gap-1 text-sm">
      <span className="sr-only">{t('controls.language')}</span>
      <select
        className="bw-select max-w-[8rem]"
        value={i18n.resolvedLanguage}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label={t('controls.language')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  )
}
