import { useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTour } from '@/hooks/useTour'
import ProgressBar from '@/components/ProgressBar'
import StepArtwork from '@/components/StepArtwork'
import StepDirections from '@/components/StepDirections'
import type { Language } from '@/types'

export default function TourPlayerPage() {
  const { museumSlug, tourType } = useParams<{ museumSlug: string; tourType: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const lang = (searchParams.get('lang') ?? 'en') as Language
  const { data: tour, isLoading, error } = useTour(museumSlug ?? '', tourType ?? '')

  // Track skipped step IDs in session storage
  const [skippedIds, setSkippedIds] = useState<Set<string>>(() => {
    const saved = sessionStorage.getItem(`skipped-${museumSlug}-${tourType}`)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })

  const [currentIndex, setCurrentIndex] = useState(0)

  const steps = useMemo(() => tour?.steps ?? [], [tour])
  const currentStep = steps[currentIndex]
  const isLast = currentIndex === steps.length - 1

  function skip() {
    const newSkipped = new Set(skippedIds)
    if (currentStep) newSkipped.add(currentStep.id)
    setSkippedIds(newSkipped)
    sessionStorage.setItem(
      `skipped-${museumSlug}-${tourType}`,
      JSON.stringify([...newSkipped]),
    )
    goNext()
  }

  function goNext() {
    if (currentIndex < steps.length - 1) setCurrentIndex((i) => i + 1)
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    )
  }

  // Tour complete screen
  if (currentIndex >= steps.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-5xl">🎨</div>
        <h1 className="text-2xl font-bold text-gray-900">{t('player.tourComplete')}</h1>
        <p className="text-gray-500">{t('player.thankYou')}</p>
        <button
          onClick={() => navigate(`/tour/${museumSlug}`)}
          className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
        >
          {t('player.backToMuseum')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 z-10">
        <ProgressBar current={currentIndex + 1} total={steps.length} />
      </div>

      {/* Step content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {currentStep.type === 'artwork' ? (
          <StepArtwork key={currentStep.id} step={currentStep} lang={lang} />
        ) : (
          <StepDirections key={currentStep.id} step={currentStep} lang={lang} />
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          {t('player.back')}
        </button>

        <button
          onClick={skip}
          className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
        >
          {t('player.skip')}
        </button>

        <button
          onClick={isLast ? () => setCurrentIndex(steps.length) : goNext}
          className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
        >
          {t('player.next')}
        </button>
      </div>
    </div>
  )
}
