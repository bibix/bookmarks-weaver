import { useTranslation } from 'react-i18next'

export function SkipLink() {
  const { t } = useTranslation()
  return (
    <a href="#bw-main" className="bw-skip-link">
      {t('app.skipToContent')}
    </a>
  )
}
