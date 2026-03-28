import { useState } from 'react'
import AudioPlayer from './AudioPlayer'
import { useAudio } from '@/hooks/useAudio'
import type { Step, Language } from '@/types'

interface Props {
  step: Step
  lang: Language
}

export default function StepArtwork({ step, lang }: Props) {
  const [imgIndex, setImgIndex] = useState(0)
  const content = step.content[lang] ?? Object.values(step.content)[0]

  const audio = useAudio({
    stepId: step.id,
    lang,
    initialAudioUrl: content?.audioUrl ?? null,
  })

  if (!content) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Image carousel */}
      {step.imageUrls.length > 0 && (
        <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={step.imageUrls[imgIndex]}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          {step.imageUrls.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {step.imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === imgIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title + audio */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{content.title}</h1>
        <AudioPlayer
          isPlaying={audio.isPlaying}
          isLoading={audio.isLoading}
          error={audio.error}
          onToggle={audio.toggle}
        />
      </div>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed text-base">{content.description}</p>
    </div>
  )
}
