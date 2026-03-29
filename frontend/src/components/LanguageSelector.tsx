import { useTranslation } from 'react-i18next'

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  zh: '中文',
  ja: '日本語',
  uk: 'Українська',
}

const FLAG_EMOJIS: Record<string, string> = {
  en: '🇬🇧',
  pt: '🇧🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  zh: '🇨🇳',
  ja: '🇯🇵',
  uk: '🇺🇦',
}

interface Props {
  languages: string[]
  selected: string
  onChange: (lang: string) => void
}

export default function LanguageSelector({ languages, selected, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-600 mb-2">{t('landing.selectLanguage')}</p>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onChange(lang)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selected === lang
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{FLAG_EMOJIS[lang] ?? '🌐'}</span>
            {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
