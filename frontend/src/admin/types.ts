import type { Language, TourType, StepType } from '@/types'

export interface MuseumWritePayload {
  id: string
  slug: string
  name: Record<Language, string>
  languages: Language[]
  location: string
  heroImageUrl: string
}

export interface TourWritePayload {
  id: string
  type: TourType
  estimatedMinutes: number
  stepIds: string[]
}

export interface StepWritePayload {
  id: string
  type: StepType
  order: number
  imageUrls: string[]
  content: Record<Language, {
    title: string
    description: string
    audioUrl: string | null
  }>
}

export interface AdminUser {
  userId: string
  email: string
}
