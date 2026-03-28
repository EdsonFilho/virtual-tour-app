import AudioPlayer from './AudioPlayer'
import { useAudio } from '@/hooks/useAudio'
import { useTranslation } from 'react-i18next'
import type { Step, Language } from '@/types'

interface Props {
  step: Step
  lang: Language
}

export default function StepDirections({ step, lang }: Props) {
  const { t } = useTranslation()
  const content = step.content[lang] ?? Object.values(step.content)[0]

  const audio = useAudio({
    stepId: step.id,
    lang,
    initialAudioUrl: content?.audioUrl ?? null,
  })

  if (!content) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Direction header */}
      <div className="flex items-center gap-2 text-gray-500">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="text-sm font-medium uppercase tracking-wide">{t('player.directions')}</span>
      </div>

      {/* Image if available */}
      {step.imageUrls.length > 0 && (
        <div className="w-full aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={step.imageUrls[0]}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title + audio */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{content.title}</h2>
        <AudioPlayer
          isPlaying={audio.isPlaying}
          isLoading={audio.isLoading}
          error={audio.error}
          onToggle={audio.toggle}
        />
      </div>

      <p className="text-gray-600 leading-relaxed">{content.description}</p>
    </div>
  )
}
