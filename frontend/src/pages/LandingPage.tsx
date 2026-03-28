import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMuseum } from '@/hooks/useTour'
import LanguageSelector from '@/components/LanguageSelector'
import type { TourType } from '@/types'
import i18n from '@/i18n'

export default function LandingPage() {
  const { museumSlug } = useParams<{ museumSlug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: museum, isLoading, error } = useMuseum(museumSlug ?? '')

  const [selectedLang, setSelectedLang] = useState(i18n.language)
  const [selectedTour, setSelectedTour] = useState<TourType | null>(null)

  function handleLangChange(lang: string) {
    setSelectedLang(lang)
    i18n.changeLanguage(lang)
  }

  function handleStart() {
    if (!selectedTour || !museumSlug) return
    navigate(`/tour/${museumSlug}/${selectedTour}?lang=${selectedLang}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    )
  }

  if (error || !museum) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    )
  }

  const museumName = museum.name[selectedLang] ?? museum.name[museum.languages[0]]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero image */}
      <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
        {museum.heroImageUrl && (
          <img
            src={museum.heroImageUrl}
            alt={museumName}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 right-4 text-white text-2xl font-bold">
          {museumName}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 flex-1">
        <LanguageSelector
          languages={museum.languages}
          selected={selectedLang}
          onChange={handleLangChange}
        />

        {/* Tour type selection */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3">{t('landing.chooseTour')}</p>
          <div className="flex flex-col gap-3">
            {museum.tours.map((tour) => {
              const label = tour.type === 'fast' ? t('landing.fastTour') : t('landing.fullTour')
              const isSelected = selectedTour === tour.type
              return (
                <button
                  key={tour.type}
                  onClick={() => setSelectedTour(tour.type as TourType)}
                  className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-colors ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{label}</span>
                    <span className="text-sm text-gray-500">
                      {t('landing.minutes', { count: tour.estimatedMinutes })}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleStart}
            disabled={!selectedTour}
            className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            {t('landing.startTour')}
          </button>
        </div>
      </div>
    </div>
  )
}
