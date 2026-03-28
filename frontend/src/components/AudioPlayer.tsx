import { useTranslation } from 'react-i18next'

interface Props {
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  onToggle: () => void
}

export default function AudioPlayer({ isPlaying, isLoading, error, onToggle }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggle}
        disabled={isLoading}
        aria-label={isPlaying ? t('player.pauseAudio') : t('player.playAudio')}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 text-white disabled:opacity-50 hover:bg-gray-700 transition-colors"
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          // Pause icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          // Play icon
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      {isPlaying && (
        <div className="flex gap-0.5 items-end h-4">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1 bg-gray-900 rounded-full animate-pulse"
              style={{ height: `${(i % 3) * 4 + 4}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
