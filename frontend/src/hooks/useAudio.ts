import { useState, useRef, useCallback, useEffect } from 'react'
import { requestTTS } from '@/api'
import type { Language } from '@/types'

interface UseAudioOptions {
  stepId: string
  lang: Language
  initialAudioUrl: string | null
}

export function useAudio({ stepId, lang, initialAudioUrl }: UseAudioOptions) {
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reset when step changes
  useEffect(() => {
    setAudioUrl(initialAudioUrl)
    setIsPlaying(false)
    setError(null)
  }, [stepId, lang, initialAudioUrl])

  const resolveAudioUrl = useCallback(async (): Promise<string | null> => {
    if (audioUrl) return audioUrl
    setIsLoading(true)
    try {
      const url = await requestTTS(stepId, lang)
      setAudioUrl(url)
      return url
    } catch {
      setError('Failed to load audio')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [audioUrl, stepId, lang])

  const play = useCallback(async () => {
    const url = await resolveAudioUrl()
    if (!url) return

    if (!audioRef.current) {
      audioRef.current = new Audio(url)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => {
        setError('Audio playback failed')
        setIsPlaying(false)
      }
    } else {
      audioRef.current.src = url
    }

    await audioRef.current.play()
    setIsPlaying(true)
  }, [resolveAudioUrl])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  return { isPlaying, isLoading, error, toggle, play, pause }
}
